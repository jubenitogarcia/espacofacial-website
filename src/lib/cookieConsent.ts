export const COOKIE_CONSENT_NAME = "ef_cookie_consent";

export type CookieConsentValue = "1" | "0"; // 1=accepted, 0=rejected

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof document === "undefined") return "1";
  const entry = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_CONSENT_NAME}=`));
  if (!entry) return null;
  const value = entry.split("=")[1]?.trim() ?? "";
  if (value === "1" || value === "0") return value;
  return null;
}

export function hasCookieConsent(): boolean {
  const v = getCookieConsent();
  return v === "1";
}

export function setCookieConsent(value: CookieConsentValue): void {
  const oneYear = 60 * 60 * 24 * 365;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; Max-Age=${oneYear}; Path=/; SameSite=Lax${secure}`;
}
