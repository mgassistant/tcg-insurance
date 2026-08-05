import { NextRequest, NextResponse } from "next/server";
import { spamCheck, getIP } from "@/lib/spam-guard";
import {
  deriveFlags,
  formatConsiliumEmailHTML,
  formatConsiliumText,
  usd,
  type QuoteIntake,
  type IntakeItem,
  type CoverageType,
} from "@/lib/intake";

const BROKERIQ_URL = process.env.BROKERIQ_URL || "https://www.broker-iq.com/api/leads/inbound";
const TCG_TENANT = process.env.BROKERIQ_TENANT_ID || "";
const SOURCE = "tcg-insurance.com";

// Email notification (Resend) — optional, degrades gracefully if unset.
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NOTIFY_TO = process.env.LEAD_NOTIFY_TO || "";
const NOTIFY_FROM = process.env.LEAD_NOTIFY_FROM || "TCG Insurance <support@tcg-insurance.com>";

// ---- Legacy (v1) value bands, kept for the old simple form path ----
const VALUE_LABELS: Record<string, string> = {
  under_10k: "Under $10k",
  "10k_50k": "$10k – $50k",
  "50k_100k": "$50k – $100k",
  "100k_500k": "$100k – $500k",
  over_500k: "Over $500k",
};

async function sendEmail(subject: string, html: string) {
  if (!RESEND_API_KEY || !NOTIFY_TO) return false; // not configured — skip silently
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: NOTIFY_TO.split(",").map((s) => s.trim()),
        subject,
        html,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Lead email notification failed:", err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// v2 — rich Consilium-ready intake
// ═══════════════════════════════════════════════════════════════════
function normalizeItem(raw: unknown): IntakeItem {
  const o = (raw || {}) as Record<string, unknown>;
  return {
    category: String(o.category || "Other").trim(),
    brandType: String(o.brandType || "").trim(),
    description: String(o.description || "").trim(),
    serialOrGrade: String(o.serialOrGrade || "").trim(),
    value: Number(o.value) || 0,
  };
}

async function handleV2(body: Record<string, unknown>) {
  const rawClient = (body.client || {}) as Record<string, unknown>;
  const client = {
    firstName: String(rawClient.firstName || "").trim(),
    lastName: String(rawClient.lastName || "").trim(),
    email: String(rawClient.email || "").trim().toLowerCase(),
    phone: String(rawClient.phone || "").trim(),
    dob: String(rawClient.dob || "").trim(),
    street: String(rawClient.street || "").trim(),
    city: String(rawClient.city || "").trim(),
    state: String(rawClient.state || "").trim(),
    zip: String(rawClient.zip || "").trim(),
    occupation: String(rawClient.occupation || "").trim(),
    social: String(rawClient.social || "").trim(),
  };

  const coverageType: CoverageType =
    body.coverageType === "blanket" ? "blanket" : "scheduled";
  const items = Array.isArray(body.items) ? body.items.map(normalizeItem) : [];

  // ---- Server-side validation ----
  const missing: string[] = [];
  if (!client.firstName) missing.push("first name");
  if (!client.lastName) missing.push("last name");
  const phoneDigits = client.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) missing.push("phone");
  if (!client.email.includes("@") || !client.email.includes(".")) missing.push("email");
  if (items.length === 0) missing.push("at least one item");
  if (items.some((it) => !(it.value > 0))) missing.push("a value for each item");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid: ${missing.join(", ")}`, missing },
      { status: 400 }
    );
  }

  const intake: QuoteIntake = {
    client,
    coverageType,
    items,
    blanketTotalItems:
      body.blanketTotalItems != null ? Number(body.blanketTotalItems) || undefined : undefined,
    blanketTotalValue:
      body.blanketTotalValue != null ? Number(body.blanketTotalValue) || undefined : undefined,
    hasDocumentation: Boolean(body.hasDocumentation),
    documentationNote: String(body.documentationNote || "").trim(),
  };

  const flags = deriveFlags(intake);
  const fullName = `${client.firstName} ${client.lastName}`.trim();
  const textIntake = formatConsiliumText(intake, flags);

  // 1) Push to BrokerIQ — map core contact fields as before; put the full
  //    Consilium-ordered intake into message + raw so nothing is lost.
  let brokerOk = false;
  let brokerResult: Record<string, unknown> = {};
  try {
    const res = await fetch(BROKERIQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email: client.email,
        phone: phoneDigits,
        message: textIntake,
        source: SOURCE,
        tenant_id: TCG_TENANT,
        lead_type: "new",
        state: client.state || "CA",
        raw: {
          version: 2,
          origin: SOURCE,
          coverageType,
          totalValue: flags.totalValue,
          itemCount: flags.itemCount,
          needsAppraisal: flags.needsAppraisal,
          mayNeedUnderwriting: flags.mayNeedUnderwriting,
          blanketPerItemExceeded: flags.blanketPerItemExceeded,
          client,
          items,
          blanketTotalItems: intake.blanketTotalItems,
          blanketTotalValue: intake.blanketTotalValue,
          hasDocumentation: intake.hasDocumentation,
          documentationNote: intake.documentationNote,
          consiliumText: textIntake,
        },
      }),
    });
    brokerResult = await res.json().catch(() => ({}));
    brokerOk = res.ok;
  } catch (err) {
    console.error("BrokerIQ submission failed:", err);
  }

  // 2) Send the Consilium-ordered email (core deliverable).
  const flagTag = flags.mayNeedUnderwriting
    ? " [UW review]"
    : flags.needsAppraisal
    ? " [appraisal]"
    : "";
  const emailOk = await sendEmail(
    `New WAX intake — ${fullName} · ${usd(flags.totalValue)}${flagTag}`,
    formatConsiliumEmailHTML(intake, flags, SOURCE)
  );

  if (!brokerOk && !emailOk) {
    return NextResponse.json(
      { success: false, error: "Could not submit your request. Please call us." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    flags: {
      needsAppraisal: flags.needsAppraisal,
      mayNeedUnderwriting: flags.mayNeedUnderwriting,
      totalValue: flags.totalValue,
    },
    ...brokerResult,
  });
}

// ═══════════════════════════════════════════════════════════════════
// v1 — legacy simple form (kept working for any deep links)
// ═══════════════════════════════════════════════════════════════════
async function handleV1(body: Record<string, unknown>) {
  const cleanName = String(body.name || "").trim();
  const cleanPhone = String(body.phone || "").replace(/\D/g, "");
  const cleanEmail = String(body.email || "").trim().toLowerCase();

  const missing: string[] = [];
  if (!cleanName || cleanName.length < 2) missing.push("name");
  if (cleanPhone.length < 10) missing.push("phone");
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) missing.push("email");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid: ${missing.join(", ")}`, missing },
      { status: 400 }
    );
  }

  const lead = {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    collectorType: String(body.collectorType || "").trim(),
    collectionValue: String(body.collectionValue || "").trim(),
    state: String(body.state || "CA").trim(),
  };
  const valueLabel = VALUE_LABELS[lead.collectionValue] || lead.collectionValue || "—";

  let brokerOk = false;
  let brokerResult: Record<string, unknown> = {};
  try {
    const res = await fetch(BROKERIQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: "",
        source: SOURCE,
        tenant_id: TCG_TENANT,
        lead_type: "new",
        state: lead.state,
        raw: {
          collectorType: lead.collectorType,
          collectionValue: lead.collectionValue,
          state: lead.state,
          origin: SOURCE,
        },
      }),
    });
    brokerResult = await res.json().catch(() => ({}));
    brokerOk = res.ok;
  } catch (err) {
    console.error("BrokerIQ submission failed:", err);
  }

  const html = `
    <h2>New TCG Insurance quote request</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif">
      <tr><td><b>Name</b></td><td>${lead.name}</td></tr>
      <tr><td><b>Email</b></td><td>${lead.email}</td></tr>
      <tr><td><b>Phone</b></td><td>${lead.phone}</td></tr>
      <tr><td><b>Type</b></td><td>${lead.collectorType || "—"}</td></tr>
      <tr><td><b>Est. value</b></td><td>${valueLabel}</td></tr>
      <tr><td><b>State</b></td><td>${lead.state || "—"}</td></tr>
    </table>
    <p style="color:#888;font-size:12px">Source: ${SOURCE}</p>`;
  const emailOk = await sendEmail(`New TCG quote — ${lead.name} (${valueLabel})`, html);

  if (!brokerOk && !emailOk) {
    return NextResponse.json(
      { success: false, error: "Could not submit your request. Please call us." },
      { status: 502 }
    );
  }
  return NextResponse.json({ success: true, ...brokerResult });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = getIP(req);

    // Spam check (honeypot / speed / rate-limit / gibberish / disposable)
    const spam = spamCheck(body, ip);
    if (spam) return spam;

    // Route by shape: v2 rich intake has an `items` array + `client`.
    if (Array.isArray(body.items) || body.version === 2) {
      return await handleV2(body);
    }
    return await handleV1(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
