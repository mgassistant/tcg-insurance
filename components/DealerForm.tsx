"use client";

import { useMemo, useState } from "react";
import {
  BUSINESS_TYPES,
  LOCATION_TYPES,
  DEALER_AUTHENTICATORS,
  ANCILLARY_COVERAGES,
  SHIPPING_SERVICES,
  deriveDealerFlags,
  type DealerIntake,
  type DealerLocation,
  type DealerSecurity,
} from "@/lib/dealer";

const STEPS = [
  "Business",
  "Stock",
  "Locations",
  "Limits",
  "History",
  "Review",
] as const;

function emptySecurity(): DealerSecurity {
  return {
    burglarAlarm: null,
    burglarAlarmMakeModel: "",
    fireAlarm: null,
    fireAlarmMakeModel: "",
    otherFireProtection: "",
    holdUpButtons: null,
    cctv: null,
    securityGuard: null,
    safe: null,
    safeMakeModel: "",
    safeComplete: null,
    vault: null,
    vaultMakeModel: "",
  };
}

let LOC_SEQ = 1;
function emptyLocation(): DealerLocation & { _id: number } {
  return {
    _id: LOC_SEQ++,
    locationType: "Store",
    exclusiveControl: null,
    controlComment: "",
    floorsUnit: "",
    floorsBuilding: "",
    construction: "",
    hasRetail: true,
    security: emptySecurity(),
    staticLimit: 0,
  } as DealerLocation & { _id: number };
}

type LocRow = DealerLocation & { _id: number };

// Tri-state Y/N control
function YN({
  value,
  onChange,
  label,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="dealer-yn">
      <span className="dealer-yn-label">{label}</span>
      <div className="dealer-yn-btns">
        <button
          type="button"
          className={`yn-btn ${value === true ? "on" : ""}`}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={`yn-btn ${value === false ? "on" : ""}`}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}

export default function DealerForm({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [hp, setHp] = useState("");
  const [ts] = useState(() => Date.now());

  const [business, setBusiness] = useState({
    insuredName: "",
    riskStreet: "",
    riskCity: "",
    riskState: "",
    riskZip: "",
    mailingAddress: "",
    principalName: "",
    phoneMain: "",
    phoneCell: "",
    email: "",
    fein: "",
    stateRegistered: "",
    mainContact: "",
    businessType: "",
    yearsTrading: "",
    totalRevenueLastYear: "",
    employees: "",
  });

  const [stock, setStock] = useState({
    splitSports: "",
    splitPokemon: "",
    splitMarvel: "",
    splitDisney: "",
    splitDC: "",
    splitOther: "",
    otherDetail: "",
    avgItemValue: "",
    avgReplacementValue: "",
    maxReplacementValue: "",
    amountInBankVaults: "",
    amountNotInSafe: "",
    outOfSafeHousing: "",
  });

  const [locations, setLocations] = useState<LocRow[]>([emptyLocation()]);

  const [limits, setLimits] = useState({
    bankVaultsLimit: "",
    bvPartOfOrAdditional: "" as "" | "part_of" | "in_addition",
    unnamedLocationsLimit: "",
    authenticatorsLimit: "",
    totalPackages: "",
    avgValuePerPackage: "",
    totalValueShipped: "",
    otherShippingLabel: "",
    otherShippingLimit: "",
    otherShippingPct: "",
    totalEvents: "",
    avgValuePerEvent: "",
    eventsSecureCarrier: "",
    limitConveyedToEvents: "",
    limitAtEvents: "",
    maxSinglePersonEvent: "",
    avgValuePersonalCarrying: "",
    totalPersonalCarryings: "",
    limitPerPersonalCarrying: "",
    deductibleStatic: "",
    deductibleShipping: "",
    deductibleOutside: "",
  });
  const [shipLimits, setShipLimits] = useState<
    Record<string, { limit: string; pctVolume: string }>
  >({});

  const [history, setHistory] = useState({
    coverageStartDate: "",
    currentBrokerInsurer: "",
    hadLosses: null as boolean | null,
    lossDetails: "",
    authenticators: [] as string[],
    authenticatorsOther: "",
    lossPayees: "",
    ancillary: [] as string[],
  });

  const [declaration, setDeclaration] = useState({
    agreed: false,
    signatoryName: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const splitTotal = useMemo(
    () =>
      [
        stock.splitSports,
        stock.splitPokemon,
        stock.splitMarvel,
        stock.splitDisney,
        stock.splitDC,
        stock.splitOther,
      ].reduce((s, v) => s + (parseFloat(v) || 0), 0),
    [stock]
  );
  const splitOff = splitTotal > 0 && Math.abs(splitTotal - 100) > 2;

  // ---- helpers ----
  const setB = (patch: Partial<typeof business>) =>
    setBusiness((b) => ({ ...b, ...patch }));
  const setS = (patch: Partial<typeof stock>) => setStock((s) => ({ ...s, ...patch }));
  const setL = (patch: Partial<typeof limits>) => setLimits((l) => ({ ...l, ...patch }));
  const setH = (patch: Partial<typeof history>) => setHistory((h) => ({ ...h, ...patch }));

  function updateLocation(id: number, patch: Partial<LocRow>) {
    setLocations((arr) => arr.map((l) => (l._id === id ? { ...l, ...patch } : l)));
  }
  function updateSecurity(id: number, patch: Partial<DealerSecurity>) {
    setLocations((arr) =>
      arr.map((l) =>
        l._id === id ? { ...l, security: { ...l.security, ...patch } } : l
      )
    );
  }
  function addLocation() {
    setLocations((arr) => [...arr, emptyLocation()]);
  }
  function removeLocation(id: number) {
    setLocations((arr) => (arr.length > 1 ? arr.filter((l) => l._id !== id) : arr));
  }

  function toggleArr(arr: string[], v: string): string[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!business.insuredName.trim()) return "Please enter the business name.";
      if (!business.principalName.trim()) return "Please enter the owner/principal name.";
      if (business.phoneMain.replace(/\D/g, "").length < 10)
        return "Please enter a valid main phone.";
      const email = business.email.trim().toLowerCase();
      if (!email.includes("@") || !email.includes(".")) return "Please enter a valid email.";
      if (!business.fein.trim()) return "Please enter your FEIN number.";
      if (!business.businessType) return "Please choose a business type.";
    }
    if (s === 2) {
      if (locations.length === 0) return "Add at least one location.";
      for (const l of locations) {
        if (!l.construction.trim())
          return "Please enter building construction for each location.";
      }
    }
    if (s === 5) {
      if (!declaration.agreed) return "Please agree to the declaration to submit.";
      if (!declaration.signatoryName.trim()) return "Please enter the signatory name.";
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
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setError(null);
    if (step === 0 && onBack) return onBack();
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    for (let s = 0; s <= 5; s++) {
      const err = validateStep(s);
      if (err) {
        setError(err);
        setStep(s);
        return;
      }
    }
    setError(null);
    setStatus("loading");

    const shippingLimits: Record<string, { limit: number; pctVolume: number }> = {};
    for (const [k, v] of Object.entries(shipLimits)) {
      const limit = parseFloat(v.limit) || 0;
      const pctVolume = parseFloat(v.pctVolume) || 0;
      if (limit > 0 || pctVolume > 0) shippingLimits[k] = { limit, pctVolume };
    }

    const payload = {
      version: 3,
      kind: "dealer",
      business: {
        ...business,
        totalRevenueLastYear: parseFloat(business.totalRevenueLastYear) || 0,
      },
      stock: {
        splitSports: parseFloat(stock.splitSports) || 0,
        splitPokemon: parseFloat(stock.splitPokemon) || 0,
        splitMarvel: parseFloat(stock.splitMarvel) || 0,
        splitDisney: parseFloat(stock.splitDisney) || 0,
        splitDC: parseFloat(stock.splitDC) || 0,
        splitOther: parseFloat(stock.splitOther) || 0,
        otherDetail: stock.otherDetail,
        avgItemValue: parseFloat(stock.avgItemValue) || 0,
        avgReplacementValue: parseFloat(stock.avgReplacementValue) || 0,
        maxReplacementValue: parseFloat(stock.maxReplacementValue) || 0,
        amountInBankVaults: parseFloat(stock.amountInBankVaults) || 0,
        amountNotInSafe: parseFloat(stock.amountNotInSafe) || 0,
        outOfSafeHousing: stock.outOfSafeHousing,
      },
      locations: locations.map((l) => ({
        locationType: l.locationType,
        exclusiveControl: l.exclusiveControl,
        controlComment: l.controlComment,
        floorsUnit: l.floorsUnit,
        floorsBuilding: l.floorsBuilding,
        construction: l.construction,
        hasRetail: l.hasRetail,
        security: l.security,
        staticLimit: Number(l.staticLimit) || 0,
      })),
      limits: {
        bankVaultsLimit: parseFloat(limits.bankVaultsLimit) || 0,
        bvPartOfOrAdditional: limits.bvPartOfOrAdditional,
        unnamedLocationsLimit: parseFloat(limits.unnamedLocationsLimit) || 0,
        authenticatorsLimit: parseFloat(limits.authenticatorsLimit) || 0,
        totalPackages: parseFloat(limits.totalPackages) || 0,
        avgValuePerPackage: parseFloat(limits.avgValuePerPackage) || 0,
        totalValueShipped: parseFloat(limits.totalValueShipped) || 0,
        shippingLimits,
        otherShippingLabel: limits.otherShippingLabel,
        otherShippingLimit: parseFloat(limits.otherShippingLimit) || 0,
        otherShippingPct: parseFloat(limits.otherShippingPct) || 0,
        totalEvents: parseFloat(limits.totalEvents) || 0,
        avgValuePerEvent: parseFloat(limits.avgValuePerEvent) || 0,
        eventsSecureCarrier: parseFloat(limits.eventsSecureCarrier) || 0,
        limitConveyedToEvents: parseFloat(limits.limitConveyedToEvents) || 0,
        limitAtEvents: parseFloat(limits.limitAtEvents) || 0,
        maxSinglePersonEvent: parseFloat(limits.maxSinglePersonEvent) || 0,
        avgValuePersonalCarrying: parseFloat(limits.avgValuePersonalCarrying) || 0,
        totalPersonalCarryings: parseFloat(limits.totalPersonalCarryings) || 0,
        limitPerPersonalCarrying: parseFloat(limits.limitPerPersonalCarrying) || 0,
        deductibleStatic: parseFloat(limits.deductibleStatic) || 0,
        deductibleShipping: parseFloat(limits.deductibleShipping) || 0,
        deductibleOutside: parseFloat(limits.deductibleOutside) || 0,
      },
      history,
      declaration,
      // spam-guard top-level fields
      name: business.insuredName.trim(),
      email: business.email.trim().toLowerCase(),
      phone: business.phoneMain.trim(),
      _hp: hp,
      _ts: ts,
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
        <h3>Dealer application received.</h3>
        <p>
          Thanks — a licensed agent will prepare your WAX dealer quote and reach out
          shortly. This is a request, not a bound policy; coverage is subject to
          underwriting and WAX approval.
        </p>
      </div>
    );
  }

  const money = (v: string, on: (s: string) => void, ph = "$") => (
    <input
      type="number"
      inputMode="decimal"
      min="0"
      placeholder={ph}
      value={v}
      onChange={(e) => on(e.target.value)}
    />
  );

  return (
    <div className="quote-form intake dealer-form">
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="d_company">Company</label>
        <input
          id="d_company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>

      <ol className="intake-steps" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`istep ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
          >
            <span className="istep-n">{i < step ? "✓" : i + 1}</span>
            <span className="istep-label">{label}</span>
          </li>
        ))}
      </ol>

      {/* STEP 0 — Business */}
      {step === 0 && (
        <div className="istep-panel">
          <h3>Business details</h3>
          <label>Insured (business) name*
            <input value={business.insuredName} onChange={(e) => setB({ insuredName: e.target.value })} />
          </label>
          <label>Main risk address*
            <input value={business.riskStreet} onChange={(e) => setB({ riskStreet: e.target.value })} placeholder="Street" />
          </label>
          <div className="grid-3">
            <label>City<input value={business.riskCity} onChange={(e) => setB({ riskCity: e.target.value })} /></label>
            <label>State<input value={business.riskState} onChange={(e) => setB({ riskState: e.target.value.toUpperCase() })} maxLength={2} placeholder="CA" /></label>
            <label>ZIP<input value={business.riskZip} onChange={(e) => setB({ riskZip: e.target.value })} /></label>
          </div>
          <label>Mailing address (if different)
            <input value={business.mailingAddress} onChange={(e) => setB({ mailingAddress: e.target.value })} />
          </label>
          <label>Owner / Principal name*
            <input value={business.principalName} onChange={(e) => setB({ principalName: e.target.value })} />
          </label>
          <div className="grid-2">
            <label>Phone (main)*<input value={business.phoneMain} onChange={(e) => setB({ phoneMain: e.target.value })} /></label>
            <label>Phone (cell)<input value={business.phoneCell} onChange={(e) => setB({ phoneCell: e.target.value })} /></label>
          </div>
          <label>Email*
            <input type="email" value={business.email} onChange={(e) => setB({ email: e.target.value })} />
          </label>
          <div className="grid-2">
            <label>FEIN number*<input value={business.fein} onChange={(e) => setB({ fein: e.target.value })} /></label>
            <label>State registered<input value={business.stateRegistered} onChange={(e) => setB({ stateRegistered: e.target.value.toUpperCase() })} maxLength={2} /></label>
          </div>
          <label>Name of main contact
            <input value={business.mainContact} onChange={(e) => setB({ mainContact: e.target.value })} />
          </label>
          <label>Business type*
            <select value={business.businessType} onChange={(e) => setB({ businessType: e.target.value })}>
              <option value="">Select…</option>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <div className="grid-3">
            <label>Years trading<input type="number" min="0" value={business.yearsTrading} onChange={(e) => setB({ yearsTrading: e.target.value })} /></label>
            <label>Total revenue (last yr){money(business.totalRevenueLastYear, (v) => setB({ totalRevenueLastYear: v }))}</label>
            <label># Employees<input type="number" min="0" value={business.employees} onChange={(e) => setB({ employees: e.target.value })} /></label>
          </div>
        </div>
      )}

      {/* STEP 1 — Stock */}
      {step === 1 && (
        <div className="istep-panel">
          <h3>Stock profile</h3>
          <p className="istep-hint">Usual split of stock (should total ~100%).</p>
          <div className="grid-3">
            <label>Sports cards %<input type="number" value={stock.splitSports} onChange={(e) => setS({ splitSports: e.target.value })} /></label>
            <label>Pokémon %<input type="number" value={stock.splitPokemon} onChange={(e) => setS({ splitPokemon: e.target.value })} /></label>
            <label>Marvel %<input type="number" value={stock.splitMarvel} onChange={(e) => setS({ splitMarvel: e.target.value })} /></label>
            <label>Disney %<input type="number" value={stock.splitDisney} onChange={(e) => setS({ splitDisney: e.target.value })} /></label>
            <label>DC Comics %<input type="number" value={stock.splitDC} onChange={(e) => setS({ splitDC: e.target.value })} /></label>
            <label>Other %<input type="number" value={stock.splitOther} onChange={(e) => setS({ splitOther: e.target.value })} /></label>
          </div>
          {(parseFloat(stock.splitOther) || 0) > 0 && (
            <label>Other interest — detail
              <input value={stock.otherDetail} onChange={(e) => setS({ otherDetail: e.target.value })} />
            </label>
          )}
          {splitOff && (
            <div className="banner warn">Heads up: your split totals {splitTotal}% (not ~100%). You can still continue.</div>
          )}
          <div className="grid-2">
            <label>Avg individual value per item{money(stock.avgItemValue, (v) => setS({ avgItemValue: v }))}</label>
            <label>Avg total replacement value (12mo){money(stock.avgReplacementValue, (v) => setS({ avgReplacementValue: v }))}</label>
            <label>MAX total replacement value (12mo){money(stock.maxReplacementValue, (v) => setS({ maxReplacementValue: v }))}</label>
            <label>Amount usually in bank vaults{money(stock.amountInBankVaults, (v) => setS({ amountInBankVaults: v }))}</label>
          </div>
          <label>Amount of stock NOT in safe(s) at main location{money(stock.amountNotInSafe, (v) => setS({ amountNotInSafe: v }))}</label>
          {(parseFloat(stock.amountNotInSafe) || 0) > 0 && (
            <label>How are out-of-safe items housed & secured?
              <textarea value={stock.outOfSafeHousing} onChange={(e) => setS({ outOfSafeHousing: e.target.value })} rows={2} />
            </label>
          )}
        </div>
      )}

      {/* STEP 2 — Locations */}
      {step === 2 && (
        <div className="istep-panel">
          <h3>Location(s)</h3>
          {locations.map((l, i) => {
            const showSec = l.hasRetail || l.locationType === "Store" || l.locationType === "Office";
            return (
              <div className="dealer-loc" key={l._id}>
                <div className="dealer-loc-head">
                  <strong>Location {i + 1}</strong>
                  {locations.length > 1 && (
                    <button type="button" className="link-danger" onClick={() => removeLocation(l._id)}>Remove</button>
                  )}
                </div>
                <label>Type of location
                  <select value={l.locationType} onChange={(e) => updateLocation(l._id, { locationType: e.target.value })}>
                    {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <YN label="Exclusively under your control?" value={l.exclusiveControl} onChange={(v) => updateLocation(l._id, { exclusiveControl: v })} />
                {l.exclusiveControl === false && (
                  <label>Comment<input value={l.controlComment} onChange={(e) => updateLocation(l._id, { controlComment: e.target.value })} /></label>
                )}
                <div className="grid-3">
                  <label>Floor(s) — this unit<input value={l.floorsUnit} onChange={(e) => updateLocation(l._id, { floorsUnit: e.target.value })} /></label>
                  <label>Floors — building total<input value={l.floorsBuilding} onChange={(e) => updateLocation(l._id, { floorsBuilding: e.target.value })} /></label>
                  <label>Construction*<input value={l.construction} onChange={(e) => updateLocation(l._id, { construction: e.target.value })} placeholder="Brick, concrete…" /></label>
                </div>
                <label className="dealer-toggle">
                  <input type="checkbox" checked={l.hasRetail} onChange={(e) => updateLocation(l._id, { hasRetail: e.target.checked })} />
                  Physical retail location? (reveals security details)
                </label>

                {showSec && (
                  <div className="dealer-security">
                    <YN label="Burglar alarm (central station)?" value={l.security.burglarAlarm} onChange={(v) => updateSecurity(l._id, { burglarAlarm: v })} />
                    {l.security.burglarAlarm && (
                      <label>Burglar alarm make/model<input value={l.security.burglarAlarmMakeModel} onChange={(e) => updateSecurity(l._id, { burglarAlarmMakeModel: e.target.value })} /></label>
                    )}
                    <YN label="Fire alarm (central station)?" value={l.security.fireAlarm} onChange={(v) => updateSecurity(l._id, { fireAlarm: v })} />
                    {l.security.fireAlarm && (
                      <label>Fire alarm make/model<input value={l.security.fireAlarmMakeModel} onChange={(e) => updateSecurity(l._id, { fireAlarmMakeModel: e.target.value })} /></label>
                    )}
                    <label>Other fire protection<input value={l.security.otherFireProtection} onChange={(e) => updateSecurity(l._id, { otherFireProtection: e.target.value })} /></label>
                    <YN label="Hold-up buttons?" value={l.security.holdUpButtons} onChange={(v) => updateSecurity(l._id, { holdUpButtons: v })} />
                    <YN label="CCTV / cameras?" value={l.security.cctv} onChange={(v) => updateSecurity(l._id, { cctv: v })} />
                    <YN label="Security guard?" value={l.security.securityGuard} onChange={(v) => updateSecurity(l._id, { securityGuard: v })} />
                    <YN label="Safe(s)?" value={l.security.safe} onChange={(v) => updateSecurity(l._id, { safe: v })} />
                    {l.security.safe && (
                      <>
                        <label>Safe make/model<input value={l.security.safeMakeModel} onChange={(e) => updateSecurity(l._id, { safeMakeModel: e.target.value })} /></label>
                        <YN label="Safe complete (alarmed)?" value={l.security.safeComplete} onChange={(v) => updateSecurity(l._id, { safeComplete: v })} />
                      </>
                    )}
                    <YN label="Vault?" value={l.security.vault} onChange={(v) => updateSecurity(l._id, { vault: v })} />
                    {l.security.vault && (
                      <label>Vault make/model<input value={l.security.vaultMakeModel} onChange={(e) => updateSecurity(l._id, { vaultMakeModel: e.target.value })} /></label>
                    )}
                  </div>
                )}
                <label>Static cover limit for this location{money(String(l.staticLimit || ""), (v) => updateLocation(l._id, { staticLimit: (parseFloat(v) || 0) as unknown as number }))}</label>
              </div>
            );
          })}
          <button type="button" className="btn btn-ghost" onClick={addLocation}>+ Add another location</button>
        </div>
      )}

      {/* STEP 3 — Limits */}
      {step === 3 && (
        <div className="istep-panel">
          <h3>Coverage limits</h3>
          <h4>A · Static cover</h4>
          <div className="grid-2">
            <label>Bank vaults limit{money(limits.bankVaultsLimit, (v) => setL({ bankVaultsLimit: v }))}</label>
            <label>BV limit relation
              <select value={limits.bvPartOfOrAdditional} onChange={(e) => setL({ bvPartOfOrAdditional: e.target.value as "" | "part_of" | "in_addition" })}>
                <option value="">—</option>
                <option value="part_of">Part of main location</option>
                <option value="in_addition">In addition to main location</option>
              </select>
            </label>
            <label>Unnamed locations limit{money(limits.unnamedLocationsLimit, (v) => setL({ unnamedLocationsLimit: v }))}</label>
            <label>Authenticators limit{money(limits.authenticatorsLimit, (v) => setL({ authenticatorsLimit: v }))}</label>
          </div>

          <h4>B · Shipping</h4>
          <div className="grid-3">
            <label>Total packages (12mo)<input type="number" value={limits.totalPackages} onChange={(e) => setL({ totalPackages: e.target.value })} /></label>
            <label>Avg value/package{money(limits.avgValuePerPackage, (v) => setL({ avgValuePerPackage: v }))}</label>
            <label>Total value shipped (12mo){money(limits.totalValueShipped, (v) => setL({ totalValueShipped: v }))}</label>
          </div>
          <p className="istep-hint">Per-service limits (optional). All services must be signed for on delivery.</p>
          <div className="ship-table">
            {SHIPPING_SERVICES.map((svc) => (
              <div className="ship-row" key={svc.key}>
                <span className="ship-label">{svc.label}</span>
                <input type="number" placeholder="$ limit" value={shipLimits[svc.key]?.limit || ""} onChange={(e) => setShipLimits((m) => ({ ...m, [svc.key]: { ...m[svc.key], limit: e.target.value, pctVolume: m[svc.key]?.pctVolume || "" } }))} />
                <input type="number" placeholder="% vol" value={shipLimits[svc.key]?.pctVolume || ""} onChange={(e) => setShipLimits((m) => ({ ...m, [svc.key]: { ...m[svc.key], pctVolume: e.target.value, limit: m[svc.key]?.limit || "" } }))} />
              </div>
            ))}
            <div className="ship-row">
              <input className="ship-label" placeholder="Other service (list)" value={limits.otherShippingLabel} onChange={(e) => setL({ otherShippingLabel: e.target.value })} />
              <input type="number" placeholder="$ limit" value={limits.otherShippingLimit} onChange={(e) => setL({ otherShippingLimit: e.target.value })} />
              <input type="number" placeholder="% vol" value={limits.otherShippingPct} onChange={(e) => setL({ otherShippingPct: e.target.value })} />
            </div>
          </div>

          <h4>C1 · Events / trade shows</h4>
          <div className="grid-3">
            <label>Events forecast (12mo)<input type="number" value={limits.totalEvents} onChange={(e) => setL({ totalEvents: e.target.value })} /></label>
            <label>Avg value/event{money(limits.avgValuePerEvent, (v) => setL({ avgValuePerEvent: v }))}</label>
            <label># events w/ secure carrier<input type="number" value={limits.eventsSecureCarrier} onChange={(e) => setL({ eventsSecureCarrier: e.target.value })} /></label>
            <label>Limit conveyed to/from events{money(limits.limitConveyedToEvents, (v) => setL({ limitConveyedToEvents: v }))}</label>
            <label>Limit at events{money(limits.limitAtEvents, (v) => setL({ limitAtEvents: v }))}</label>
            <label>Max carried by single person{money(limits.maxSinglePersonEvent, (v) => setL({ maxSinglePersonEvent: v }))}</label>
          </div>

          <h4>C2 · Personal carryings</h4>
          <div className="grid-3">
            <label>Avg value/carrying{money(limits.avgValuePersonalCarrying, (v) => setL({ avgValuePersonalCarrying: v }))}</label>
            <label>Total carryings (12mo)<input type="number" value={limits.totalPersonalCarryings} onChange={(e) => setL({ totalPersonalCarryings: e.target.value })} /></label>
            <label>Limit per carrying{money(limits.limitPerPersonalCarrying, (v) => setL({ limitPerPersonalCarrying: v }))}</label>
          </div>

          <h4>Deductibles</h4>
          <div className="grid-3">
            <label>Static{money(limits.deductibleStatic, (v) => setL({ deductibleStatic: v }))}</label>
            <label>Shipping{money(limits.deductibleShipping, (v) => setL({ deductibleShipping: v }))}</label>
            <label>Outside{money(limits.deductibleOutside, (v) => setL({ deductibleOutside: v }))}</label>
          </div>
        </div>
      )}

      {/* STEP 4 — History & extras */}
      {step === 4 && (
        <div className="istep-panel">
          <h3>History & extras</h3>
          <div className="grid-2">
            <label>Desired coverage start date<input type="date" value={history.coverageStartDate} onChange={(e) => setH({ coverageStartDate: e.target.value })} /></label>
            <label>Current broker & insurer<input value={history.currentBrokerInsurer} onChange={(e) => setH({ currentBrokerInsurer: e.target.value })} /></label>
          </div>
          <YN label="Any losses in the last 5 years?" value={history.hadLosses} onChange={(v) => setH({ hadLosses: v })} />
          {history.hadLosses && (
            <label>Loss details (type + date)
              <textarea rows={2} value={history.lossDetails} onChange={(e) => setH({ lossDetails: e.target.value })} />
            </label>
          )}
          <fieldset className="dealer-checks">
            <legend>Authenticators typically used</legend>
            {DEALER_AUTHENTICATORS.map((a) => (
              <label key={a} className="check-inline">
                <input type="checkbox" checked={history.authenticators.includes(a)} onChange={() => setH({ authenticators: toggleArr(history.authenticators, a) })} />
                {a}
              </label>
            ))}
            {history.authenticators.includes("Other") && (
              <input placeholder="Other (specify)" value={history.authenticatorsOther} onChange={(e) => setH({ authenticatorsOther: e.target.value })} />
            )}
          </fieldset>
          <label>Required loss payees
            <textarea rows={2} value={history.lossPayees} onChange={(e) => setH({ lossPayees: e.target.value })} />
          </label>
          <fieldset className="dealer-checks">
            <legend>Additional coverage interest</legend>
            {ANCILLARY_COVERAGES.map((a) => (
              <label key={a} className="check-inline">
                <input type="checkbox" checked={history.ancillary.includes(a)} onChange={() => setH({ ancillary: toggleArr(history.ancillary, a) })} />
                {a}
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {/* STEP 5 — Review + Declaration */}
      {step === 5 && (
        <div className="istep-panel">
          <h3>Review & declaration</h3>
          <div className="review-block">
            <p><strong>{business.insuredName || "—"}</strong> · {business.businessType || "—"}</p>
            <p>{business.principalName} · {business.email} · {business.phoneMain}</p>
            <p>MAX replacement value: ${(parseFloat(stock.maxReplacementValue) || 0).toLocaleString()}</p>
            <p>{locations.length} location(s) · split total {splitTotal}%{splitOff ? " ⚠" : ""}</p>
          </div>
          <div className="declaration">
            <label className="dealer-toggle">
              <input type="checkbox" checked={declaration.agreed} onChange={(e) => setDeclaration((d) => ({ ...d, agreed: e.target.checked }))} />
              <span>
                To the best of my knowledge the information provided is true; I have not
                withheld any material facts. I understand non-disclosure or
                misrepresentation of a material fact may void the insurance. Signing this
                application does not bind me to complete the insurance. I confirm I have read the{" "}
                <a href="/fraud-notice" target="_blank" rel="noopener noreferrer">fraud notices</a>.
              </span>
            </label>
            <div className="grid-2">
              <label>Name of signatory*<input value={declaration.signatoryName} onChange={(e) => setDeclaration((d) => ({ ...d, signatoryName: e.target.value }))} /></label>
              <label>Date<input type="date" value={declaration.date} onChange={(e) => setDeclaration((d) => ({ ...d, date: e.target.value }))} /></label>
            </div>
          </div>
        </div>
      )}

      {error && <p className="err">{error}</p>}

      <div className="intake-nav">
        <button type="button" className="btn btn-ghost" onClick={back}>
          {step === 0 ? "← Change type" : "Back"}
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-holo btn-lg" onClick={next}>Continue</button>
        ) : (
          <button type="button" className="btn btn-holo btn-lg" onClick={submit} disabled={status === "loading"}>
            {status === "loading" ? "Submitting…" : "Submit application"}
          </button>
        )}
      </div>
    </div>
  );
}
