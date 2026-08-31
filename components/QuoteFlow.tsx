"use client";

import { useState } from "react";
import QuoteForm from "@/components/QuoteForm";
import DealerForm from "@/components/DealerForm";

type Path = null | "collector" | "dealer";

export default function QuoteFlow() {
  const [path, setPath] = useState<Path>(null);

  if (path === "collector") {
    return <QuoteForm />;
  }
  if (path === "dealer") {
    return <DealerForm onBack={() => setPath(null)} />;
  }

  return (
    <div className="quote-form intake path-select">
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
