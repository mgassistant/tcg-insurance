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

// ═══════════════════════════════════════════════════════════════════
// CATEGORY FIELD SPEC (WAX "Item Detail Requirements" guide)
// Single source of truth: the form renders these inputs per category,
// and the Consilium email maps each captured value to its target field
// in the portal (Brand of Artist / Name / Serial Number / Reference
// Number / Attachments). `consilium` is the portal box each field maps
// into; when the mapping is non-obvious the email surfaces it in parens.
// ═══════════════════════════════════════════════════════════════════

export type ConsiliumField =
  | "Brand of Artist"
  | "Name"
  | "Serial Number"
  | "Reference Number"
  | "Attachments";

export interface CategoryFieldDef {
  key: string; // stored in item.fields[key]
  label: string; // form label
  placeholder?: string;
  consilium: ConsiliumField; // which Consilium box it maps to
  // Multiple defs can map to the same Consilium box (e.g. Jewelry type+material
  // both go to "Brand of Artist"); `group` lets the email join them.
  group?: string;
}

export interface CategorySpec {
  // Ordered field definitions shown for this category.
  fields: CategoryFieldDef[];
  // Categories requiring the ">$15K income from use" Yes/No (cameras/instruments).
  incomeConfirmation?: boolean;
  // Categories requiring "When and how are they stored?" (cards/memorabilia/collectibles).
  requiresStorage?: boolean;
}

// Per-category specs. Categories NOT listed fall back to a generic spec.
export const CATEGORY_SPECS: Record<string, CategorySpec> = {
  Watches: {
    fields: [
      { key: "brand", label: "Brand", placeholder: "e.g. Rolex", consilium: "Brand of Artist" },
      { key: "model", label: "Model", placeholder: "e.g. Submariner", consilium: "Name" },
      {
        key: "refNumber",
        label: "Reference Number",
        placeholder: "e.g. 116500LN (if available)",
        consilium: "Reference Number",
      },
      {
        key: "serialNumber",
        label: "Serial Number",
        placeholder: "if available",
        consilium: "Serial Number",
      },
    ],
  },
  Jewelry: {
    fields: [
      {
        key: "jewelryType",
        label: "Type of jewelry",
        placeholder: "e.g. ring, necklace",
        consilium: "Brand of Artist",
        group: "brand",
      },
      {
        key: "material",
        label: "Material",
        placeholder: "e.g. gold, platinum",
        consilium: "Brand of Artist",
        group: "brand",
      },
      {
        key: "fourCs",
        label: "The 4 C's (Cut, Color, Clarity, Carat)",
        placeholder: "e.g. Excellent, F, VS1, 1.2ct",
        consilium: "Name",
      },
      {
        key: "giaOrSerial",
        label: "GIA or Serial Number",
        placeholder: "if available",
        consilium: "Serial Number",
      },
    ],
  },
  "Fine Art": {
    fields: [
      {
        key: "artist",
        label: "Artist name",
        placeholder: "e.g. Roy Lichtenstein",
        consilium: "Brand of Artist",
      },
      {
        key: "artworkNameYear",
        label: "Artwork name & year",
        placeholder: "e.g. Whaam!, 1963",
        consilium: "Name",
      },
      {
        key: "medium",
        label: "Medium",
        placeholder: "e.g. painting, sculpture",
        consilium: "Serial Number",
      },
      {
        key: "dimensions",
        label: "Dimensions",
        placeholder: "e.g. 72 x 36",
        consilium: "Reference Number",
      },
    ],
  },
  "Vintage Cameras": {
    fields: [
      { key: "brand", label: "Brand / Make", placeholder: "e.g. Leica", consilium: "Brand of Artist" },
      { key: "model", label: "Model", placeholder: "e.g. M3", consilium: "Name" },
      { key: "serialNumber", label: "Serial Number", placeholder: "if available", consilium: "Serial Number" },
    ],
    incomeConfirmation: true,
  },
  "Musical Instruments": {
    fields: [
      { key: "brand", label: "Brand / Maker", placeholder: "e.g. Gibson", consilium: "Brand of Artist" },
      { key: "model", label: "Model", placeholder: "e.g. Les Paul '59", consilium: "Name" },
      { key: "serialNumber", label: "Serial Number", placeholder: "if available", consilium: "Serial Number" },
    ],
    incomeConfirmation: true,
  },
  // MG's core niche — not in the WAX doc; sensible card fields.
  "Trading Cards": {
    fields: [
      {
        key: "cardName",
        label: "Player / Set / Card name",
        placeholder: "e.g. 1999 Base Set Charizard",
        consilium: "Name",
      },
      {
        key: "gradeAuth",
        label: "Grading Co. + Grade",
        placeholder: "e.g. PSA 10",
        consilium: "Serial Number",
      },
    ],
    requiresStorage: true,
  },
  "Sports Memorabilia": {
    fields: [
      {
        key: "itemName",
        label: "Player / Team / Item name",
        placeholder: "e.g. Kobe Bryant game-worn jersey",
        consilium: "Name",
      },
      {
        key: "authentication",
        label: "Authentication (JSA/PSA-DNA/Beckett) + cert #",
        placeholder: "e.g. JSA-8842",
        consilium: "Serial Number",
      },
    ],
    requiresStorage: true,
  },
  "Memorabilia & Autographs": {
    fields: [
      {
        key: "itemName",
        label: "Signer / Item name",
        placeholder: "e.g. Michael Jordan signed photo",
        consilium: "Name",
      },
      {
        key: "authentication",
        label: "Authentication (JSA/PSA-DNA/Beckett) + cert #",
        placeholder: "e.g. PSA-DNA 112233",
        consilium: "Serial Number",
      },
    ],
    requiresStorage: true,
  },
  Coins: {
    fields: [
      { key: "name", label: "Coin / Item name", placeholder: "e.g. 1909-S VDB Lincoln Cent", consilium: "Name" },
      { key: "grade", label: "Grade (required — must be graded)", placeholder: "e.g. PCGS MS65", consilium: "Serial Number" },
    ],
  },
  Stamps: {
    fields: [
      { key: "name", label: "Stamp / Item name", placeholder: "e.g. Inverted Jenny", consilium: "Name" },
      { key: "grade", label: "Grade (required — must be graded)", placeholder: "e.g. PSE 90", consilium: "Serial Number" },
    ],
    requiresStorage: true,
  },
};

// Generic spec for any category without a dedicated one.
export const GENERIC_SPEC: CategorySpec = {
  fields: [
    { key: "brand", label: "Brand / Type", placeholder: "e.g. brand or maker", consilium: "Brand of Artist" },
    { key: "name", label: "Name / Description", placeholder: "e.g. what it is", consilium: "Name" },
    { key: "serialNumber", label: "Serial / Model", placeholder: "if available", consilium: "Serial Number" },
  ],
};

export function specForCategory(category: string): CategorySpec {
  return CATEGORY_SPECS[category] || GENERIC_SPEC;
}

// A single scheduled/blanket item on the intake.
export interface IntakeItem {
  category: string;
  // Legacy/simple fields (kept for backward compat + as a fallback summary).
  brandType: string;
  description: string;
  // For Trading Cards this holds "PSA 10"; else a serial/model reference.
  serialOrGrade: string;
  value: number; // USD
  // Category-specific captured values keyed by CategoryFieldDef.key.
  fields?: Record<string, string>;
  // Cameras / musical instruments: does the client earn > $15K/yr from USE of
  // the item? true = commercial exposure = decline. Required Yes/No for those
  // categories (undefined = not answered).
  earnsOver15k?: boolean;
  // Client-facing confirmation checkbox: "I do NOT earn > $15K from use."
  // true = confirmed compliant. Mirror of earnsOver15k (earnsOver15k = !confirmed).
  useIncomeConfirmed?: boolean;
  // Trading cards / memorabilia / collectibles: "When and how are they stored?"
  storage?: string;
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

// ═══════════════════════════════════════════════════════════════════
// WAX Broker Underwriting Guide (April 2026) — AUTHORITATIVE.
// These numbers supersede any earlier thresholds.
// ═══════════════════════════════════════════════════════════════════

// ---- Canonical underwriting classes ----
export type UWClass =
  | "watches"
  | "jewelry"
  | "handbags"
  | "cardsMemorabilia" // trading cards, memorabilia, stamps & collectibles
  | "fineArt"
  | "coins"
  | "cameras"
  | "instruments"
  | "wine"
  | "fursSilverMisc"
  | "other";

export function classForCategory(category: string): UWClass {
  const c = (category || "").toLowerCase();
  if (c.includes("watch")) return "watches";
  if (c.includes("jewelry") || c.includes("jewellery")) return "jewelry";
  if (c.includes("handbag")) return "handbags";
  if (c.includes("fine art") || c === "art") return "fineArt";
  if (c.includes("coin") || c.includes("stamp") || c.includes("currency"))
    // Coins have their own review threshold; stamps ride with cards/collectibles.
    return c.includes("coin") ? "coins" : "cardsMemorabilia";
  if (c.includes("camera")) return "cameras";
  if (c.includes("musical") || c.includes("instrument")) return "instruments";
  if (c.includes("wine") || c.includes("liquor")) return "wine";
  if (
    c.includes("trading card") ||
    c.includes("memorabilia") ||
    c.includes("autograph") ||
    c.includes("sports")
  )
    return "cardsMemorabilia";
  return "other";
}

// ---- Per-item appraisal / bill-of-sale threshold (Guide #1) ----
// Watches $50K; everything else $25K.
export function appraisalThresholdForCategory(category: string): number {
  return classForCategory(category) === "watches"
    ? APPRAISAL_WATCH_THRESHOLD
    : APPRAISAL_ITEM_THRESHOLD;
}

// Numismatics (coins/stamps/currency) require a grade on every item.
export function requiresGrade(category: string): boolean {
  const c = (category || "").toLowerCase();
  return c.includes("coin") || c.includes("stamp") || c.includes("currency");
}

// ---- Manual-underwriting-review / credit-eligibility thresholds (Guide #2) ----
// Returns the class total above which underwriting review / credits apply.
// (Straight-through <= threshold; review above.) State-aware for CA/FL on
// cards/memorabilia/collectibles and fine art.
export function reviewThresholdForCategory(
  category: string,
  state: string
): number | null {
  const isCaFl = CA_FL.has(normState(state));
  switch (classForCategory(category)) {
    case "watches":
    case "jewelry":
      return 200_000;
    case "handbags":
    case "cardsMemorabilia":
      return isCaFl ? 100_000 : 200_000;
    case "fineArt":
      return isCaFl ? 250_000 : 750_000;
    case "coins":
      return 250_000;
    case "cameras":
      return 50_000;
    case "instruments":
      return 100_000;
    case "fursSilverMisc":
      return 50_000;
    case "wine":
      // Wine is manual-underwriting; flag on material totals.
      return 200_000;
    default:
      return null;
  }
}

// ---- Eligibility screening / hard declines (Guide #4) ----
export interface EligibilityIssue {
  itemIndex: number; // -1 for whole-intake issues
  category: string;
  message: string;
  severity: "decline" | "warn";
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
  // A class total exceeds $200K → credit-eligible; occupation/LinkedIn matter.
  creditEligible: boolean;
  // Hard-decline / not-accepted screening results.
  eligibilityIssues: EligibilityIssue[];
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

    if (val > appraisalThresholdForCategory(item.category)) {
      needsAppraisalItems.push(
        `${itemShortLabel(item) || itemLabel(item, idx)} ($${val.toLocaleString()})`
      );
    }

    if (intake.coverageType === "blanket" && val > BLANKET_PER_ITEM_LIMIT) {
      blanketPerItemExceeded = true;
    }

    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + val;
  });

  // Underwriting review: aggregate by canonical UW class and compare each
  // class total against ITS threshold (state-aware).
  const underwritingReasons: string[] = [];
  const byClass: Record<string, { total: number; sample: string }> = {};
  items.forEach((item) => {
    const cls = classForCategory(item.category);
    if (!byClass[cls]) byClass[cls] = { total: 0, sample: item.category };
    byClass[cls].total += Number(item.value) || 0;
  });
  let creditEligible = false;
  for (const { total, sample } of Object.values(byClass)) {
    const threshold = reviewThresholdForCategory(sample, state);
    if (threshold != null && total > threshold) {
      const caFlNote =
        CA_FL.has(normState(state)) &&
        (classForCategory(sample) === "cardsMemorabilia" ||
          classForCategory(sample) === "handbags" ||
          classForCategory(sample) === "fineArt")
          ? " (CA/FL threshold)"
          : "";
      underwritingReasons.push(
        `${sample}-class total (${usd(total)}) exceeds ${usd(threshold)}${caFlNote}`
      );
    }
    if (total > 200_000) creditEligible = true;
  }

  return {
    totalValue,
    itemCount: items.length,
    needsAppraisal: needsAppraisalItems.length > 0,
    needsAppraisalItems,
    mayNeedUnderwriting: underwritingReasons.length > 0,
    underwritingReasons,
    blanketPerItemExceeded,
    creditEligible,
    eligibilityIssues: screenEligibility(intake),
  };
}

// ═══════════════════════════════════════════════════════════════════
// Eligibility screening (Guide #4 hard declines / not-accepted).
// Returns issues to surface; does NOT block submission.
// ═══════════════════════════════════════════════════════════════════
const ICED_OUT_RE = /(iced.?out|cuban link|cuban-link|aftermarket (diamond|stone))/i;
const FIREARM_RE = /(firearm|gun|rifle|pistol|revolver|shotgun)/i;
const PERSONAL_PROPERTY_RE =
  /(worn clothing|everyday (shoes|clothes)|military uniform|non-?vintage electronics|power tools)/i;

export function screenEligibility(intake: QuoteIntake): EligibilityIssue[] {
  const issues: EligibilityIssue[] = [];
  (intake.items || []).forEach((item, i) => {
    const cls = classForCategory(item.category);
    const blob = [
      item.category,
      item.brandType,
      item.description,
      ...(item.fields ? Object.values(item.fields) : []),
    ]
      .join(" ")
      .toLowerCase();

    // Cameras / musical instruments earning > $15K from use → commercial → decline.
    if ((cls === "cameras" || cls === "instruments") && item.earnsOver15k === true) {
      issues.push({
        itemIndex: i,
        category: item.category,
        severity: "decline",
        message:
          "Earns more than $15K/yr from use → this is a commercial exposure and WAX declines it. Contact us about a commercial option.",
      });
    }

    // Iced-out jewelry / Cuban link / aftermarket stones / custom iced-out watches.
    if ((cls === "jewelry" || cls === "watches") && ICED_OUT_RE.test(blob)) {
      issues.push({
        itemIndex: i,
        category: item.category,
        severity: "warn",
        message:
          "\"Iced out\" pieces (aftermarket diamonds/stones), Cuban link chains/bracelets, and custom iced-out watches are not accepted by WAX. Contact us.",
      });
    }

    // Firearms: only >100 yrs old WITH documentation, quoted under "Other".
    if (FIREARM_RE.test(blob)) {
      if (cls !== "other") {
        issues.push({
          itemIndex: i,
          category: item.category,
          severity: "warn",
          message:
            "Firearms are only eligible if 100+ years old with documentation, and must be quoted under category \"Other\". Modern firearms are not covered.",
        });
      } else {
        issues.push({
          itemIndex: i,
          category: item.category,
          severity: "warn",
          message:
            "Firearm noted under \"Other\": eligible only if 100+ years old with documentation. We'll confirm.",
        });
      }
    }

    // General personal property.
    if (PERSONAL_PROPERTY_RE.test(blob)) {
      issues.push({
        itemIndex: i,
        category: item.category,
        severity: "warn",
        message:
          "General personal property (regularly worn clothing/shoes, in-use uniforms, non-vintage electronics/tools) is not covered by WAX.",
      });
    }
  });
  return issues;
}

// ---- Blanket eligibility (Guide #7) ----
// Jewelry/Watches blanket requires $1M+ in scheduled items first; other
// collectibles (incl. cards, wine) available from first dollar. Per-item
// blanket limit $50K in all cases. Returns an informational note or null.
export function blanketNoteForIntake(intake: QuoteIntake): string | null {
  if (intake.coverageType !== "blanket") return null;
  const hasJewelryWatch = (intake.items || []).some((it) => {
    const cls = classForCategory(it.category);
    return cls === "jewelry" || cls === "watches";
  });
  if (hasJewelryWatch) {
    return "Blanket coverage for jewelry/watches requires $1M+ in scheduled items first, then a $50K per-item blanket limit. We'll confirm your scheduled total.";
  }
  return "Blanket coverage for collectibles is available from the first dollar with a $50K per-item limit. Provide your total item count, storage details, and your 10 most valuable items.";
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

// Build Consilium-mapped rows for one item, using the category spec.
// Each row is [displayLabel, value] where displayLabel makes the target
// Consilium box explicit when the mapping is non-obvious, e.g.
//   "Serial Number (Medium)"  or  "Brand of Artist (Type + Material)".
// Groups (multiple fields → one Consilium box) are joined into one row.
export function consiliumItemRows(item: IntakeItem): [string, string][] {
  const spec = specForCategory(item.category);
  const f = item.fields || {};
  const rows: [string, string][] = [];
  const seenGroups = new Set<string>();

  for (const def of spec.fields) {
    // Grouped fields (e.g. Jewelry type+material) collapse into one row.
    if (def.group) {
      if (seenGroups.has(def.group)) continue;
      seenGroups.add(def.group);
      const groupDefs = spec.fields.filter((d) => d.group === def.group);
      const values = groupDefs.map((d) => (f[d.key] || "").trim()).filter(Boolean);
      const srcLabels = groupDefs.map((d) => d.label).join(" + ");
      rows.push([`${def.consilium} (${srcLabels})`, values.join(" / ")]);
      continue;
    }

    const value = (f[def.key] || "").trim();
    // Decide whether to annotate the Consilium box with the source meaning.
    // Obvious 1:1 (label already names the Consilium box) → show plain label.
    const labelNamesBox =
      def.label.toLowerCase().replace(/[^a-z]/g, "") ===
        def.consilium.toLowerCase().replace(/[^a-z]/g, "") ||
      def.label.toLowerCase().includes(def.consilium.toLowerCase());
    const display = labelNamesBox
      ? def.consilium
      : `${def.consilium} (${def.label})`;
    rows.push([display, value]);
  }

  // Storage question for cards / memorabilia / collectibles.
  if (spec.requiresStorage) {
    rows.push(["Storage (when & how stored)", (item.storage || "").trim() || "— not provided"]);
  }

  // Always include Current Value.
  rows.push(["Current Value", usd(item.value)]);

  // Income Yes/No for cameras / instruments.
  if (spec.incomeConfirmation) {
    rows.push([
      "Earns > $15K/yr from use?",
      item.earnsOver15k === true
        ? "YES — commercial exposure, WAX DECLINES (follow up)"
        : item.earnsOver15k === false
        ? "No — eligible (personal use)"
        : "Not answered — follow up before quoting",
    ]);
  }
  return rows;
}

// A short human label for an item (used in flag messages / summaries).
export function itemShortLabel(item: IntakeItem): string {
  const f = item.fields || {};
  const spec = specForCategory(item.category);
  const nameDef = spec.fields.find((d) => d.consilium === "Name");
  const brandDef = spec.fields.find((d) => d.consilium === "Brand of Artist");
  const name = (nameDef && f[nameDef.key]) || item.description || "";
  const brand = (brandDef && f[brandDef.key]) || item.brandType || "";
  return [item.category, brand, name].filter(Boolean).join(" · ");
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
          ...consiliumItemRows(item).map(
            ([k, v]) => [k, esc(v)] as [string, string]
          ),
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
  if (flags.creditEligible) {
    flagBits.push(
      `<li><b>Credit-eligible quote</b> (a class total exceeds $200K) — occupation &amp; LinkedIn matter for underwriting.</li>`
    );
  }
  if (intake.hasDocumentation) {
    flagBits.push(
      `<li>Client indicated they can provide appraisal/receipt on request${
        intake.documentationNote ? `: ${esc(intake.documentationNote)}` : "."
      }</li>`
    );
  }

  // Eligibility screening (declines / not-accepted).
  const eligBits = (flags.eligibilityIssues || []).map(
    (e) =>
      `<li style="color:${e.severity === "decline" ? "#B00020" : "#8A6D00"}"><b>${
        e.severity === "decline" ? "DECLINE" : "Not accepted / check"
      } — ${esc(e.category)}:</b> ${esc(e.message)}</li>`
  );
  const eligBlock = eligBits.length
    ? `<h3 style="margin:22px 0 8px;font:600 15px sans-serif;color:#B00020">⚠ Eligibility Screening</h3>
       <ul style="font:14px sans-serif;margin:0;padding-left:20px">${eligBits.join("")}</ul>`
    : "";

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
    ${eligBlock}
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
    for (const [k, v] of consiliumItemRows(item)) {
      L.push(`    ${k}: ${v || "—"}`);
    }
  });
  L.push("");
  L.push("4) UNDERWRITING FLAGS");
  if (flags.needsAppraisal)
    L.push(`  - Appraisal/bill of sale required: ${flags.needsAppraisalItems.join("; ")}`);
  if (flags.mayNeedUnderwriting)
    L.push(`  - Manual underwriting review: ${flags.underwritingReasons.join("; ")}`);
  if (flags.blanketPerItemExceeded)
    L.push(`  - Blanket per-item limit ($50,000) exceeded on one or more items.`);
  if (flags.creditEligible)
    L.push(
      `  - Credit-eligible quote (class total > $200K): occupation & LinkedIn matter for underwriting.`
    );
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
    !flags.creditEligible &&
    !intake.hasDocumentation
  )
    L.push("  - None flagged.");

  if ((flags.eligibilityIssues || []).length) {
    L.push("");
    L.push("!! ELIGIBILITY SCREENING");
    for (const e of flags.eligibilityIssues) {
      L.push(
        `  - [${e.severity === "decline" ? "DECLINE" : "CHECK"}] ${e.category}: ${e.message}`
      );
    }
  }
  return L.join("\n");
}
