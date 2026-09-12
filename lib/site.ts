// Central site constants used for SEO, structured data, and canonical URLs.
export const SITE_URL = "https://tcg-insurance.com";
export const SITE_NAME = "TCG Insurance";
export const SITE_PHONE = "(800) 933-0710";
export const SITE_PHONE_E164 = "+18009330710";
export const SITE_EMAIL = "support@tcg-insurance.com";
export const AGENCY_LEGAL_NAME = "Better Help Insurance Solutions Inc.";
export const AGENCY_NPN = "20676907";

/** Build an absolute URL for a site-relative path. */
export function absUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
