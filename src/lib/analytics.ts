import { getCookieConsent } from "@/lib/cookieConsent";

export type AnalyticsEventParams = Record<string, unknown>;

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        fbq?: (...args: unknown[]) => void;
    }
}

function hasTrackingConsent(): boolean {
    if (typeof window === "undefined") return false;
    const consent = getCookieConsent();
    return Boolean(consent?.analytics || consent?.marketing);
}

function hasMarketingConsent(): boolean {
    if (typeof window === "undefined") return false;
    return getCookieConsent()?.marketing === true;
}

export function trackEvent(event: string, params: AnalyticsEventParams = {}) {
    if (typeof window === "undefined") return;

    const debug =
        (() => {
            try {
                if (new URLSearchParams(window.location.search).get("ef_debug") === "1") return true;
            } catch {
                // ignore
            }
            try {
                return window.localStorage.getItem("ef_debug") === "1";
            } catch {
                return false;
            }
        })();

    if (!hasTrackingConsent()) {
        if (debug) {
            console.info("[analytics:block]", event, params);
        }
        return;
    }

    if (debug) {
        console.info("[analytics]", event, params);
    }

    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...params });

    if (typeof window.gtag === "function") {
        try {
            window.gtag("event", event, params);
        } catch {
            // noop
        }
    }

    if (hasMarketingConsent() && typeof window.fbq === "function") {
        try {
            window.fbq("trackCustom", event, params);
        } catch {
            // noop
        }
    }
}
