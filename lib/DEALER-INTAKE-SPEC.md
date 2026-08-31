# Dealer / Shop Quote Intake — Field Spec

Source: **WAX Insurance – Trading Card Dealer Application** (6 pages).
Purpose: capture a complete, Consilium-ready dealer/shop intake so MG/Maria key it
in with zero re-typing. Mirrors the existing collector flow (`lib/intake.ts`).

## Flow

Step 0 (new): **"Who are you insuring?"**
- **Collector (personal collection)** → existing scheduled/blanket flow (UNCHANGED)
- **Dealer / Shop (business)** → this new flow

Dealer flow steps:
1. **Business** — company + principal + trading profile
2. **Stock** — split %, values, storage split
3. **Location(s)** — repeatable; each has a **"Physical retail location?"** toggle
   that reveals the full security block
4. **Coverage limits** — static / shipping / events / personal carryings / deductibles
5. **History & extras** — insurance history, loss history, authenticators, loss payees, ancillary
6. **Review + Declaration**

Legend: `req` = required, `opt` = optional, `cond` = conditional.
Types: text, tel, email, number($), pct(%), select, radio(Y/N), multiselect, checkbox, textarea, date.

---

## 1 · Business  (WAX p.1 top)

| Field | Type | Req | Notes |
|---|---|---|---|
| Insured name (business) | text | req | |
| Main risk address (street) | text | req | |
| Main risk city / state / zip | text/select/text | req | |
| Mailing address (if different) | text | opt | single line, optional |
| Owner / Principal name | text | req | |
| Phone — main | tel | req | |
| Phone — cell | tel | opt | |
| Email | email | req | |
| FEIN number | text | req | business tax id |
| State registered | select | req | |
| Main contact name | text | req | |
| Business type | radio | req | Wholesale · Retail · Wholesale & Retail |
| Years trading | number | req | |
| Total revenue last year | number($) | req | |
| Number of employees | number | req | |

## 2 · Stock  (WAX p.1 mid)

Stock split — must sensibly total ~100% (soft-validate, warn if not):
| Field | Type | Req |
|---|---|---|
| Sports cards % | pct | opt |
| Pokémon % | pct | opt |
| Marvel % | pct | opt |
| Disney % | pct | opt |
| DC Comics % | pct | opt |
| Other % | pct | opt |
| Other interest — detail | text | cond | required if Other % > 0 |

Stock values:
| Field | Type | Req |
|---|---|---|
| Avg individual value per item of stock | number($) | req |
| Avg total replacement value (last 12 mo) | number($) | req |
| MAX total replacement value (last 12 mo) | number($) | req |
| Amount usually held in BANK VAULTS | number($) | req |
| Amount NOT in safe(s) at main location | number($) | req |
| How out-of-safe items are housed/secured | textarea | cond | required if out-of-safe > 0 |

## 3 · Location(s)  (WAX p.1 bottom — repeatable)

Repeatable block. "Add another location" button. Each location:

| Field | Type | Req | Notes |
|---|---|---|---|
| Location type | radio | req | Residence · Store · Office |
| Exclusively under your control | radio | req | Y/N + comment |
| Control comment | text | opt | |
| Floor(s) — this unit # | number | opt | |
| Floors — building total # | number | opt | |
| Building construction | text | req | "Brick, concrete etc" |

**Physical retail location? toggle (Y/N).**
- The WAX form's security block applies to Store/Office locations.
- If **Location type = Store/Office**, OR the "physical retail location?" toggle = Yes,
  reveal the **Security block** below. (Residence with no retail = hide by default,
  but allow toggle-on if they keep stock there.)

**Security block (revealed by toggle):**
| Field | Type | Req(when shown) | Notes |
|---|---|---|---|
| Burglar alarm (central station) | radio | req | Y/N + make/model |
| Burglar alarm make/model | text | cond | if Y |
| Fire alarm (central station) | radio | req | Y/N + make/model |
| Fire alarm make/model | text | cond | if Y |
| Other fire protection | text | opt | |
| Hold-up buttons | radio | req | Y/N |
| CCTV / cameras | radio | req | Y/N |
| Security guard | radio | req | Y/N |
| Safe(s) | radio | req | Y/N + make/model |
| Safe make/model | text | cond | if Y |
| Safe(s) complete (alarmed) | radio | cond | if Safe = Y |
| Vault | radio | req | Y/N + make/model |
| Vault make/model | text | cond | if Y |

## 4 · Coverage Limits  (WAX p.2–3)

### A — Static cover
| Field | Type | Req |
|---|---|---|
| Main location limit(s) | number($) per location | req |
| Bank vaults limit | number($) | opt |
| BV limit — part of / in addition to main | radio | cond | if BV limit > 0 |
| Unnamed locations limit | number($) | opt |
| Authenticators limit | number($) | opt |

### B — Shipping (any one package)
| Field | Type | Req |
|---|---|---|
| Total packages shipped (last 12 mo) | number | req |
| Avg value per package (last 12 mo) | number($) | req |
| Total value shipped (last 12 mo, all services) | number($) | req |

Per-service limits + % of annual volume (all opt; show as a compact table.
Each row: limit $ + % of volume). WAX service list:
1. USPS Regular Mail
2. USPS Certified Mail
2ii. USPS Certified Mail Restricted Service
3. USPS Priority Mail Flat Rate w/ Signature Confirmation
3ii. USPS Priority Mail Flat Rate w/ Adult Signature
4. UPS
4ii. UPS w/ Adult Signature
4iii. UPS Parcel Pro
5. FedEx
5ii. FedEx w/ Adult Signature
6. USPS Priority Express
6ii. USPS Priority Express w/ Adult Signature
7. USPS Registered Mail
7ii. USPS Registered Mail Restricted Service
8. Approved Security Carrier (Brinks, Malca Amit, Dunbar, Loomis Fargo, Ferrari Express, Via Mat, Positive Protection)
Other services (list) — text + $ + %

> Note surfaced to user: "All services must be signed for upon delivery."

### C1 — Outside cover: Events / trade shows / exhibitions / auctions
| Field | Type | Req |
|---|---|---|
| Total events forecast (next 12 mo) | number | req |
| Avg value taken per event | number($) | req |
| # events using a SECURE carrier for transit | number | opt |
| Limit — personally conveyed to/from events | number($) | opt |
| Limit — whilst at events | number($) | opt |
| MAX value carried by a single person | number($) | opt |

### C2 — Outside cover: Personal carryings (bank vaults, PO boxes, third parties)
| Field | Type | Req |
|---|---|---|
| Avg value per personal carrying | number($) | opt |
| Total personal carryings forecast (12 mo) | number | opt |
| Limit required per personal carrying | number($) | opt |

### Deductibles (any one loss / series from same event)
| Field | Type | Req |
|---|---|---|
| Static cover deductible | number($) | req |
| Shipping cover deductible | number($) | req |
| Outside cover deductible | number($) | req |

## 5 · History & Extras  (WAX p.3–4)

### Insurance history
| Field | Type | Req |
|---|---|---|
| Desired coverage start date | date | req |
| Current broker & insurer | text | opt |

### Loss history
| Field | Type | Req |
|---|---|---|
| Any losses in last 5 years? | radio | req | Y/N |
| Loss details (type + date) | textarea | cond | if Y |

### Authenticators (multiselect)
PSA · Beckett · SGC · CGC · Other (specify)

### Loss payees
| Field | Type | Req |
|---|---|---|
| Required loss payees | textarea | opt |

### Ancillary specialist insurance (multiselect / checkboxes)
- Terrorism (US TRIPRA Act)
- Cyber

## 6 · Review + Declaration  (WAX p.4)

- Full read-back of everything (like collector Review step).
- **Declaration checkbox** (required to submit):
  > "To the best of my knowledge the information provided is true; I have not
  > withheld any material facts. I understand non-disclosure/misrepresentation may
  > void the insurance. Signing this application does not bind me to complete the
  > insurance. I confirm I have read the FRAUD NOTICES."
- Name of signatory (text, req) + Date (auto today, req).
- Link to the state fraud notices (WAX p.5–6) — render as a collapsible / linked page.

---

## Output (email + BrokerIQ)

- New `DealerIntake` TS type in `lib/intake.ts`.
- New `formatDealerEmailHTML` / `formatDealerText` laying fields in **WAX application
  page order** (Business → Stock → Locations → Limits → History → Declaration) so it's
  copy-paste ready.
- Reuse existing `sendEmail` (Resend) → MG, and BrokerIQ POST (lead_type "new",
  source "tcg-insurance.com", `raw.version: 3`, `raw.dealer: {...}`).
- Subject: `New WAX DEALER intake — {business} · {maxReplacementValue}`.
- Light derived flags (optional v1): warn if stock split ≠ ~100%; note if any
  out-of-safe stock has no security; note high MAX replacement value.

## Non-goals (v1)
- No file uploads (consistent with collector flow).
- No WAX API calls (Consilium is broker-only).
- No e-signature — declaration is a checkbox + typed name; actual binding happens in Consilium.
