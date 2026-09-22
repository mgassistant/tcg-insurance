import { NextRequest, NextResponse } from 'next/server';
const BLOCK_STATUSES = new Set(['invalid', 'spamtrap', 'abuse', 'do_not_mail']);
function getClientIP(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '';
}
export async function POST(req: NextRequest) {
  let email = '';
  try { const body = await req.json(); email = (body?.email || '').toString().trim(); }
  catch { return NextResponse.json({ ok: true, checked: false, reason: 'bad_request' }); }
  if (!email || !email.includes('@')) return NextResponse.json({ ok: false, checked: false, reason: 'invalid_format' });
  const apiKey = process.env.ZEROBOUNCE_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true, checked: false, reason: 'no_api_key' });
  const url = `https://api.zerobounce.net/v2/validate?api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}&ip_address=${encodeURIComponent(getClientIP(req))}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return NextResponse.json({ ok: true, checked: false, reason: `http_${res.status}` });
    const data = (await res.json()) as { status?: string; sub_status?: string };
    const status = data.status || 'unknown';
    return NextResponse.json({ ok: !BLOCK_STATUSES.has(status), checked: true, status, sub_status: data.sub_status || null });
  } catch (err) { return NextResponse.json({ ok: true, checked: false, reason: err instanceof Error ? err.message : 'error' }); }
  finally { clearTimeout(timer); }
}
