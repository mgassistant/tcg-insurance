# Automated Policy Activation — Spec v1

_Drafted 2026-08-31. Owner: MG. Status: DRAFT for review + WAX/Collectors Insurance sign-off before live._

---

## 1. Goal

Let a customer with a **sub-$25,000 collection** buy coverage on **tcg-insurance.com** in one automated session, then complete activation (evidence + coverage requests) in the **poke-trade.com Portfolio portal**. Policy is issued in **24–48 hours pending underwriting approval** by WAX / Collectors Insurance.

This is NOT auto-underwriting. WAX/Consilium quoting is broker-portal only (no public bind API). We productize a **flat price** for the low-value tier and automate **payment + application kickoff + evidence intake**, leaving the actual bind to the licensed broker path.

---

## 1b. SCOPE — WHO gets instant purchase (MG 8/31)
**Instant purchase applies ONLY to personal collector quotes** under the flat-SKU threshold. Everything else stays lead-intake as-is:
- ✅ **Personal collector, scheduled, under $25K, no decline flags** → instant purchase (automated flow below)
- ❌ **Personal collector over $25K / needs appraisal / underwriting flags** → lead intake (as-is)
- ❌ **Dealer / shop (v3 DealerForm)** → lead intake (as-is)
- ❌ **Blanket / high-value** → lead intake (as-is)
The intake engine already computes totalValue + flags; branch to instant-purchase only when personal + scheduled + <$25K + zero eligibility/decline issues.

## 1c. AUTO-CONTACT REQUIREMENT (MG 8/31)
All lead-intake forms must auto-generate auto-contact email + SMS to the client on submission. This is handled by broker-iq.com when the form posts to /api/leads/inbound with a valid tenant_id. Audit in progress to confirm EVERY form reaches broker-iq (see leadform audit). Instant-purchase flow must ALSO confirm the client (payment receipt + activation link) on top of any broker-iq auto-contact.

## 2. Pricing (fixed SKU — under $25K collections)

| Option | Structure | Customer pays | We net (gross) |
|---|---|---|---|
| Pay in full | one-time | **$199 / yr** | $199 |
| Financed | $100 down + $10/mo × 12 | **$220 / yr** | $220 |

- Underlying coverage cost ≈ $100/yr; broker fee = $100. Retail base = $199.
- Financed option adds $21 to cover processing + financing risk.
- Eligibility: total declared collection value **< $25,000**, single blanket collection (schedule specific items optional at activation).

---

## 3. End-to-end flow

```
tcg-insurance.com                         poke-trade.com portal              Broker / Carrier
─────────────────                         ─────────────────────              ────────────────
1. Fast-track quote (value <$25k)
2. Choose: Pay $199  |  $100+$10/mo
3. Stripe Checkout  ──────────────┐
                                  │ checkout.session.completed (webhook)
4. Policy row created:            │
   status=paid_pending_activation │
5. Confirmation + emailed         │
   activation link (token) ───────┼──► 6. "Complete your coverage" page
                                  │       - Upload evidence (photos/receipts)
                                  │         into Portfolio Vault
                                  │       - Coverage request: blanket
                                  │         (broad) OR schedule specific cards
                                  │       - Confirm address/DOB/storage
                                  │    7. from-vault.ts → Consilium-ready intake
                                  │       status=activation_complete
                                  └────────────────────────────────────────►
                                                                        8. Auto-send:
                                                                           - Broker fee forms
                                                                           - Carrier application
                                                                           - BrokerIQ push [PAID/BIND]
                                                                        9. WAX / Collectors
                                                                           underwrites (24–48h)
                                                                       10. Approved → status=active
                                                                           policy docs sent
                                                                           (or declined → refund path)
```

---

## 4. Reusable existing pieces (build = mostly bridges)

| Need | Already exists | Location |
|---|---|---|
| WAX intake engine | ✅ | `tcg-insurance/lib/intake.ts` (+ ported copy `poke-trade/src/lib/insurance/intake.ts`) |
| Vault → intake prefill | ✅ | `poke-trade/src/lib/insurance/from-vault.ts` |
| Portfolio Vault + photo upload | ✅ | `collection_items`, `PhotoUpload.tsx`, `/api/collection`, `vault-utils.ts` |
| Stripe (subscription pattern) | ✅ | `poke-trade/src/app/api/membership/checkout/route.ts` |
| Stripe webhooks | ✅ | `poke-trade/src/app/api/webhooks/stripe` |
| BrokerIQ + Consilium email push | ✅ | `tcg-insurance/app/api/quote/route.ts` |

**New to build:** the fast-track checkout branch, an `insurance_policies` table, the activation page, and the post-activation auto-send of broker-fee/application forms.

---

## 5. New components

### 5.1 Data — `insurance_policies` table
```
id                uuid pk
user_id           uuid null      (poke-trade profile, set at activation)
email             text
plan              text           'paid_full' | 'financed'
amount_cents      int            19900 | 22000
stripe_customer   text
stripe_session    text
stripe_sub_id     text null      (financed only)
status            text           see state machine §6
coverage_type     text null      'blanket' | 'scheduled'
declared_value    int null
activation_token  text unique
created_at        timestamptz
activated_at      timestamptz null
issued_at         timestamptz null
```

### 5.2 tcg-insurance.com — checkout
- `POST /api/activate/checkout` → creates Stripe Checkout session.
  - `paid_full`: `mode=payment`, one-time $199.
  - `financed`: `mode=subscription`, $10/mo price + **$100 setup fee** (via `subscription_data` add-invoice-item or a one-time line + recurring line).
- Metadata carries `plan`, `email`, `declared_value`.

### 5.3 Webhook → policy creation
- On `checkout.session.completed`: insert `insurance_policies` row `status=paid_pending_activation`, generate `activation_token`, email confirmation + activation link to poke-trade.

### 5.4 poke-trade.com — activation page `/insurance/activate/[token]`
- Validates token → binds to logged-in (or new) poke-trade account.
- Reuses Vault upload (`PhotoUpload.tsx`) for evidence (photos + receipts).
- Coverage request UI: **Broad (blanket)** vs **Schedule specific cards** (pick from Vault).
- Confirms address/DOB/storage (fields `from-vault.ts` leaves blank).
- On submit → `from-vault.ts` builds intake → `status=activation_complete`.

### 5.5 Post-activation auto-send
- Fires: broker-fee forms + carrier application (Resend templated) + BrokerIQ push flagged `PAID/BIND` + Consilium-ordered intake email (existing formatter).

---

## 6. Policy state machine
```
paid_pending_activation  → customer paid, hasn't uploaded evidence yet
activation_complete      → evidence + coverage request submitted, app sent
in_underwriting          → broker keyed into Consilium
active                   → WAX/Collectors approved, policy docs issued
declined                 → underwriting rejected → refund path
canceled                 → customer canceled / financed default
```

---

## 7. OPEN — compliance / business (WAX / Collectors Insurance must confirm)
1. **Can we collect premium + broker fee directly** and remit, or must the carrier collect?
2. **Is a flat $199 for any sub-$25K collection** how they'd actually bind, or is per-item review still required (affecting the "flat" promise)?
3. **Refund handling on decline** — full refund? broker fee retained? (Drives the `declined` path + Stripe refund logic.)
4. **Broker-fee form + application** — exact documents to auto-send; e-sign required?
5. **Financed default** (customer stops paying $10/mo) — does coverage lapse? cancellation/notice rules?
6. **Licensing/surplus-lines** — any state-specific disclosure required at point of sale (CA/FL noted in intake engine already).

---

## 8. Build phasing
- **Phase 0 (now):** this spec + test-mode scaffold behind flag `INSURANCE_ACTIVATION_ENABLED=false`. No real money.
- **Phase 1:** checkout + webhook + `insurance_policies` table (test Stripe keys).
- **Phase 2:** poke-trade activation page + Vault evidence bridge + coverage request.
- **Phase 3:** auto-send broker-fee/application + BrokerIQ PAID/BIND flag.
- **Phase 4:** admin view (policy statuses), decline/refund path.
- **Go-live:** only after §7 answered + live Stripe keys + WAX sign-off.

---

## 9. Notes / risks
- Keep `intake.ts` in sync between tcg-insurance and poke-trade (two copies today).
- Hard-decline screening already exists in intake flags — must run BEFORE or gate refund if a paid customer trips fraud/stolen-goods screening post-payment.
- poke-trade is the facilitator via the licensed WAX program, NOT the insurer — keep that disclosure on all pages.
