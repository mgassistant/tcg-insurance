// ═══════════════════════════════════════════════════════════════════
// WAX / Consilium quote-intake domain logic
// Shared by the client form, the API route, and the email formatter.
// This does NOT call any WAX API — WAX quoting happens in the broker-only
// Consilium portal. Our job is to capture a complete, Consilium-ready
// intake so MG/Maria can key it in with zero re-typing.
// ═══════════════════════════════════════════════════════════════════

// ---- Item categories (Consilium dropdown order; first = default) ----
export const ITEM_CATEGORIES = [
  "Trading Cards",
  "Sports Memorabilia",
  "Memorabilia & Autographs",
  "Watches",
  "Jewelry",
  "Handbags",
  "Sneakers",
  "Fine Art",
  "Comic Books",
  "Coins",
  "Wine & Liquor",
  "Musical Instruments",
  "Vintage Cameras",
  "Toys",
  "Action Figures",
  "Rare Books",
  "Stamps",
  "Figurines",
  "Vintage Tech",
  "Other",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const GRADING_COMPANIES = ["PSA", "BGS", "CGC", "SGC", "CSG", "Other"] as const;

export type CoverageType = "scheduled" | "blanket";

// A single scheduled/blanket item on the intake.
export interface IntakeItem {
  category: string;
  brandType: string;
  description: string;
  // For Trading Cards this holds "PSA 10", "BGS 9.5", etc.
  // For everything else this is a serial number / model reference.
  serialOrGrade: string;
  value: number; // USD
}

export interface IntakeClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string; // free-form / YYYY-MM-DD
  street: string;
  city: string;
  state: string;
  zip: string;
  occupation: string;
  social: string; // optional — social / LinkedIn URL
}

export interface QuoteIntake {
  client: IntakeClient;
  coverageType: CoverageType;
  items: IntakeItem[];
  // Blanket-only fields (manual underwriting):
  blanketTotalItems?: number;
  blanketTotalValue?: number;
  // Optional documentation signal (we do NOT store files):
  hasDocumentation?: boolean;
  documentationNote?: string;
}

// ---- Underwriting thresholds (from the WAX broker guide) ----
// Per-item appraisal / bill-of-sale requirement.
export const APPRAISAL_ITEM_THRESHOLD = 25_000; // general
export const APPRAISAL_WATCH_THRESHOLD = 50_000; // watches specifically
// Blanket per-item limit.
export const BLANKET_PER_ITEM_LIMIT = 50_000;
// Newly-acquired-items reassurance.
export const NEWLY_ACQUIRED_PCT = 25;
export const NEWLY_ACQUIRED_DAYS = 90;

const CA_FL = new Set(["CA", "FL"]);

function normState(state: string): string {
  return (state || "").trim().toUpperCase();
}

// Manual-underwriting-review thresholds by category-class and state.
// Returns the review threshold (total USD) for a given class, or null.
export function reviewThresholdForCategory(
  category: string,
  state: string
): number | null {
  const isCaFl = CA_FL.has(normState(state));
  const c = category.toLowerCase();
  if (
    c.includes("trading card") ||
    c.includes("memorabilia") ||
    c.includes("autograph") ||
    c.includes("sports")
  ) {
    return isCaFl ? 100_000 : 250_000;
  }
  if (c.includes("fine art")) {
    return isCaFl ? 250_000 : 750_000;
  }
  if (c.includes("coin")) {
    return 250_000;
  }
  if (c.includes("wine") || c.includes("liquor")) {
    // Wine is a blanket/manual-underwriting class; flag on any material total.
    return 250_000;
  }
  return null;
}

export interface DerivedFlags {
  totalValue: number;
  itemCount: number;
  // Any item over the per-item appraisal threshold.
  needsAppraisal: boolean;
  needsAppraisalItems: string[]; // human descriptions of the items involved
  // Aggregated category totals crossed a manual-review threshold.
  mayNeedUnderwriting: boolean;
  underwritingReasons: string[];
  // Blanket item exceeds the $50k per-item limit.
  blanketPerItemExceeded: boolean;
}

function itemLabel(item: IntakeItem, idx: number): string {
  const bits = [item.category, item.brandType, item.description].filter(Boolean);
  const label = bits.join(" · ") || `Item ${idx + 1}`;
  return label;
}

// Derive underwriting flags from an intake. Pure + shared client/server.
export function deriveFlags(intake: QuoteIntake): DerivedFlags {
  const items = intake.items || [];
  const state = intake.client?.state || "";

  let totalValue = 0;
  const needsAppraisalItems: string[] = [];
  let blanketPerItemExceeded = false;
  const categoryTotals: Record<string, number> = {};

  items.forEach((item, idx) => {
    const val = Number(item.value) || 0;
    totalValue += val;

    const isWatch = item.category.toLowerCase().includes("watch");
    const appraisalThreshold = isWatch
      ? APPRAISAL_WATCH_THRESHOLD
      : APPRAISAL_ITEM_THRESHOLD;
    if (val > appraisalThreshold) {
      needsAppraisalItems.push(`${itemLabel(item, idx)} ($${val.toLocaleString()})`);
    }

    if (intake.coverageType === "blanket" && val > BLANKET_PER_ITEM_LIMIT) {
      blanketPerItemExceeded = true;
    }

    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + val;
  });

  // Underwriting review: aggregate each item's category into "classes" and
  // compare against the class threshold.
  const underwritingReasons: string[] = [];
  const classTotals: Record<string, { total: number; sample: string }> = {};
  items.forEach((item) => {
    const threshold = reviewThresholdForCategory(item.category, state);
    if (threshold == null) return;
    const key = `${threshold}`;
    if (!classTotals[key]) classTotals[key] = { total: 0, sample: item.category };
    classTotals[key].total += Number(item.value) || 0;
  });
  for (const { total, sample } of Object.values(classTotals)) {
    const threshold = reviewThresholdForCategory(sample, state);
    if (threshold != null && total > threshold) {
      underwritingReasons.push(
        `${sample}-class total ($${total.toLocaleString()}) exceeds $${threshold.toLocaleString()}${
          CA_FL.has(normState(state)) ? " (CA/FL threshold)" : ""
        }`
      );
    }
  }

  return {
    totalValue,
    itemCount: items.length,
    needsAppraisal: needsAppraisalItems.length > 0,
    needsAppraisalItems,
    mayNeedUnderwriting: underwritingReasons.length > 0,
    underwritingReasons,
    blanketPerItemExceeded,
  };
}

// ---- Formatting helpers ----
export function usd(n: number | undefined | null): string {
  const v = Number(n) || 0;
  return `$${v.toLocaleString("en-US")}`;
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function serialLabel(category: string): string {
  return category.toLowerCase().includes("trading card")
    ? "Grading Co. + Grade"
    : "Serial / Model";
}

// ═══════════════════════════════════════════════════════════════════
// CONSILIUM-ORDERED EMAIL — the core deliverable.
// Lays the intake out in exactly the order MG/Maria will key it into the
// Consilium portal, so it can be copied field-by-field with no re-typing.
// ═══════════════════════════════════════════════════════════════════

export function formatConsiliumEmailHTML(
  intake: QuoteIntake,
  flags: DerivedFlags,
  source = "tcg-insurance.com"
): string {
  const c = intake.client;
  const coverage = intake.coverageType === "blanket" ? "Blanket" : "Scheduled";

  const rows = (pairs: [string, string][]) =>
    pairs
      .map(
        ([k, v]) =>
          `<tr><td style="padding:5px 14px 5px 0;color:#555;white-space:nowrap;vertical-align:top"><b>${esc(
            k
          )}</b></td><td style="padding:5px 0;color:#111">${v || "—"}</td></tr>`
      )
      .join("");

  const clientBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">1 · Client Profile</h3>
    <table style="border-collapse:collapse;font:14px sans-serif">
      ${rows([
        ["First Name", esc(c.firstName)],
        ["Last Name", esc(c.lastName)],
        ["Email", esc(c.email)],
        ["Phone", esc(c.phone)],
        ["Date of Birth", esc(c.dob)],
        [
          "Address",
          esc(
            [c.street, [c.city, c.state].filter(Boolean).join(", "), c.zip]
              .filter(Boolean)
              .join(" · ")
          ),
        ],
        ["Occupation", esc(c.occupation)],
        ["Social / LinkedIn", esc(c.social)],
      ])}
    </table>`;

  const coverageBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">2 · Coverage Type</h3>
    <table style="border-collapse:collapse;font:14px sans-serif">
      ${rows([
        ["Coverage", `<b>${coverage}</b>`],
        ...(intake.coverageType === "blanket"
          ? ([
              ["Blanket total items", esc(intake.blanketTotalItems ?? "—")],
              ["Blanket total value", usd(intake.blanketTotalValue)],
              [
                "Note",
                "Blanket = manual underwriting; per-item limit $50,000. Items below are the most valuable / scheduled highlights.",
              ],
            ] as [string, string][])
          : []),
      ])}
    </table>`;

  const itemsBlock = `
    <h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">3 · Item Schedule (${
      flags.itemCount
    } item${flags.itemCount === 1 ? "" : "s"} · ${usd(flags.totalValue)} total)</h3>
    ${(intake.items || [])
      .map(
        (item, i) => `
      <table style="border-collapse:collapse;font:14px sans-serif;margin-bottom:14px;border-left:3px solid #8AA6FF;padding-left:0">
        <tr><td colspan="2" style="padding:4px 0 6px 12px;font:600 14px sans-serif;color:#0C0D18">Item ${
          i + 1
        }</td></tr>
        ${rows([
          ["Category", esc(item.category)],
          ["Brand / Type", esc(item.brandType)],
          ["Description", esc(item.description)],
          [serialLabel(item.category), esc(item.serialOrGrade)],
          ["Current Value", usd(item.value)],
        ]).replace(/padding:5px 14px 5px 0/g, "padding:5px 14px 5px 12px")}
      </table>`
      )
      .join("")}`;

  const flagBits: string[] = [];
  if (flags.needsAppraisal) {
    flagBits.push(
      `<li><b>Appraisal / bill of sale (within 3 yrs) required</b> for: ${flags.needsAppraisalItems
        .map(esc)
        .join("; ")}</li>`
    );
  }
  if (flags.mayNeedUnderwriting) {
    flagBits.push(
      `<li><b>May require manual underwriting review (up to 48h):</b> ${flags.underwritingReasons
        .map(esc)
        .join("; ")}</li>`
    );
  }
  if (flags.blanketPerItemExceeded) {
    flagBits.push(
      `<li><b>Blanket per-item limit exceeded</b> ($50,000) — item(s) may need to be scheduled.</li>`
    );
  }
  if (intake.hasDocumentation) {
    flagBits.push(
      `<li>Client indicated they can provide appraisal/receipt on request${
        intake.documentationNote ? `: ${esc(intake.documentationNote)}` : "."
      }</li>`
    );
  }

  const flagsBlock = flagBits.length
    ? `<h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">4 · Underwriting Flags</h3>
       <ul style="font:14px sans-serif;color:#111;margin:0;padding-left:20px">${flagBits.join(
         ""
       )}</ul>`
    : `<h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#0C0D18">4 · Underwriting Flags</h3>
       <p style="font:14px sans-serif;color:#555;margin:0">None flagged — standard intake.</p>`;

  return `
  <div style="max-width:680px;font:14px sans-serif;color:#111">
    <h2 style="font:700 20px sans-serif;color:#0C0D18;margin:0 0 4px">New WAX quote intake — ${esc(
      c.firstName
    )} ${esc(c.lastName)}</h2>
    <p style="color:#666;font:13px sans-serif;margin:0 0 4px">Ready to key into Consilium (dashboard.wax.insure). Fields are in portal order.</p>
    ${clientBlock}
    ${coverageBlock}
    ${itemsBlock}
    ${flagsBlock}
    <p style="color:#999;font:12px sans-serif;margin-top:26px;border-top:1px solid #eee;padding-top:10px">
      Source: ${esc(source)} · This is a quote request, not a bound policy. No binding
      authority until WAX approves. Newly acquired items covered at ${NEWLY_ACQUIRED_PCT}% of
      class limit for ${NEWLY_ACQUIRED_DAYS} days.
    </p>
  </div>`;
}

// Plain-text version (used in BrokerIQ `raw.message` and as a fallback).
export function formatConsiliumText(
  intake: QuoteIntake,
  flags: DerivedFlags
): string {
  const c = intake.client;
  const L: string[] = [];
  L.push("=== WAX QUOTE INTAKE (Consilium order) ===");
  L.push("");
  L.push("1) CLIENT PROFILE");
  L.push(`  First Name: ${c.firstName}`);
  L.push(`  Last Name: ${c.lastName}`);
  L.push(`  Email: ${c.email}`);
  L.push(`  Phone: ${c.phone}`);
  L.push(`  Date of Birth: ${c.dob || "—"}`);
  L.push(
    `  Address: ${[c.street, [c.city, c.state].filter(Boolean).join(", "), c.zip]
      .filter(Boolean)
      .join(" · ") || "—"}`
  );
  L.push(`  Occupation: ${c.occupation || "—"}`);
  L.push(`  Social/LinkedIn: ${c.social || "—"}`);
  L.push("");
  L.push(
    `2) COVERAGE TYPE: ${intake.coverageType === "blanket" ? "Blanket" : "Scheduled"}`
  );
  if (intake.coverageType === "blanket") {
    L.push(`  Blanket total items: ${intake.blanketTotalItems ?? "—"}`);
    L.push(`  Blanket total value: ${usd(intake.blanketTotalValue)}`);
    L.push(`  Note: manual underwriting; per-item limit $50,000.`);
  }
  L.push("");
  L.push(`3) ITEM SCHEDULE (${flags.itemCount} items · ${usd(flags.totalValue)} total)`);
  (intake.items || []).forEach((item, i) => {
    L.push(`  Item ${i + 1}:`);
    L.push(`    Category: ${item.category}`);
    L.push(`    Brand/Type: ${item.brandType || "—"}`);
    L.push(`    Description: ${item.description || "—"}`);
    L.push(`    ${serialLabel(item.category)}: ${item.serialOrGrade || "—"}`);
    L.push(`    Current Value: ${usd(item.value)}`);
  });
  L.push("");
  L.push("4) UNDERWRITING FLAGS");
  if (flags.needsAppraisal)
    L.push(`  - Appraisal/bill of sale required: ${flags.needsAppraisalItems.join("; ")}`);
  if (flags.mayNeedUnderwriting)
    L.push(`  - Manual underwriting review: ${flags.underwritingReasons.join("; ")}`);
  if (flags.blanketPerItemExceeded)
    L.push(`  - Blanket per-item limit ($50,000) exceeded on one or more items.`);
  if (intake.hasDocumentation)
    L.push(
      `  - Client can provide appraisal/receipt on request${
        intake.documentationNote ? `: ${intake.documentationNote}` : "."
      }`
    );
  if (
    !flags.needsAppraisal &&
    !flags.mayNeedUnderwriting &&
    !flags.blanketPerItemExceeded &&
    !intake.hasDocumentation
  )
    L.push("  - None flagged.");
  return L.join("\n");
}
