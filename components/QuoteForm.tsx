"use client";

import { useState, useRef, useEffect } from "react";

export default function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const tsRef = useRef<number>(Date.now());
  const [prefill, setPrefill] = useState<{ name: string; email: string; phone: string }>({
    name: "",
    email: "",
    phone: "",
  });

  // Prefill from URL params (e.g. handoff from poke-trade.com protect pages)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    setPrefill({
      name: p.get("name") || "",
      email: p.get("email") || "",
      phone: p.get("phone") || "",
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: (data.get("name") as string) || "",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      collectorType: (data.get("collectorType") as string) || "",
      collectionValue: (data.get("collectionValue") as string) || "",
      state: (data.get("state") as string) || "",
      _hp: (data.get("company") as string) || "",
      _ts: tsRef.current,
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        setError(result.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="form-done">
        <div className="big">🛡️</div>
        <h3>Request received.</h3>
        <p>
          Thanks — a licensed agent will reach out shortly to confirm your details and
          walk through the coverage that may be available for your collection.
        </p>
      </div>
    );
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      {/* Honeypot */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="f-row">
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" required placeholder="Jordan Reyes" defaultValue={prefill.name} key={`n-${prefill.name}`} />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" required placeholder="(555) 123-4567" defaultValue={prefill.phone} key={`p-${prefill.phone}`} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@email.com" defaultValue={prefill.email} key={`e-${prefill.email}`} />
      </div>

      <div className="f-row">
        <div className="field">
          <label htmlFor="collectorType">I'm a…</label>
          <select id="collectorType" name="collectorType" required defaultValue="">
            <option value="" disabled>Select one</option>
            <option value="collector">Collector</option>
            <option value="store">Game store</option>
            <option value="dealer">Dealer</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="collectionValue">Est. collection value</label>
          <select id="collectionValue" name="collectionValue" required defaultValue="">
            <option value="" disabled>Select range</option>
            <option value="under_10k">Under $10k</option>
            <option value="10k_50k">$10k – $50k</option>
            <option value="50k_100k">$50k – $100k</option>
            <option value="100k_500k">$100k – $500k</option>
            <option value="over_500k">Over $500k</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="state">State</label>
        <input id="state" name="state" type="text" placeholder="CA" maxLength={20} />
      </div>

      {error && <p className="err">{error}</p>}

      <button className="btn btn-holo btn-lg" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Get my free quote"}
      </button>

      <p className="fine">
        By submitting, you agree to be contacted about coverage that may be available for
        your collection. No obligation. Coverage is subject to eligibility, underwriting,
        and policy terms.
      </p>
    </form>
  );
}
