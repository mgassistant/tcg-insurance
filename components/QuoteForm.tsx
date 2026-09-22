"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  ITEM_CATEGORIES,
  GRADING_COMPANIES,
  BLANKET_PER_ITEM_LIMIT,
  NEWLY_ACQUIRED_PCT,
  NEWLY_ACQUIRED_DAYS,
  reviewThresholdForCategory,
  appraisalThresholdForCategory,
  specForCategory,
  requiresGrade,
  screenEligibility,
  usd,
  type CoverageType,
  type IntakeItem,
} from "@/lib/intake";

// ---- Local form shapes (strings while editing; coerced on submit) ----
type FormItem = {
  id: number;
  category: string;
  description: string; // optional free-text note kept for all categories
  // Category-specific values keyed by CategoryFieldDef.key (from lib/intake).
  fields: Record<string, string>;
  // Trading Cards convenience: grading company chosen via dropdown, combined
  // with the "grade" field on submit into the spec's gradeAuth field.
  gradingCo: string;
  // Cameras / instruments: does client earn > $15K/yr from use? (Yes/No)
  earnsOver15k: "" | "yes" | "no";
  // Cards / memorabilia / collectibles: when & how stored.
  storage: string;
  value: string;
};

type Client = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  occupation: string;
  social: string;
};

let ITEM_SEQ = 1;
function newItem(category = "Trading Cards"): FormItem {
  return {
    id: ITEM_SEQ++,
    category,
    description: "",
    fields: {},
    gradingCo: "PSA",
    earnsOver15k: "",
    storage: "",
    value: "",
  };
}

const STEPS = ["Your info", "Coverage", "Items", "Review"] as const;

export default function QuoteForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState(""); // honeypot
  const [ts] = useState(() => Date.now());

  // Partial / abandoned lead capture guards.
  const partialSentRef = useRef(false);
  const submittedRef = useRef(false);
  // Latest client snapshot for unload-time reads (event handlers close over stale state).
  const clientRef = useRef<Client | null>(null);

  const [client, setClient] = useState<Client>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    occupation: "",
    social: "",
  });

  const [coverageType, setCoverageType] = useState<CoverageType>("scheduled");
  const [items, setItems] = useState<FormItem[]>([newItem()]);
  const [blanketTotalItems, setBlanketTotalItems] = useState("");
  const [blanketTotalValue, setBlanketTotalValue] = useState("");
  const [hasDocumentation, setHasDocumentation] = useState(false);
  const [documentationNote, setDocumentationNote] = useState("");

  // Prefill client from URL params (handoff from other sites)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const name = p.get("name") || "";
    const [fn, ...rest] = name.split(" ");
    setClient((c) => ({
      ...c,
      firstName: p.get("firstName") || fn || "",
      lastName: p.get("lastName") || rest.join(" ") || "",
      email: p.get("email") || "",
      phone: p.get("phone") || "",
      state: p.get("state") || "",
    }));
  }, []);

  // Keep a live snapshot for the unload-time beacon (avoids stale closures).
  useEffect(() => {
    clientRef.current = client;
  }, [client]);

  // ---- Partial / abandoned lead capture ----------------------------------
  // Fire once, as soon as we have real contact info, even if the visitor
  // abandons before final submit. Marked partial so BrokerIQ de-dupes and the
  // eventual full submission updates the same record.
  function buildPartialPayload(c: Client) {
    const email = c.email.trim().toLowerCase();
    const phone = c.phone.trim();
    return {
      partial: true,
      lead_status: "partial",
      name: `${c.firstName} ${c.lastName}`.trim(),
      email,
      phone,
      state: c.state.trim() || "CA",
      source: "tcg-insurance.com",
      raw: {
        partial: true,
        lead_status: "partial",
        version: 2,
        client: c,
      },
    };
  }

  function hasEnoughContact(c: Client): boolean {
    const hasEmail = c.email.includes("@");
    const hasPhone = c.phone.replace(/\D/g, "").length >= 10;
    const hasName = c.firstName.trim().length > 0 || c.lastName.trim().length > 0;
    return hasName && (hasEmail || hasPhone);
  }

  // beacon=true uses navigator.sendBeacon for the page-unload path; otherwise a
  // keepalive fetch for the in-page path.
  function sendPartialLead(beacon: boolean) {
    if (partialSentRef.current || submittedRef.current) return;
    const c = clientRef.current || client;
    if (!hasEnoughContact(c)) return;
    partialSentRef.current = true;
    const endpoint = "/api/quote";
    const data = buildPartialPayload(c);
    try {
      if (beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        navigator.sendBeacon(endpoint, blob);
      } else {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Never let partial capture break the form.
    }
  }

  // TRIGGER 2 (abandon): capture on page leave / tab hide.
  useEffect(() => {
    const onPageHide = () => sendPartialLead(true);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendPartialLead(true);
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Derived, live totals/flags for reassurance banners ----
  const totalValue = useMemo(
    () => items.reduce((s, it) => s + (parseFloat(it.value) || 0), 0),
    [items]
  );

  const appraisalItems = useMemo(
    () =>
      items.filter(
        (it) =>
          (parseFloat(it.value) || 0) > appraisalThresholdForCategory(it.category)
      ),
    [items]
  );

  const underwritingHit = useMemo(() => {
    const classTotals: Record<string, { total: number; sample: string }> = {};
    for (const it of items) {
      const th = reviewThresholdForCategory(it.category, client.state);
      if (th == null) continue;
      const key = `${th}`;
      if (!classTotals[key]) classTotals[key] = { total: 0, sample: it.category };
      classTotals[key].total += parseFloat(it.value) || 0;
    }
    const reasons: string[] = [];
    for (const { total, sample } of Object.values(classTotals)) {
      const th = reviewThresholdForCategory(sample, client.state);
      if (th != null && total > th) {
        reasons.push(`${sample} totals over ${usd(th)}`);
      }
    }
    return reasons;
  }, [items, client.state]);

  const blanketExceeded = useMemo(
    () =>
      coverageType === "blanket" &&
      items.some((it) => (parseFloat(it.value) || 0) > BLANKET_PER_ITEM_LIMIT),
    [coverageType, items]
  );

  // Live eligibility screening (declines / not-accepted).
  const toIntakeItems = (): IntakeItem[] =>
    items.map((it) => ({
      category: it.category,
      brandType: "",
      description: it.description,
      serialOrGrade: "",
      value: parseFloat(it.value) || 0,
      fields: it.fields,
      earnsOver15k:
        it.earnsOver15k === "" ? undefined : it.earnsOver15k === "yes",
      storage: it.storage,
    }));

  const eligibilityIssues = useMemo(
    () =>
      screenEligibility({
        client: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dob: "",
          street: "",
          city: "",
          state: client.state,
          zip: "",
          occupation: "",
          social: "",
        },
        coverageType,
        items: toIntakeItems(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, client.state, coverageType]
  );

  // ---- Item helpers ----
  function updateItem(id: number, patch: Partial<FormItem>) {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function updateItemField(id: number, key: string, value: string) {
    setItems((arr) =>
      arr.map((it) =>
        it.id === id ? { ...it, fields: { ...it.fields, [key]: value } } : it
      )
    );
  }
  function addItem() {
    setItems((arr) => [...arr, newItem()]);
  }
  function removeItem(id: number) {
    setItems((arr) => (arr.length > 1 ? arr.filter((it) => it.id !== id) : arr));
  }

  // ---- Step validation ----
  function validateStep(s: number): string | null {
    if (s === 0) {
      if (client.firstName.trim().length < 1) return "Please enter your first name.";
      if (client.lastName.trim().length < 1) return "Please enter your last name.";
      const email = client.email.trim().toLowerCase();
      if (!email.includes("@") || !email.includes(".")) return "Please enter a valid email.";
      if (client.phone.replace(/\D/g, "").length < 10)
        return "Please enter a valid US phone number.";
    }
    if (s === 2) {
      if (items.length === 0) return "Add at least one item.";
      for (const it of items) {
        const spec = specForCategory(it.category);
        if (!it.category) return "Every item needs a category.";
        if (!(parseFloat(it.value) > 0)) return "Every item needs a current value.";
        if (spec.incomeConfirmation && it.earnsOver15k === "") {
          return "Please answer the >$15K income-from-use question for cameras/instruments.";
        }
        if (spec.requiresStorage && !it.storage.trim()) {
          return "Please tell us when & how the cards/memorabilia are stored.";
        }
        if (requiresGrade(it.category) && !(it.fields.grade || "").trim()) {
          return "Coins, stamps & currency must be graded — please add a grade.";
        }
      }
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    // TRIGGER 1 (in-page): advancing past the contact step (step 0) means name
    // + email/phone are validated — capture the partial lead now.
    if (step === 0) sendPartialLead(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  // ---- Build payload + submit ----
  async function submit() {
    for (let s = 0; s <= 2; s++) {
      const err = validateStep(s);
      if (err) {
        setError(err);
        setStep(s);
        return;
      }
    }
    setError(null);
    // Full submit in progress — prevent any partial capture from firing.
    submittedRef.current = true;
    setStatus("loading");

    const payloadItems = items.map((it) => {
      const spec = specForCategory(it.category);
      const isCard = it.category.toLowerCase().includes("trading card");

      // Assemble the category-specific fields bag from the spec.
      const fields: Record<string, string> = {};
      for (const def of spec.fields) {
        let v = (it.fields[def.key] || "").trim();
        // Trading Cards: fold the grading-company dropdown into gradeAuth.
        if (isCard && def.key === "gradeAuth") {
          v = [it.gradingCo, it.fields.gradeAuth || ""].filter(Boolean).join(" ").trim();
        }
        fields[def.key] = v;
      }

      // Legacy/summary fields for backward compat.
      const brandDef = spec.fields.find((d) => d.consilium === "Brand of Artist");
      const nameDef = spec.fields.find((d) => d.consilium === "Name");
      const serialDef = spec.fields.find((d) => d.consilium === "Serial Number");
      const brandType = brandDef ? fields[brandDef.key] : "";
      const description = [nameDef ? fields[nameDef.key] : "", it.description.trim()]
        .filter(Boolean)
        .join(" — ");
      const serialOrGrade = serialDef ? fields[serialDef.key] : "";

      return {
        category: it.category,
        brandType,
        description,
        serialOrGrade,
        value: parseFloat(it.value) || 0,
        fields,
        earnsOver15k:
          it.earnsOver15k === "" ? undefined : it.earnsOver15k === "yes",
        storage: spec.requiresStorage ? it.storage.trim() : undefined,
      };
    });

    const payload = {
      // v2 rich intake
      version: 2,
      client: {
        firstName: client.firstName.trim(),
        lastName: client.lastName.trim(),
        email: client.email.trim().toLowerCase(),
        phone: client.phone.trim(),
        dob: client.dob.trim(),
        street: client.street.trim(),
        city: client.city.trim(),
        state: client.state.trim(),
        zip: client.zip.trim(),
        occupation: client.occupation.trim(),
        social: client.social.trim(),
      },
      coverageType,
      items: payloadItems,
      blanketTotalItems:
        coverageType === "blanket" ? parseInt(blanketTotalItems) || undefined : undefined,
      blanketTotalValue:
        coverageType === "blanket" ? parseFloat(blanketTotalValue) || undefined : undefined,
      hasDocumentation,
      documentationNote: documentationNote.trim(),
      // spam-guard fields (must be top-level for spamCheck)
      name: `${client.firstName} ${client.lastName}`.trim(),
      email: client.email.trim().toLowerCase(),
      phone: client.phone.trim(),
      _hp: hp,
      _ts: ts,
    };

    // Verify email before submit (blocks spam/typos). Fails open.
    if (client.email && client.email.includes("@")) {
      try {
        const vr = await fetch('/api/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: client.email.trim() }) });
        const vj = await vr.json();
        if (vj && vj.ok === false) { setError('Please enter a valid email address so we can reach you.'); setStatus("idle"); return; }
      } catch {}
    }

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
        <h3>Quote request received.</h3>
        <p>
          Thanks — a licensed BetterHelp Insurance agent will prepare your quote and reach out shortly to
          confirm details. This is a request, not a bound policy; coverage is subject to
          underwriting and carrier approval.
        </p>
      </div>
    );
  }

  return (
    <div className="quote-form intake">
      {/* Honeypot */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>

      {/* Step indicator */}
      <ol className="intake-steps" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`istep ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
          >
            <span className="istep-n">{i < step ? "✓" : i + 1}</span>
            <span className="istep-l">{label}</span>
          </li>
        ))}
      </ol>

      {/* ---------- Step 1: Client info ---------- */}
      {step === 0 && (
        <div className="istep-panel">
          <div className="f-row">
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                value={client.firstName}
                onChange={(e) => setClient({ ...client, firstName: e.target.value })}
                placeholder="Jordan"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                value={client.lastName}
                onChange={(e) => setClient({ ...client, lastName: e.target.value })}
                placeholder="Reyes"
                required
              />
            </div>
          </div>
          <div className="f-row">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>
          <div className="f-row">
            <div className="field">
              <label htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                type="date"
                value={client.dob}
                onChange={(e) => setClient({ ...client, dob: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="occupation">Occupation</label>
              <input
                id="occupation"
                value={client.occupation}
                onChange={(e) => setClient({ ...client, occupation: e.target.value })}
                placeholder="e.g. Software engineer"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="street">Street address</label>
            <input
              id="street"
              value={client.street}
              onChange={(e) => setClient({ ...client, street: e.target.value })}
              placeholder="123 Main St"
            />
          </div>
          <div className="f-row f-row-3">
            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                value={client.city}
                onChange={(e) => setClient({ ...client, city: e.target.value })}
                placeholder="Los Angeles"
              />
            </div>
            <div className="field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                value={client.state}
                onChange={(e) => setClient({ ...client, state: e.target.value })}
                placeholder="CA"
                maxLength={20}
              />
            </div>
            <div className="field">
              <label htmlFor="zip">ZIP</label>
              <input
                id="zip"
                value={client.zip}
                onChange={(e) => setClient({ ...client, zip: e.target.value })}
                placeholder="90001"
                maxLength={10}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="social">Social / LinkedIn URL</label>
            <input
              id="social"
              value={client.social}
              onChange={(e) => setClient({ ...client, social: e.target.value })}
              placeholder="linkedin.com/in/…  (preferred when available)"
            />
            <p className="fine">
              LinkedIn preferred when available. Occupation &amp; LinkedIn matter for
              credit-eligible quotes (collections over $200K).
            </p>
          </div>
        </div>
      )}

      {/* ---------- Step 2: Coverage type ---------- */}
      {step === 1 && (
        <div className="istep-panel">
          <fieldset className="cov-radios">
            <legend>How do you want your collection covered?</legend>
            <label className={`cov-radio ${coverageType === "scheduled" ? "sel" : ""}`}>
              <input
                type="radio"
                name="coverageType"
                checked={coverageType === "scheduled"}
                onChange={() => setCoverageType("scheduled")}
              />
              <span>
                <b>Scheduled</b>
                <small>
                  Each item listed individually with agreed value — best for high-value
                  grails, slabs, and watches.
                </small>
              </span>
            </label>
            <label className={`cov-radio ${coverageType === "blanket" ? "sel" : ""}`}>
              <input
                type="radio"
                name="coverageType"
                checked={coverageType === "blanket"}
                onChange={() => setCoverageType("blanket")}
              />
              <span>
                <b>Blanket</b>
                <small>
                  One total limit across many items — best for large collections. Manual
                  underwriting; per-item limit {usd(BLANKET_PER_ITEM_LIMIT)}.
                </small>
              </span>
            </label>
          </fieldset>

          {coverageType === "blanket" && (
            <div className="blanket-fields">
              <div className="note note-info">
                Blanket coverage is manually underwritten. Tell us the totals below, then
                on the next step list your <b>10 most valuable items</b> and how they&apos;re
                stored so the carrier can review them.
              </div>
              <div className="note note-soft">
                <b>Note:</b> Jewelry &amp; watches blanket requires <b>$1M+ in scheduled
                items first</b>, then a {usd(BLANKET_PER_ITEM_LIMIT)} per-item blanket
                limit. Other collectibles (trading cards, wine, etc.) are available from
                the first dollar with the same {usd(BLANKET_PER_ITEM_LIMIT)} per-item
                limit.
              </div>
              <div className="f-row">
                <div className="field">
                  <label htmlFor="btItems">Total # of items</label>
                  <input
                    id="btItems"
                    type="number"
                    min={0}
                    value={blanketTotalItems}
                    onChange={(e) => setBlanketTotalItems(e.target.value)}
                    placeholder="e.g. 1200"
                  />
                </div>
                <div className="field">
                  <label htmlFor="btValue">Full blanket value (USD)</label>
                  <input
                    id="btValue"
                    type="number"
                    min={0}
                    value={blanketTotalValue}
                    onChange={(e) => setBlanketTotalValue(e.target.value)}
                    placeholder="e.g. 180000"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="note note-soft">
            <b>Newly acquired items</b> are covered at {NEWLY_ACQUIRED_PCT}% of your class
            limit for {NEWLY_ACQUIRED_DAYS} days — so a fresh pickup isn&apos;t left
            unprotected while you update your policy.
          </div>
        </div>
      )}

      {/* ---------- Step 3: Item schedule ---------- */}
      {step === 2 && (
        <div className="istep-panel">
          <p className="istep-help">
            {coverageType === "blanket"
              ? "List your most valuable items (up to your 10 highest) so underwriting can review them."
              : "Add each item you want scheduled. You can add as many as you like."}
          </p>

          {items.map((it, idx) => {
            const isCard = it.category.toLowerCase().includes("trading card");
            const spec = specForCategory(it.category);
            const v = parseFloat(it.value) || 0;
            const th = appraisalThresholdForCategory(it.category);
            const needsAppraisal = v > th;
            return (
              <div className="item-card" key={it.id}>
                <div className="item-card-head">
                  <span className="item-idx">Item {idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="item-remove"
                      onClick={() => removeItem(it.id)}
                      aria-label={`Remove item ${idx + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="field">
                  <label>Category</label>
                  <select
                    value={it.category}
                    onChange={(e) => updateItem(it.id, { category: e.target.value })}
                  >
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category-adaptive fields (from lib/intake CATEGORY_SPECS) */}
                {spec.fields.map((def) => {
                  // Trading Cards: pair the grading-company dropdown with grade.
                  if (isCard && def.key === "gradeAuth") {
                    return (
                      <div className="f-row" key={def.key}>
                        <div className="field">
                          <label>Grading Co.</label>
                          <select
                            value={it.gradingCo}
                            onChange={(e) =>
                              updateItem(it.id, { gradingCo: e.target.value })
                            }
                          >
                            {GRADING_COMPANIES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Grade</label>
                          <input
                            value={it.fields[def.key] || ""}
                            onChange={(e) =>
                              updateItemField(it.id, def.key, e.target.value)
                            }
                            placeholder="e.g. 10"
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="field" key={def.key}>
                      <label>{def.label}</label>
                      <input
                        value={it.fields[def.key] || ""}
                        onChange={(e) =>
                          updateItemField(it.id, def.key, e.target.value)
                        }
                        placeholder={def.placeholder}
                      />
                    </div>
                  );
                })}

                {/* Storage question — cards / memorabilia / collectibles */}
                {spec.requiresStorage && (
                  <div className="field">
                    <label>When &amp; how are they stored?</label>
                    <input
                      value={it.storage}
                      onChange={(e) => updateItem(it.id, { storage: e.target.value })}
                      placeholder="e.g. graded slabs in a home safe; sealed in a climate-controlled closet"
                    />
                  </div>
                )}

                {/* Optional free-text note for any category */}
                <div className="field">
                  <label>Notes (optional)</label>
                  <input
                    value={it.description}
                    onChange={(e) => updateItem(it.id, { description: e.target.value })}
                    placeholder="Anything else underwriting should know"
                  />
                </div>

                <div className="field">
                  <label>Current value (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={it.value}
                    onChange={(e) => updateItem(it.id, { value: e.target.value })}
                    placeholder="e.g. 12000"
                  />
                </div>

                {/* Cameras / instruments: required Yes/No income-from-use */}
                {spec.incomeConfirmation && (
                  <fieldset className="income-yesno">
                    <legend>
                      Do you earn more than $15,000/yr from the use of this item?{" "}
                      <small>(Required for cameras &amp; instruments.)</small>
                    </legend>
                    <label>
                      <input
                        type="radio"
                        name={`earn-${it.id}`}
                        checked={it.earnsOver15k === "no"}
                        onChange={() => updateItem(it.id, { earnsOver15k: "no" })}
                      />
                      No — personal use
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`earn-${it.id}`}
                        checked={it.earnsOver15k === "yes"}
                        onChange={() => updateItem(it.id, { earnsOver15k: "yes" })}
                      />
                      Yes
                    </label>
                    {it.earnsOver15k === "yes" && (
                      <div className="note note-decline">
                        Earning more than $15K/yr from use makes this a <b>commercial</b>{" "}
                        exposure, which the carrier declines. Contact us about a commercial option —
                        we can&apos;t quote it under a personal collectibles policy.
                      </div>
                    )}
                  </fieldset>
                )}

                {needsAppraisal && (
                  <div className="note note-warn item-note">
                    Items over {usd(th)} require an appraisal or bill of sale (within 3
                    years). You can note it below or provide it later.
                  </div>
                )}

                {/* Per-item eligibility notices (declines / not-accepted) */}
                {eligibilityIssues
                  .filter((e) => e.itemIndex === idx)
                  .map((e, k) => (
                    <div
                      key={k}
                      className={`note ${
                        e.severity === "decline" ? "note-decline" : "note-warn"
                      } item-note`}
                    >
                      {e.severity === "decline" ? "This may not be covered — " : ""}
                      {e.message}
                    </div>
                  ))}
              </div>
            );
          })}

          <button type="button" className="btn btn-ghost add-item" onClick={addItem}>
            + Add another item
          </button>

          {/* Documentation — no real upload storage; honest checkbox capture */}
          <div className="doc-block">
            <label className="doc-check">
              <input
                type="checkbox"
                checked={hasDocumentation}
                onChange={(e) => setHasDocumentation(e.target.checked)}
              />
              <span>I can provide an appraisal or receipt on request.</span>
            </label>
            {hasDocumentation && (
              <div className="field">
                <label htmlFor="docNote">What documentation do you have? (optional)</label>
                <input
                  id="docNote"
                  value={documentationNote}
                  onChange={(e) => setDocumentationNote(e.target.value)}
                  placeholder="e.g. 2024 written appraisal for the Charizard; receipts for the rest"
                />
              </div>
            )}
          </div>

          {/* Live reassurance banners */}
          {appraisalItems.length > 0 && (
            <div className="note note-warn">
              {appraisalItems.length} item{appraisalItems.length > 1 ? "s" : ""} over the
              appraisal threshold — an appraisal or recent bill of sale will be requested.
            </div>
          )}
          {underwritingHit.length > 0 && (
            <div className="note note-info">
              Heads up: {underwritingHit.join("; ")}. This may require an underwriting
              review (up to 48h). We&apos;ll still prepare your quote.
            </div>
          )}
          {blanketExceeded && (
            <div className="note note-warn">
              One or more items exceed the {usd(BLANKET_PER_ITEM_LIMIT)} blanket per-item
              limit — those may need to be scheduled individually.
            </div>
          )}
          {eligibilityIssues.some((e) => e.severity === "decline") && (
            <div className="note note-decline">
              <b>Some items may not be eligible for coverage.</b> You can still submit —
              we&apos;ll review and contact you about options (including commercial or
              specialty markets where applicable).
            </div>
          )}
        </div>
      )}

      {/* ---------- Step 4: Review ---------- */}
      {step === 3 && (
        <div className="istep-panel review">
          <h4 className="rev-h">Client</h4>
          <div className="rev-grid">
            <span>Name</span>
            <b>
              {client.firstName} {client.lastName}
            </b>
            <span>Email</span>
            <b>{client.email || "—"}</b>
            <span>Phone</span>
            <b>{client.phone || "—"}</b>
            <span>DOB</span>
            <b>{client.dob || "—"}</b>
            <span>Address</span>
            <b>
              {[client.street, [client.city, client.state].filter(Boolean).join(", "), client.zip]
                .filter(Boolean)
                .join(" · ") || "—"}
            </b>
            <span>Occupation</span>
            <b>{client.occupation || "—"}</b>
            <span>Social</span>
            <b>{client.social || "—"}</b>
          </div>

          <h4 className="rev-h">
            Coverage — {coverageType === "blanket" ? "Blanket" : "Scheduled"}
          </h4>
          {coverageType === "blanket" && (
            <div className="rev-grid">
              <span>Total items</span>
              <b>{blanketTotalItems || "—"}</b>
              <span>Blanket value</span>
              <b>{blanketTotalValue ? usd(parseFloat(blanketTotalValue)) : "—"}</b>
            </div>
          )}

          <h4 className="rev-h">
            Items ({items.length}) — {usd(totalValue)} total
          </h4>
          <div className="rev-items">
            {items.map((it, i) => {
              const isCard = it.category.toLowerCase().includes("trading card");
              const spec = specForCategory(it.category);
              // Build a readable summary from the spec fields (folding grading co).
              const parts = spec.fields
                .map((def) => {
                  if (isCard && def.key === "gradeAuth") {
                    return [it.gradingCo, it.fields[def.key] || ""]
                      .filter(Boolean)
                      .join(" ");
                  }
                  return (it.fields[def.key] || "").trim();
                })
                .filter(Boolean);
              if (it.description.trim()) parts.push(it.description.trim());
              return (
                <div className="rev-item" key={it.id}>
                  <div className="rev-item-top">
                    <b>
                      {i + 1}. {it.category}
                    </b>
                    <span className="rev-val">{usd(parseFloat(it.value) || 0)}</span>
                  </div>
                  <div className="rev-item-sub">{parts.join(" · ") || "—"}</div>
                </div>
              );
            })}
          </div>

          {hasDocumentation && (
            <p className="fine">
              ✓ You indicated you can provide appraisal/receipt
              {documentationNote ? `: ${documentationNote}` : "."}
            </p>
          )}

          <p className="fine">
            By submitting, you agree to be contacted about coverage for your collection.
            This is a quote request — not a bound policy. Coverage is subject to
            eligibility, underwriting, and carrier approval. No premium is quoted here.
          </p>
        </div>
      )}

      {error && <p className="err">{error}</p>}

      {/* ---------- Nav buttons ---------- */}
      <div className="intake-nav">
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={back}>
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-holo btn-lg" onClick={next}>
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-holo btn-lg"
            onClick={submit}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending…" : "Request my quote"}
          </button>
        )}
      </div>
    </div>
  );
}
