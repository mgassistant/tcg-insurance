import { NextRequest, NextResponse } from "next/server";
import { spamCheck, getIP } from "@/lib/spam-guard";
import {
  deriveFlags,
  formatConsiliumEmailHTML,
  formatConsiliumText,
  specForCategory,
  requiresGrade,
  usd,
  type QuoteIntake,
  type IntakeItem,
  type CoverageType,
} from "@/lib/intake";
import {
  deriveDealerFlags,
  formatDealerEmailHTML,
  formatDealerText,
  type DealerIntake,
} from "@/lib/dealer";

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
  const fieldsIn = (o.fields || {}) as Record<string, unknown>;
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(fieldsIn)) {
    fields[k] = String(v ?? "").trim();
  }
  return {
    category: String(o.category || "Other").trim(),
    brandType: String(o.brandType || "").trim(),
    description: String(o.description || "").trim(),
    serialOrGrade: String(o.serialOrGrade || "").trim(),
    value: Number(o.value) || 0,
    fields,
    earnsOver15k:
      o.earnsOver15k === undefined || o.earnsOver15k === null
        ? undefined
        : Boolean(o.earnsOver15k),
    useIncomeConfirmed:
      o.useIncomeConfirmed === undefined || o.useIncomeConfirmed === null
        ? undefined
        : Boolean(o.useIncomeConfirmed),
    storage: o.storage === undefined ? undefined : String(o.storage ?? "").trim(),
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
  // Cameras / instruments require the income Yes/No to be answered.
  if (
    items.some(
      (it) =>
        specForCategory(it.category).incomeConfirmation &&
        it.earnsOver15k === undefined
    )
  )
    missing.push("the >$15K income-from-use question for cameras/instruments");
  // Cards / memorabilia / collectibles require storage details.
  if (
    items.some(
      (it) => specForCategory(it.category).requiresStorage && !(it.storage || "").trim()
    )
  )
    missing.push("storage details (when/how stored) for cards/memorabilia");
  // Numismatics (coins/stamps/currency) require a grade on every item.
  if (
    items.some((it) => requiresGrade(it.category) && !((it.fields?.grade || "").trim()))
  )
    missing.push("a grade for each coin/stamp/currency item");

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
          creditEligible: flags.creditEligible,
          eligibilityIssues: flags.eligibilityIssues,
          hasDecline: flags.eligibilityIssues.some((e) => e.severity === "decline"),
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
  const hasDecline = flags.eligibilityIssues.some((e) => e.severity === "decline");
  const flagTag = hasDecline
    ? " [ELIGIBILITY]"
    : flags.mayNeedUnderwriting
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
// ═══════════════════════════════════════════════════════════════════
// v3 — DEALER / SHOP intake
// ═══════════════════════════════════════════════════════════════════
function num(v: unknown): number {
  return Number(v) || 0;
}
function str(v: unknown): string {
  return String(v ?? "").trim();
}
function triBool(v: unknown): boolean | null {
  if (v === true || v === "yes" || v === "YES") return true;
  if (v === false || v === "no" || v === "NO") return false;
  return null;
}

function normalizeDealer(body: Record<string, unknown>): DealerIntake {
  const b = (body.business || {}) as Record<string, unknown>;
  const s = (body.stock || {}) as Record<string, unknown>;
  const lm = (body.limits || {}) as Record<string, unknown>;
  const h = (body.history || {}) as Record<string, unknown>;
  const d = (body.declaration || {}) as Record<string, unknown>;
  const locsIn = Array.isArray(body.locations) ? body.locations : [];

  const shippingLimitsIn = (lm.shippingLimits || {}) as Record<string, unknown>;
  const shippingLimits: Record<string, { limit: number; pctVolume: number }> = {};
  for (const [k, v] of Object.entries(shippingLimitsIn)) {
    const o = (v || {}) as Record<string, unknown>;
    shippingLimits[k] = { limit: num(o.limit), pctVolume: num(o.pctVolume) };
  }

  return {
    business: {
      insuredName: str(b.insuredName),
      riskStreet: str(b.riskStreet),
      riskCity: str(b.riskCity),
      riskState: str(b.riskState),
      riskZip: str(b.riskZip),
      mailingAddress: str(b.mailingAddress),
      principalName: str(b.principalName),
      phoneMain: str(b.phoneMain),
      phoneCell: str(b.phoneCell),
      email: str(b.email).toLowerCase(),
      fein: str(b.fein),
      stateRegistered: str(b.stateRegistered),
      mainContact: str(b.mainContact),
      businessType: str(b.businessType),
      yearsTrading: str(b.yearsTrading),
      totalRevenueLastYear: num(b.totalRevenueLastYear),
      employees: str(b.employees),
    },
    stock: {
      splitSports: num(s.splitSports),
      splitPokemon: num(s.splitPokemon),
      splitMarvel: num(s.splitMarvel),
      splitDisney: num(s.splitDisney),
      splitDC: num(s.splitDC),
      splitOther: num(s.splitOther),
      otherDetail: str(s.otherDetail),
      avgItemValue: num(s.avgItemValue),
      avgReplacementValue: num(s.avgReplacementValue),
      maxReplacementValue: num(s.maxReplacementValue),
      amountInBankVaults: num(s.amountInBankVaults),
      amountNotInSafe: num(s.amountNotInSafe),
      outOfSafeHousing: str(s.outOfSafeHousing),
    },
    locations: locsIn.map((raw) => {
      const l = (raw || {}) as Record<string, unknown>;
      const sec = (l.security || {}) as Record<string, unknown>;
      return {
        locationType: str(l.locationType) || "Store",
        exclusiveControl: triBool(l.exclusiveControl),
        controlComment: str(l.controlComment),
        floorsUnit: str(l.floorsUnit),
        floorsBuilding: str(l.floorsBuilding),
        construction: str(l.construction),
        hasRetail: Boolean(l.hasRetail),
        security: {
          burglarAlarm: triBool(sec.burglarAlarm),
          burglarAlarmMakeModel: str(sec.burglarAlarmMakeModel),
          fireAlarm: triBool(sec.fireAlarm),
          fireAlarmMakeModel: str(sec.fireAlarmMakeModel),
          otherFireProtection: str(sec.otherFireProtection),
          holdUpButtons: triBool(sec.holdUpButtons),
          cctv: triBool(sec.cctv),
          securityGuard: triBool(sec.securityGuard),
          safe: triBool(sec.safe),
          safeMakeModel: str(sec.safeMakeModel),
          safeComplete: triBool(sec.safeComplete),
          vault: triBool(sec.vault),
          vaultMakeModel: str(sec.vaultMakeModel),
        },
        staticLimit: num(l.staticLimit),
      };
    }),
    limits: {
      bankVaultsLimit: num(lm.bankVaultsLimit),
      bvPartOfOrAdditional:
        lm.bvPartOfOrAdditional === "part_of" || lm.bvPartOfOrAdditional === "in_addition"
          ? (lm.bvPartOfOrAdditional as "part_of" | "in_addition")
          : "",
      unnamedLocationsLimit: num(lm.unnamedLocationsLimit),
      authenticatorsLimit: num(lm.authenticatorsLimit),
      totalPackages: num(lm.totalPackages),
      avgValuePerPackage: num(lm.avgValuePerPackage),
      totalValueShipped: num(lm.totalValueShipped),
      shippingLimits,
      otherShippingLabel: str(lm.otherShippingLabel),
      otherShippingLimit: num(lm.otherShippingLimit),
      otherShippingPct: num(lm.otherShippingPct),
      totalEvents: num(lm.totalEvents),
      avgValuePerEvent: num(lm.avgValuePerEvent),
      eventsSecureCarrier: num(lm.eventsSecureCarrier),
      limitConveyedToEvents: num(lm.limitConveyedToEvents),
      limitAtEvents: num(lm.limitAtEvents),
      maxSinglePersonEvent: num(lm.maxSinglePersonEvent),
      avgValuePersonalCarrying: num(lm.avgValuePersonalCarrying),
      totalPersonalCarryings: num(lm.totalPersonalCarryings),
      limitPerPersonalCarrying: num(lm.limitPerPersonalCarrying),
      deductibleStatic: num(lm.deductibleStatic),
      deductibleShipping: num(lm.deductibleShipping),
      deductibleOutside: num(lm.deductibleOutside),
    },
    history: {
      coverageStartDate: str(h.coverageStartDate),
      currentBrokerInsurer: str(h.currentBrokerInsurer),
      hadLosses: triBool(h.hadLosses),
      lossDetails: str(h.lossDetails),
      authenticators: Array.isArray(h.authenticators) ? h.authenticators.map(str) : [],
      authenticatorsOther: str(h.authenticatorsOther),
      lossPayees: str(h.lossPayees),
      ancillary: Array.isArray(h.ancillary) ? h.ancillary.map(str) : [],
    },
    declaration: {
      agreed: Boolean(d.agreed),
      signatoryName: str(d.signatoryName),
      date: str(d.date),
    },
  };
}

async function handleV3(body: Record<string, unknown>) {
  const intake = normalizeDealer(body);
  const b = intake.business;

  // ---- Server-side validation ----
  const missing: string[] = [];
  if (!b.insuredName) missing.push("business name");
  if (!b.principalName) missing.push("principal name");
  const phoneDigits = b.phoneMain.replace(/\D/g, "");
  if (phoneDigits.length < 10) missing.push("main phone");
  if (!b.email.includes("@") || !b.email.includes(".")) missing.push("email");
  if (!b.fein) missing.push("FEIN");
  if (!b.businessType) missing.push("business type");
  if ((intake.locations || []).length === 0) missing.push("at least one location");
  if (!intake.declaration.agreed) missing.push("declaration agreement");
  if (!intake.declaration.signatoryName) missing.push("signatory name");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid: ${missing.join(", ")}`, missing },
      { status: 400 }
    );
  }

  const flags = deriveDealerFlags(intake);
  const textIntake = formatDealerText(intake, flags);

  // 1) Push to BrokerIQ.
  let brokerOk = false;
  let brokerResult: Record<string, unknown> = {};
  try {
    const res = await fetch(BROKERIQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: b.insuredName,
        email: b.email,
        phone: phoneDigits,
        message: textIntake,
        source: SOURCE,
        tenant_id: TCG_TENANT,
        lead_type: "new",
        state: b.riskState || "CA",
        raw: {
          version: 3,
          origin: SOURCE,
          kind: "dealer",
          business: intake.business,
          stock: intake.stock,
          locations: intake.locations,
          limits: intake.limits,
          history: intake.history,
          declaration: intake.declaration,
          flags,
          dealerText: textIntake,
        },
      }),
    });
    brokerResult = await res.json().catch(() => ({}));
    brokerOk = res.ok;
  } catch (err) {
    console.error("BrokerIQ submission failed:", err);
  }

  // 2) Email the Consilium-ordered dealer intake.
  const flagTag = flags.highMaxReplacement
    ? " [UW review]"
    : flags.splitOff || flags.outOfSafeNoSecurity
    ? " [check]"
    : "";
  const emailOk = await sendEmail(
    `New WAX DEALER intake — ${b.insuredName} · ${usd(intake.stock.maxReplacementValue)}${flagTag}`,
    formatDealerEmailHTML(intake, flags, SOURCE)
  );

  if (!brokerOk && !emailOk) {
    return NextResponse.json(
      { success: false, error: "Could not submit your request. Please call us." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, kind: "dealer", ...brokerResult });
}

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

    // Route by shape: v3 dealer has a `business` object (or version 3);
    // v2 rich intake has an `items` array + `client`; else legacy v1.
    if (body.version === 3 || body.kind === "dealer" || body.business) {
      return await handleV3(body);
    }
    if (Array.isArray(body.items) || body.version === 2) {
      return await handleV2(body);
    }
    return await handleV1(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
