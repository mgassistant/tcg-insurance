export const PORTFOLIO_IMPORT_KEY = "poke-trade-quote-import-v1";
export const PORTFOLIO_IMPORT_LIFETIME_MS = 30 * 60 * 1000;
export const PORTFOLIO_IMPORT_MAX_BODY = 32_768;
export const PORTFOLIO_IMPORT_MAX_ITEMS = 10;

export type PortfolioQuoteImport = {
  itemCount: number;
  unpricedCount: number;
  marketValue: number;
  items: {
    name: string;
    grade: string;
    grader: string;
    value: number;
  }[];
};

const validCount = (n: unknown): n is number =>
  typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
const validValue = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= Number.MAX_SAFE_INTEGER / 100;

export function parsePortfolioQuoteImport(input: unknown): PortfolioQuoteImport | null {
  if (!input || typeof input !== "object") return null;
  const { itemCount, unpricedCount, marketValue, items } = input as Record<string, unknown>;
  if (!validCount(itemCount) || itemCount === 0 || !validCount(unpricedCount) ||
      unpricedCount > itemCount || !validValue(marketValue) ||
      !Array.isArray(items) || items.length > PORTFOLIO_IMPORT_MAX_ITEMS ||
      items.length > itemCount - unpricedCount) return null;

  const parsedItems: PortfolioQuoteImport["items"] = [];
  for (const item of items as unknown[]) {
    if (!item || typeof item !== "object") return null;
    const { name, grade, grader, value } = item as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim() || name.length > 180 ||
        typeof grade !== "string" || grade.length > 40 ||
        typeof grader !== "string" || grader.length > 20 ||
        !validValue(value) || value === 0) return null;
    parsedItems.push({ name: name.trim(), grade: grade.trim(), grader: grader.trim(), value });
  }
  return { itemCount, unpricedCount, marketValue, items: parsedItems };
}
