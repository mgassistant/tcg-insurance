import { NextRequest, NextResponse } from "next/server";
import { spamCheck, getIP } from "@/lib/spam-guard";

const BROKERIQ_URL = process.env.BROKERIQ_URL || "https://www.broker-iq.com/api/leads/inbound";
const TCG_TENANT = process.env.BROKERIQ_TENANT_ID || "";
const SOURCE = "tcg-insurance.com";

// Email notification (Resend) — optional, degrades gracefully if unset.
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NOTIFY_TO = process.env.LEAD_NOTIFY_TO || "";
const NOTIFY_FROM = process.env.LEAD_NOTIFY_FROM || "TCG Insurance <support@tcg-insurance.com>";

const VALUE_LABELS: Record<string, string> = {
  under_10k: "Under $10k",
  "10k_50k": "$10k – $50k",
  "50k_100k": "$50k – $100k",
  "100k_500k": "$100k – $500k",
  over_500k: "Over $500k",
};

async function sendEmailNotification(lead: {
  name: string; email: string; phone: string;
  collectorType: string; collectionValue: string; state: string;
}) {
  if (!RESEND_API_KEY || !NOTIFY_TO) return; // not configured yet — skip silently
  const valueLabel = VALUE_LABELS[lead.collectionValue] || lead.collectionValue || "—";
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
    <p style="color:#888;font-size:12px">Source: ${SOURCE}</p>
  `;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: NOTIFY_TO.split(",").map((s) => s.trim()),
        subject: `New TCG quote — ${lead.name} (${valueLabel})`,
        html,
      }),
    });
  } catch (err) {
    // Never let email failure block the lead
    console.error("Lead email notification failed:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = getIP(req);

    // Spam check
    const spam = spamCheck(body, ip);
    if (spam) return spam;

    const { name, phone, email, collectorType, collectionValue, state } = body;

    // Validate + normalize
    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").replace(/\D/g, "");
    const cleanEmail = (email || "").trim().toLowerCase();

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
      collectorType: (collectorType || "").trim(),
      collectionValue: (collectionValue || "").trim(),
      state: (state || "CA").trim(),
    };

    // 1) Push to BrokerIQ (single entry point: validation, enrichment, auto-contact)
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

    // 2) Send our own email notification (independent of BrokerIQ)
    await sendEmailNotification(lead);

    // Succeed if at least one delivery channel worked
    if (!brokerOk && !(RESEND_API_KEY && NOTIFY_TO)) {
      return NextResponse.json(
        { success: false, error: "Could not submit your request. Please call us." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, ...brokerResult });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
