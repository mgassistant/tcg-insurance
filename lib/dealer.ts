// ═══════════════════════════════════════════════════════════════════
// WAX Trading Card DEALER / SHOP quote-intake domain logic.
// Companion to lib/intake.ts (collector flow). Captures a complete,
// Consilium-ready dealer intake in WAX Dealer Application page order so
// MG/Maria key it in with zero re-typing. No WAX API calls.
// ═══════════════════════════════════════════════════════════════════

import { usd } from "./intake";

export const BUSINESS_TYPES = [
  "Wholesale",
  "Retail",
  "Wholesale & Retail",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const LOCATION_TYPES = ["Residence", "Store", "Office"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const DEALER_AUTHENTICATORS = [
  "PSA",
  "Beckett",
  "SGC",
  "CGC",
  "Other",
] as const;

export const ANCILLARY_COVERAGES = [
  "Terrorism (US TRIPRA Act)",
  "Cyber",
] as const;

// WAX shipping services (Application p.2), in form/portal order.
export const SHIPPING_SERVICES = [
  { key: "uspsRegular", label: "USPS Regular Mail" },
  { key: "uspsCertified", label: "USPS Certified Mail" },
  { key: "uspsCertifiedRestricted", label: "USPS Certified Mail Restricted Service" },
  { key: "uspsPriorityFlatSig", label: "USPS Priority Mail Flat Rate w/ Signature Confirmation" },
  { key: "uspsPriorityFlatAdult", label: "USPS Priority Mail Flat Rate w/ Adult Signature" },
  { key: "ups", label: "UPS" },
  { key: "upsAdult", label: "UPS w/ Adult Signature" },
  { key: "upsParcelPro", label: "UPS Parcel Pro" },
  { key: "fedex", label: "Federal Express" },
  { key: "fedexAdult", label: "Federal Express w/ Adult Signature" },
  { key: "uspsExpress", label: "USPS Priority Express" },
  { key: "uspsExpressAdult", label: "USPS Priority Express w/ Adult Signature" },
  { key: "uspsRegistered", label: "USPS Registered Mail" },
  { key: "uspsRegisteredRestricted", label: "USPS Registered Mail Restricted Service" },
  { key: "secureCarrier", label: "Approved Security Carrier (Brinks, Malca Amit, Dunbar, Loomis Fargo, Ferrari Express, Via Mat, Positive Protection)" },
] as const;

export type ShippingServiceKey = (typeof SHIPPING_SERVICES)[number]["key"];

// ---- Types ----

export interface DealerBusiness {
  insuredName: string;
  riskStreet: string;
  riskCity: string;
  riskState: string;
  riskZip: string;
  mailingAddress: string; // optional single line
  principalName: string;
  phoneMain: string;
  phoneCell: string;
  email: string;
  fein: string;
  stateRegistered: string;
  mainContact: string;
  businessType: string; // BusinessType
  yearsTrading: string;
  totalRevenueLastYear: number;
  employees: string;
}

export interface DealerStock {
  splitSports: number;
  splitPokemon: number;
  splitMarvel: number;
  splitDisney: number;
  splitDC: number;
  splitOther: number;
  otherDetail: string;
  avgItemValue: number;
  avgReplacementValue: number;
  maxReplacementValue: number;
  amountInBankVaults: number;
  amountNotInSafe: number;
  outOfSafeHousing: string; // how out-of-safe items are secured
}

export interface DealerSecurity {
  burglarAlarm: boolean | null;
  burglarAlarmMakeModel: string;
  fireAlarm: boolean | null;
  fireAlarmMakeModel: string;
  otherFireProtection: string;
  holdUpButtons: boolean | null;
  cctv: boolean | null;
  securityGuard: boolean | null;
  safe: boolean | null;
  safeMakeModel: string;
  safeComplete: boolean | null; // safe alarmed
  vault: boolean | null;
  vaultMakeModel: string;
}

export interface DealerLocation {
  locationType: string; // LocationType
  exclusiveControl: boolean | null;
  controlComment: string;
  floorsUnit: string;
  floorsBuilding: string;
  construction: string;
  hasRetail: boolean; // "physical retail location?" toggle → reveals security
  security: DealerSecurity;
  staticLimit: number; // A1 per-location limit
}

export interface ShippingServiceLimit {
  limit: number;
  pctVolume: number;
}

export interface DealerLimits {
  // A — Static
  bankVaultsLimit: number;
  bvPartOfOrAdditional: "" | "part_of" | "in_addition";
  unnamedLocationsLimit: number;
  authenticatorsLimit: number;
  // B — Shipping
  totalPackages: number;
  avgValuePerPackage: number;
  totalValueShipped: number;
  shippingLimits: Partial<Record<ShippingServiceKey, ShippingServiceLimit>>;
  otherShippingLabel: string;
  otherShippingLimit: number;
  otherShippingPct: number;
  // C1 — Events
  totalEvents: number;
  avgValuePerEvent: number;
  eventsSecureCarrier: number;
  limitConveyedToEvents: number;
  limitAtEvents: number;
  maxSinglePersonEvent: number;
  // C2 — Personal carryings
  avgValuePersonalCarrying: number;
  totalPersonalCarryings: number;
  limitPerPersonalCarrying: number;
  // Deductibles
  deductibleStatic: number;
  deductibleShipping: number;
  deductibleOutside: number;
}

export interface DealerHistory {
  coverageStartDate: string;
  currentBrokerInsurer: string;
  hadLosses: boolean | null;
  lossDetails: string;
  authenticators: string[]; // subset of DEALER_AUTHENTICATORS
  authenticatorsOther: string;
  lossPayees: string;
  ancillary: string[]; // subset of ANCILLARY_COVERAGES
}

export interface DealerDeclaration {
  agreed: boolean;
  signatoryName: string;
  date: string;
}

export interface DealerIntake {
  business: DealerBusiness;
  stock: DealerStock;
  locations: DealerLocation[];
  limits: DealerLimits;
  history: DealerHistory;
  declaration: DealerDeclaration;
}

// ---- Derived flags (light v1) ----
export interface DealerFlags {
  splitTotal: number;
  splitOff: boolean; // total not ~100 (and any value entered)
  outOfSafeNoSecurity: boolean; // stock kept out of safe but no location has a safe
  highMaxReplacement: boolean; // > $1M → likely manual UW
  locationCount: number;
  retailLocationCount: number;
}

const SPLIT_TOLERANCE = 2; // ±2%
export const HIGH_REPLACEMENT_THRESHOLD = 1_000_000;

export function deriveDealerFlags(intake: DealerIntake): DealerFlags {
  const s = intake.stock;
  const splitTotal =
    (Number(s.splitSports) || 0) +
    (Number(s.splitPokemon) || 0) +
    (Number(s.splitMarvel) || 0) +
    (Number(s.splitDisney) || 0) +
    (Number(s.splitDC) || 0) +
    (Number(s.splitOther) || 0);
  const anySplit = splitTotal > 0;
  const splitOff = anySplit && Math.abs(splitTotal - 100) > SPLIT_TOLERANCE;

  const anySafe = (intake.locations || []).some((l) => l.security?.safe === true);
  const outOfSafeNoSecurity =
    (Number(s.amountNotInSafe) || 0) > 0 && !anySafe;

  const highMaxReplacement =
    (Number(s.maxReplacementValue) || 0) > HIGH_REPLACEMENT_THRESHOLD;

  const locations = intake.locations || [];
  return {
    splitTotal,
    splitOff,
    outOfSafeNoSecurity,
    highMaxReplacement,
    locationCount: locations.length,
    retailLocationCount: locations.filter(
      (l) => l.hasRetail || l.locationType === "Store"
    ).length,
  };
}

// ---- Formatting helpers ----
function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function yn(v: boolean | null | undefined): string {
  return v === true ? "YES" : v === false ? "NO" : "—";
}
function pct(n: number | undefined): string {
  const v = Number(n) || 0;
  return v ? `${v}%` : "—";
}

// ═══════════════════════════════════════════════════════════════════
// CONSILIUM-ORDERED EMAIL (HTML) — WAX Dealer Application page order.
// ═══════════════════════════════════════════════════════════════════
export function formatDealerEmailHTML(
  intake: DealerIntake,
  flags: DealerFlags,
  source = "tcg-insurance.com"
): string {
  const b = intake.business;
  const s = intake.stock;
  const lm = intake.limits;
  const h = intake.history;
  const d = intake.declaration;

  const rows = (pairs: [string, string][]) =>
    pairs
      .map(
        ([k, v]) =>
          `<tr><td style="padding:5px 14px 5px 0;color:#555;white-space:nowrap;vertical-align:top"><b>${esc(
            k
          )}</b></td><td style="padding:5px 0;color:#111">${v || "—"}</td></tr>`
      )
      .join("");

  const businessBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">1 · Business</h3>
    <table style="border-collapse:collapse;font:14px sans-serif">
      ${rows([
        ["Insured name", esc(b.insuredName)],
        ["Main risk address", esc([b.riskStreet, [b.riskCity, b.riskState].filter(Boolean).join(", "), b.riskZip].filter(Boolean).join(" · "))],
        ["Mailing address", esc(b.mailingAddress)],
        ["Owner / Principal", esc(b.principalName)],
        ["Phone (main)", esc(b.phoneMain)],
        ["Phone (cell)", esc(b.phoneCell)],
        ["Email", esc(b.email)],
        ["FEIN", esc(b.fein)],
        ["State registered", esc(b.stateRegistered)],
        ["Main contact", esc(b.mainContact)],
        ["Business type", esc(b.businessType)],
        ["Years trading", esc(b.yearsTrading)],
        ["Total revenue (last yr)", usd(b.totalRevenueLastYear)],
        ["Employees", esc(b.employees)],
      ])}
    </table>`;

  const stockBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">2 · Stock</h3>
    <table style="border-collapse:collapse;font:14px sans-serif">
      ${rows([
        ["Split — Sports", pct(s.splitSports)],
        ["Split — Pokémon", pct(s.splitPokemon)],
        ["Split — Marvel", pct(s.splitMarvel)],
        ["Split — Disney", pct(s.splitDisney)],
        ["Split — DC Comics", pct(s.splitDC)],
        ["Split — Other", pct(s.splitOther)],
        ["Other detail", esc(s.otherDetail)],
        ["Split total", `${flags.splitTotal}%${flags.splitOff ? " ⚠ (does not total ~100%)" : ""}`],
        ["Avg individual item value", usd(s.avgItemValue)],
        ["Avg total replacement value (12mo)", usd(s.avgReplacementValue)],
        ["MAX total replacement value (12mo)", usd(s.maxReplacementValue)],
        ["Amount in bank vaults", usd(s.amountInBankVaults)],
        ["Amount NOT in safe (main loc)", usd(s.amountNotInSafe)],
        ["Out-of-safe housing/security", esc(s.outOfSafeHousing)],
      ])}
    </table>`;

  const locationsBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">3 · Location(s) (${flags.locationCount})</h3>
    ${(intake.locations || [])
      .map((l, i) => {
        const sec = l.security || ({} as DealerSecurity);
        const showSec = l.hasRetail || l.locationType === "Store" || l.locationType === "Office";
        const secRows = showSec
          ? rows([
              ["Burglar alarm (central)", `${yn(sec.burglarAlarm)}${sec.burglarAlarmMakeModel ? ` · ${esc(sec.burglarAlarmMakeModel)}` : ""}`],
              ["Fire alarm (central)", `${yn(sec.fireAlarm)}${sec.fireAlarmMakeModel ? ` · ${esc(sec.fireAlarmMakeModel)}` : ""}`],
              ["Other fire protection", esc(sec.otherFireProtection)],
              ["Hold-up buttons", yn(sec.holdUpButtons)],
              ["CCTV / cameras", yn(sec.cctv)],
              ["Security guard", yn(sec.securityGuard)],
              ["Safe(s)", `${yn(sec.safe)}${sec.safeMakeModel ? ` · ${esc(sec.safeMakeModel)}` : ""}`],
              ["Safe complete (alarmed)", yn(sec.safeComplete)],
              ["Vault", `${yn(sec.vault)}${sec.vaultMakeModel ? ` · ${esc(sec.vaultMakeModel)}` : ""}`],
            ])
          : `<tr><td colspan="2" style="padding:5px 0;color:#888">No retail/security block (non-retail residence)</td></tr>`;
        return `
      <table style="border-collapse:collapse;font:14px sans-serif;margin-bottom:14px;border-left:3px solid #8AA6FF">
        <tr><td colspan="2" style="padding:4px 0 6px 12px;font:600 14px sans-serif;color:#0C0D18">Location ${i + 1}${l.hasRetail || l.locationType === "Store" ? " · retail" : ""}</td></tr>
        ${rows([
          ["Type", esc(l.locationType)],
          ["Exclusive control", `${yn(l.exclusiveControl)}${l.controlComment ? ` · ${esc(l.controlComment)}` : ""}`],
          ["Floors (unit / building)", `${esc(l.floorsUnit) || "—"} / ${esc(l.floorsBuilding) || "—"}`],
          ["Construction", esc(l.construction)],
          ["Static limit (A1)", usd(l.staticLimit)],
        ]).replace(/padding:5px 14px 5px 0/g, "padding:5px 14px 5px 12px")}
        ${secRows.replace(/padding:5px 14px 5px 0/g, "padding:5px 14px 5px 12px")}
      </table>`;
      })
      .join("")}`;

  // Shipping service limits table (only rows with a limit or %).
  const shipRows = SHIPPING_SERVICES.map((svc) => {
    const v = lm.shippingLimits?.[svc.key];
    if (!v || (!(Number(v.limit) > 0) && !(Number(v.pctVolume) > 0))) return null;
    return [svc.label, `${usd(v.limit)} · ${pct(v.pctVolume)}`] as [string, string];
  }).filter(Boolean) as [string, string][];
  if (lm.otherShippingLimit > 0 || lm.otherShippingPct > 0 || lm.otherShippingLabel) {
    shipRows.push([
      `Other: ${esc(lm.otherShippingLabel) || "—"}`,
      `${usd(lm.otherShippingLimit)} · ${pct(lm.otherShippingPct)}`,
    ]);
  }

  const limitsBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">4 · Coverage Limits</h3>
    <table style="border-collapse:collapse;font:14px sans-serif">
      ${rows([
        ["— A · Static —", ""],
        ["Bank vaults limit", usd(lm.bankVaultsLimit)],
        ["BV limit relation", lm.bvPartOfOrAdditional === "part_of" ? "Part of main location" : lm.bvPartOfOrAdditional === "in_addition" ? "In addition to main location" : "—"],
        ["Unnamed locations limit", usd(lm.unnamedLocationsLimit)],
        ["Authenticators limit", usd(lm.authenticatorsLimit)],
        ["— B · Shipping —", ""],
        ["Total packages (12mo)", esc(lm.totalPackages || "—")],
        ["Avg value/package", usd(lm.avgValuePerPackage)],
        ["Total value shipped (12mo)", usd(lm.totalValueShipped)],
      ])}
      ${shipRows.length ? rows(shipRows) : `<tr><td colspan="2" style="padding:5px 0;color:#888">No per-service limits specified</td></tr>`}
      ${rows([
        ["— C1 · Events —", ""],
        ["Events forecast (12mo)", esc(lm.totalEvents || "—")],
        ["Avg value/event", usd(lm.avgValuePerEvent)],
        ["# events w/ secure carrier", esc(lm.eventsSecureCarrier || "—")],
        ["Limit conveyed to/from events", usd(lm.limitConveyedToEvents)],
        ["Limit at events", usd(lm.limitAtEvents)],
        ["Max carried by single person", usd(lm.maxSinglePersonEvent)],
        ["— C2 · Personal carryings —", ""],
        ["Avg value/carrying", usd(lm.avgValuePersonalCarrying)],
        ["Total carryings (12mo)", esc(lm.totalPersonalCarryings || "—")],
        ["Limit per carrying", usd(lm.limitPerPersonalCarrying)],
        ["— Deductibles —", ""],
        ["Static", usd(lm.deductibleStatic)],
        ["Shipping", usd(lm.deductibleShipping)],
        ["Outside", usd(lm.deductibleOutside)],
      ])}
    </table>`;

  const historyBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">5 · History & Extras</h3>
    <table style="border-collapse:collapse;font:14px sans-serif">
      ${rows([
        ["Coverage start date", esc(h.coverageStartDate)],
        ["Current broker & insurer", esc(h.currentBrokerInsurer)],
        ["Losses in last 5 yrs?", `${yn(h.hadLosses)}${h.lossDetails ? ` · ${esc(h.lossDetails)}` : ""}`],
        ["Authenticators", esc([...(h.authenticators || []), h.authenticatorsOther].filter(Boolean).join(", "))],
        ["Loss payees", esc(h.lossPayees)],
        ["Ancillary interest", esc((h.ancillary || []).join(", "))],
      ])}
    </table>`;

  const declBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">6 · Declaration</h3>
    <table style="border-collapse:collapse;font:14px sans-serif">
      ${rows([
        ["Agreed to declaration & fraud notices", d.agreed ? "YES" : "NO"],
        ["Signatory name", esc(d.signatoryName)],
        ["Date", esc(d.date)],
      ])}
    </table>`;

  const flagBits: string[] = [];
  if (flags.splitOff) flagBits.push(`<li>Stock split totals ${flags.splitTotal}% (not ~100%) — confirm.</li>`);
  if (flags.outOfSafeNoSecurity) flagBits.push(`<li>Stock kept out of safe but no location reports a safe — confirm security.</li>`);
  if (flags.highMaxReplacement) flagBits.push(`<li>MAX replacement value exceeds ${usd(HIGH_REPLACEMENT_THRESHOLD)} — likely manual underwriting.</li>`);
  const flagsBlock = flagBits.length
    ? `<h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#8A6D00">⚠ Notes</h3><ul style="font:14px sans-serif;margin:0;padding-left:20px">${flagBits.join("")}</ul>`
    : "";

  return `
  <div style="max-width:680px;font:14px sans-serif;color:#111">
    <h2 style="font:700 20px sans-serif;color:#0C0D18;margin:0 0 4px">New WAX DEALER intake — ${esc(b.insuredName)}</h2>
    <p style="color:#666;font:13px sans-serif;margin:0 0 4px">Dealer/Shop application · WAX page order · ready to key into Consilium.</p>
    ${businessBlock}
    ${stockBlock}
    ${locationsBlock}
    ${limitsBlock}
    ${historyBlock}
    ${flagsBlock}
    ${declBlock}
    <p style="color:#999;font:12px sans-serif;margin-top:26px;border-top:1px solid #eee;padding-top:10px">
      Source: ${esc(source)} · Quote request, not a bound policy. No binding authority until WAX approves.
    </p>
  </div>`;
}

// Plain-text version (BrokerIQ raw.message + fallback).
export function formatDealerText(intake: DealerIntake, flags: DealerFlags): string {
  const b = intake.business;
  const s = intake.stock;
  const lm = intake.limits;
  const h = intake.history;
  const d = intake.declaration;
  const L: string[] = [];
  L.push("=== WAX DEALER QUOTE INTAKE (Consilium order) ===");
  L.push("");
  L.push("1) BUSINESS");
  L.push(`  Insured name: ${b.insuredName}`);
  L.push(`  Risk address: ${[b.riskStreet, [b.riskCity, b.riskState].filter(Boolean).join(", "), b.riskZip].filter(Boolean).join(" · ")}`);
  if (b.mailingAddress) L.push(`  Mailing address: ${b.mailingAddress}`);
  L.push(`  Principal: ${b.principalName}`);
  L.push(`  Phone main/cell: ${b.phoneMain}${b.phoneCell ? " / " + b.phoneCell : ""}`);
  L.push(`  Email: ${b.email}`);
  L.push(`  FEIN: ${b.fein}   State registered: ${b.stateRegistered}`);
  L.push(`  Main contact: ${b.mainContact}`);
  L.push(`  Business type: ${b.businessType}   Years trading: ${b.yearsTrading}`);
  L.push(`  Total revenue (last yr): ${usd(b.totalRevenueLastYear)}   Employees: ${b.employees}`);
  L.push("");
  L.push("2) STOCK");
  L.push(`  Split: Sports ${pct(s.splitSports)} · Pokémon ${pct(s.splitPokemon)} · Marvel ${pct(s.splitMarvel)} · Disney ${pct(s.splitDisney)} · DC ${pct(s.splitDC)} · Other ${pct(s.splitOther)} (total ${flags.splitTotal}%${flags.splitOff ? " ⚠" : ""})`);
  if (s.otherDetail) L.push(`  Other detail: ${s.otherDetail}`);
  L.push(`  Avg item value: ${usd(s.avgItemValue)}`);
  L.push(`  Avg replacement (12mo): ${usd(s.avgReplacementValue)}   MAX replacement: ${usd(s.maxReplacementValue)}`);
  L.push(`  In bank vaults: ${usd(s.amountInBankVaults)}   Not in safe: ${usd(s.amountNotInSafe)}`);
  if (s.outOfSafeHousing) L.push(`  Out-of-safe housing: ${s.outOfSafeHousing}`);
  L.push("");
  L.push(`3) LOCATIONS (${flags.locationCount})`);
  (intake.locations || []).forEach((l, i) => {
    const sec = l.security || ({} as DealerSecurity);
    L.push(`  Location ${i + 1}: ${l.locationType}${l.hasRetail || l.locationType === "Store" ? " (retail)" : ""}`);
    L.push(`    Exclusive control: ${yn(l.exclusiveControl)}${l.controlComment ? " · " + l.controlComment : ""}`);
    L.push(`    Floors unit/building: ${l.floorsUnit || "—"}/${l.floorsBuilding || "—"}   Construction: ${l.construction || "—"}`);
    L.push(`    Static limit: ${usd(l.staticLimit)}`);
    if (l.hasRetail || l.locationType === "Store" || l.locationType === "Office") {
      L.push(`    Burglar alarm: ${yn(sec.burglarAlarm)}${sec.burglarAlarmMakeModel ? " (" + sec.burglarAlarmMakeModel + ")" : ""}`);
      L.push(`    Fire alarm: ${yn(sec.fireAlarm)}${sec.fireAlarmMakeModel ? " (" + sec.fireAlarmMakeModel + ")" : ""}`);
      if (sec.otherFireProtection) L.push(`    Other fire protection: ${sec.otherFireProtection}`);
      L.push(`    Hold-up buttons: ${yn(sec.holdUpButtons)}   CCTV: ${yn(sec.cctv)}   Guard: ${yn(sec.securityGuard)}`);
      L.push(`    Safe: ${yn(sec.safe)}${sec.safeMakeModel ? " (" + sec.safeMakeModel + ")" : ""}   Alarmed: ${yn(sec.safeComplete)}`);
      L.push(`    Vault: ${yn(sec.vault)}${sec.vaultMakeModel ? " (" + sec.vaultMakeModel + ")" : ""}`);
    }
  });
  L.push("");
  L.push("4) COVERAGE LIMITS");
  L.push(`  A Static — Bank vaults: ${usd(lm.bankVaultsLimit)} (${lm.bvPartOfOrAdditional || "—"}) · Unnamed: ${usd(lm.unnamedLocationsLimit)} · Authenticators: ${usd(lm.authenticatorsLimit)}`);
  L.push(`  B Shipping — pkgs ${lm.totalPackages || "—"} · avg/pkg ${usd(lm.avgValuePerPackage)} · total ${usd(lm.totalValueShipped)}`);
  SHIPPING_SERVICES.forEach((svc) => {
    const v = lm.shippingLimits?.[svc.key];
    if (v && (Number(v.limit) > 0 || Number(v.pctVolume) > 0)) {
      L.push(`    ${svc.label}: ${usd(v.limit)} · ${pct(v.pctVolume)}`);
    }
  });
  if (lm.otherShippingLimit > 0 || lm.otherShippingPct > 0 || lm.otherShippingLabel) {
    L.push(`    Other (${lm.otherShippingLabel || "—"}): ${usd(lm.otherShippingLimit)} · ${pct(lm.otherShippingPct)}`);
  }
  L.push(`  C1 Events — forecast ${lm.totalEvents || "—"} · avg/event ${usd(lm.avgValuePerEvent)} · secure-carrier events ${lm.eventsSecureCarrier || "—"}`);
  L.push(`     Limits: to/from ${usd(lm.limitConveyedToEvents)} · at events ${usd(lm.limitAtEvents)} · single person ${usd(lm.maxSinglePersonEvent)}`);
  L.push(`  C2 Personal carryings — avg ${usd(lm.avgValuePersonalCarrying)} · count ${lm.totalPersonalCarryings || "—"} · limit/carrying ${usd(lm.limitPerPersonalCarrying)}`);
  L.push(`  Deductibles — Static ${usd(lm.deductibleStatic)} · Shipping ${usd(lm.deductibleShipping)} · Outside ${usd(lm.deductibleOutside)}`);
  L.push("");
  L.push("5) HISTORY & EXTRAS");
  L.push(`  Coverage start: ${h.coverageStartDate || "—"}   Current broker/insurer: ${h.currentBrokerInsurer || "—"}`);
  L.push(`  Losses (5yr): ${yn(h.hadLosses)}${h.lossDetails ? " · " + h.lossDetails : ""}`);
  L.push(`  Authenticators: ${[...(h.authenticators || []), h.authenticatorsOther].filter(Boolean).join(", ") || "—"}`);
  L.push(`  Loss payees: ${h.lossPayees || "—"}`);
  L.push(`  Ancillary: ${(h.ancillary || []).join(", ") || "—"}`);
  L.push("");
  L.push("6) DECLARATION");
  L.push(`  Agreed: ${d.agreed ? "YES" : "NO"}   Signatory: ${d.signatoryName || "—"}   Date: ${d.date || "—"}`);
  if (flags.splitOff || flags.outOfSafeNoSecurity || flags.highMaxReplacement) {
    L.push("");
    L.push("!! NOTES");
    if (flags.splitOff) L.push(`  - Stock split totals ${flags.splitTotal}% (not ~100%).`);
    if (flags.outOfSafeNoSecurity) L.push("  - Out-of-safe stock but no safe reported.");
    if (flags.highMaxReplacement) L.push(`  - MAX replacement > ${usd(HIGH_REPLACEMENT_THRESHOLD)} (manual UW likely).`);
  }
  return L.join("\n");
}
