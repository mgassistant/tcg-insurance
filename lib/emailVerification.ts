/**
 * Server-side ZeroBounce email verification, shared by /api/verify-email (the
 * check the forms run before submit) and by the lead-receiving routes (so a
 * lead cannot skip the check by posting to the API directly).
 *
 * Server only: reads ZEROBOUNCE_API_KEY, which must never reach the browser.
 *
 * Fail-open: a missing key, a ZeroBounce outage, a timeout, or an error body
 * (bad key / out of credits) never blocks a lead. Those cases return
 * `checked: false` with a `reason`, and are logged, so a silent outage is
 * visible in the logs and on the lead record instead of passing unnoticed.
 */

export interface EmailVerdict {
  /** false only when ZeroBounce gave a definitive bad verdict. */
  ok: boolean;
  /** true when ZeroBounce actually returned a verdict for this address. */
  checked: boolean;
  status: string | null;
  sub_status: string | null;
  /** Why the address was not checked (only when checked is false). */
  reason?: string;
}

const BLOCK_STATUSES = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail']);
const TIMEOUT_MS = 6000;

// The forms verify in the browser and the lead route verifies again on submit.
// A short per-instance cache keeps that second check from spending a second
// ZeroBounce credit when both land on the same warm function instance.
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX = 500;
const cache = new Map<string, { at: number; verdict: EmailVerdict }>();

function unchecked(reason: string): EmailVerdict {
  return { ok: true, checked: false, status: null, sub_status: null, reason };
}

export function clientIP(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '';
}

export async function verifyEmail(rawEmail: unknown, ip = ''): Promise<EmailVerdict> {
  const email = (rawEmail == null ? '' : String(rawEmail)).trim().toLowerCase();
  if (!email) return unchecked('no_email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, checked: false, status: 'invalid', sub_status: 'invalid_format', reason: 'invalid_format' };
  }

  const hit = cache.get(email);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.verdict;

  const apiKey = process.env.ZEROBOUNCE_API_KEY;
  if (!apiKey) {
    console.warn('[EMAIL-VERIFY] ZEROBOUNCE_API_KEY is not set; email not verified');
    return unchecked('no_api_key');
  }

  const url =
    'https://api.zerobounce.net/v2/validate' +
    `?api_key=${encodeURIComponent(apiKey)}` +
    `&email=${encodeURIComponent(email)}` +
    `&ip_address=${encodeURIComponent(ip === 'unknown' ? '' : ip)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!res.ok) {
      console.error(`[EMAIL-VERIFY] ZeroBounce HTTP ${res.status}; email not verified`);
      return unchecked(`http_${res.status}`);
    }
    const data = (await res.json()) as { status?: string; sub_status?: string; error?: string };
    // ZeroBounce answers HTTP 200 with an `error` field (and no status) for a
    // bad key or an account that is out of credits. That is an outage, not a
    // verdict, so it must not be reported as "checked".
    if (data.error || !data.status) {
      console.error(`[EMAIL-VERIFY] ZeroBounce returned no verdict: ${data.error || 'empty status'}`);
      return unchecked('zerobounce_error');
    }
    const verdict: EmailVerdict = {
      ok: !BLOCK_STATUSES.has(data.status),
      checked: true,
      status: data.status,
      sub_status: data.sub_status || null,
    };
    if (cache.size >= CACHE_MAX) cache.clear();
    cache.set(email, { at: Date.now(), verdict });
    return verdict;
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'network_error';
    console.error(`[EMAIL-VERIFY] ZeroBounce ${reason}; email not verified`);
    return unchecked(reason);
  } finally {
    clearTimeout(timer);
  }
}

/** Short tag for notes / spam flags, e.g. "invalid-email:possible_typo". */
export function badEmailFlag(v: EmailVerdict): string | null {
  if (v.ok) return null;
  return `invalid-email:${v.sub_status || v.status || 'invalid'}`;
}
