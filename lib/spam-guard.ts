// ═══ SPAM GUARD — Anti-bot protection for lead forms ═══

export function isGibberish(text: string): boolean {
  if (!text || text.length < 5) return false;
  const clean = text.replace(/\s+/g, "");
  const vowels = (clean.match(/[aeiouAEIOU]/g) || []).length;
  if (clean.length > 5 && vowels / clean.length < 0.15) return true;
  const midCaps = (clean.match(/[a-z][A-Z]/g) || []).length;
  if (midCaps >= 3) return true;
  const unique = new Set(clean.toLowerCase()).size;
  if (clean.length > 8 && unique / clean.length > 0.85) return true;
  return false;
}

export function isValidUSPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits[0] === "1");
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const disposable = [
    "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
    "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
    "dispostable.com", "trashmail.com", "fakeinbox.com", "10minutemail.com",
    "temp-mail.org", "mailnesia.com",
  ];
  return disposable.includes(domain);
}

const ipCounts: Map<string, { count: number; first: number }> = new Map();
export function isRateLimited(ip: string, max = 5, windowMs = 3600000): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now - entry.first > windowMs) {
    ipCounts.set(ip, { count: 1, first: now });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

export function getIP(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/** Run all spam checks. Returns null if clean, or a Response to return if spam. */
export function spamCheck(body: Record<string, unknown>, ip: string): Response | null {
  const { name, phone, email, _hp, _ts } = body as {
    name?: string; phone?: string; email?: string; _hp?: string; _ts?: number;
  };

  // Honeypot
  if (_hp) return Response.json({ success: true });

  // Speed check (<3s)
  if (_ts && Date.now() - _ts < 3000) return Response.json({ success: true });

  // Rate limit
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  // Gibberish name
  if (name && isGibberish(name)) return Response.json({ success: true });

  // Invalid phone
  if (phone && !isValidUSPhone(phone)) {
    return Response.json({ error: "Please enter a valid US phone number." }, { status: 400 });
  }

  // Disposable email
  if (email && isDisposableEmail(email)) {
    return Response.json({ error: "Please use a permanent email address." }, { status: 400 });
  }

  return null;
}
