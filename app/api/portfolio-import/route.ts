import { randomBytes } from "node:crypto";
import {
  parsePortfolioQuoteImport,
  PORTFOLIO_IMPORT_KEY,
  PORTFOLIO_IMPORT_LIFETIME_MS,
  PORTFOLIO_IMPORT_MAX_BODY,
} from "@/lib/portfolio-import";

const POKE_TRADE_ORIGINS = new Set(["https://www.poke-trade.com", "https://poke-trade.com"]);
const QUOTE_URL = "/?utm_source=poke-trade&utm_medium=referral&utm_campaign=protection&portfolioImport=1#quote";

async function readTransfer(request: Request) {
  if (Number(request.headers.get("content-length")) > PORTFOLIO_IMPORT_MAX_BODY) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;

  const decoder = new TextDecoder();
  let totalBytes = 0;
  let body = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > PORTFOLIO_IMPORT_MAX_BODY) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
    const raw = new URLSearchParams(body + decoder.decode()).get("inventory");
    return raw ? parsePortfolioQuoteImport(JSON.parse(raw)) : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  if (!POKE_TRADE_ORIGINS.has(origin)) {
    return new Response("This portfolio import must start on Poké-Trade.", { status: 403 });
  }
  const formType = request.headers.get("content-type")?.split(";")[0];
  const transfer = formType === "application/x-www-form-urlencoded" ? await readTransfer(request) : null;
  const nonce = randomBytes(16).toString("base64");
  const draft = transfer
    ? JSON.stringify({ expiresAt: Date.now() + PORTFOLIO_IMPORT_LIFETIME_MS, transfer })
    : "";
  // Escape HTML's script opener before embedding the serialized string.
  const escapedDraft = JSON.stringify(draft).replaceAll("<", "\\u003c");

  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><title>Open your insurance quote</title>
    <body><p><a href="${QUOTE_URL.replaceAll("&", "&amp;")}">Continue to your insurance quote</a></p>
    <script nonce="${nonce}">
      try {
        sessionStorage.removeItem(${JSON.stringify(PORTFOLIO_IMPORT_KEY)});
        if (${Boolean(transfer)}) sessionStorage.setItem(${JSON.stringify(PORTFOLIO_IMPORT_KEY)}, ${escapedDraft});
      } catch {}
      location.replace(${JSON.stringify(QUOTE_URL)});
    </script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
