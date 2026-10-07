# Trade-show intake app (`/show`)

An installable, offline-capable lead form for iPads at conventions. Static files live in `public/show/`; the page is `https://tcg-insurance.com/show`.

## How leads flow

1. A lead is saved on the iPad (IndexedDB + a localStorage mirror) the moment it is submitted. No signal needed.
2. When the iPad has signal, each unsent lead is POSTed to `/api/quote` as `{ kind: "show", lead }` with an `x-show-key` header.
3. `handleShow` in `app/api/quote/route.ts` forwards it to the same Broker IQ inbound endpoint, tenant and `source` as the website quote forms, and sends the usual notification email.
4. The iPad marks a lead as sent only after Broker IQ accepts it. Network/5xx failures are retried every minute; a 4xx is shown as "rejected" and stays in the CSV export.

`raw.show_lead_id` carries the iPad's unique id for each lead. State is derived from the ZIP code.

## Configuration

- `SHOW_INTAKE_KEY` (Vercel env var): shared key the iPads send. Without it the show path returns 503. Rotate it by changing the env var, redeploying, and re-entering the key on each iPad.
- One-time iPad setup link: `https://tcg-insurance.com/show/index.html?k=<SHOW_INTAKE_KEY>` stores the key on the device and removes it from the address bar.

## Before each show (on good wifi)

1. Open the setup link in Safari, then Share → Add to Home Screen. Launch from that icon from then on.
2. Fill in event name, booth/staff name, a staff PIN and an iPad label.
3. Tap the shield logo five times, enter the PIN, and confirm "Offline ready: Yes".
4. Optional: lock the iPad to the app with Guided Access.

## At the show

- Staff panel: tap the shield logo five times, then the PIN. It shows counts, recent leads, Sync now and Export CSV.
- Export CSV at the end of each day as a backup. Deleting leads requires every lead to be sent or exported, plus typing DELETE.
- Do not clear Safari website data before leads are sent or exported.

## Changing the app

Bump `VERSION` in `public/show/sw.js` whenever anything in `public/show/` changes, so iPads pick up the new copy next time they are online.
