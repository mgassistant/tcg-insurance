"use client";

import { useState, useSyncExternalStore } from "react";
import QuoteForm from "@/components/QuoteForm";
import DealerForm from "@/components/DealerForm";
import { parsePortfolioQuoteImport, PORTFOLIO_IMPORT_KEY } from "@/lib/portfolio-import";

type Path = null | "collector" | "dealer";

function readImportSnapshot() {
  if (new URLSearchParams(window.location.search).get("portfolioImport") !== "1") return null;
  try {
    const draft = window.sessionStorage.getItem(PORTFOLIO_IMPORT_KEY);
    if (!draft) return "";
    const { expiresAt } = JSON.parse(draft);
    return typeof expiresAt === "number" && expiresAt > Date.now() ? draft : "";
  } catch {
    return "";
  }
}

const subscribe = () => () => {};
const readServerSnapshot = () => null;

export default function QuoteFlow() {
  const [path, setPath] = useState<Path>(null);

  const snapshot = useSyncExternalStore(subscribe, readImportSnapshot, readServerSnapshot);
  let portfolio = null;
  if (snapshot) {
    portfolio = parsePortfolioQuoteImport(JSON.parse(snapshot).transfer);
  }

  if (portfolio || path === "collector") {
    return <QuoteForm portfolio={portfolio} />;
  }
  if (path === "dealer") {
    return <DealerForm onBack={() => setPath(null)} />;
  }

  return (
    <div className="quote-form intake path-select">
      {snapshot !== null && (
        <p className="note note-info" role="status">
          Your Poké-Trade inventory could not be loaded. You can still enter your collection below or start again from Collection Protection.
        </p>
      )}
      <h3>Who are we insuring?</h3>
      <p className="istep-hint">Choose the option that fits — we&apos;ll ask only what&apos;s relevant.</p>
      <div className="path-cards">
        <button type="button" className="path-card" onClick={() => setPath("collector")}>
          <div className="path-emoji">🃏</div>
          <div className="path-title">Personal collector</div>
          <div className="path-desc">Insure your personal card collection — scheduled items or a blanket policy.</div>
        </button>
        <button type="button" className="path-card" onClick={() => setPath("dealer")}>
          <div className="path-emoji">🏪</div>
          <div className="path-title">Dealer / Shop</div>
          <div className="path-desc">Business coverage for stock, shipping, events, and physical locations.</div>
        </button>
      </div>
    </div>
  );
}
