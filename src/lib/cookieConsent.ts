export const COOKIE_CONSENT_NAME = "ef_cookie_consent";

export function hasCookieConsent(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_CONSENT_NAME}=1`));
}

export function setCookieConsent(): void {
  const oneYear = 60 * 60 * 24 * 365;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_NAME}=1; Max-Age=${oneYear}; Path=/; SameSite=Lax${secure}`;
}

