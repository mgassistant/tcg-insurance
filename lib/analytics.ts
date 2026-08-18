/**
 * Lightweight GA4 client analytics — no extra dependency.
 *
 * Fires only when NEXT_PUBLIC_GA_ID is set, so local/dev without the env var
 * is a silent no-op. The <GoogleAnalytics/> component in the root layout
 * injects gtag.js; this helper pushes events.
 *
 * TCG-Insurance uses its OWN GA4 property (separate from Poke-Trade) for clean
 * per-domain lead attribution.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

type GtagParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: GtagParams = {}): void {
  if (typeof window === "undefined" || !GA_ID) return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    // never let analytics throw into the app
  }
}

// Named helpers for the key insurance-funnel conversions.
export const track = {
  quoteStarted: () => trackEvent("quote_start"),
  quoteSubmitted: (value?: number | null) =>
    trackEvent("quote_complete", { value: value ?? undefined, currency: "USD" }),
};
