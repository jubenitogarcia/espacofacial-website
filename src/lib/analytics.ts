export type AnalyticsEventParams = Record<string, unknown>;

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
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

    if (debug) {
        // eslint-disable-next-line no-console
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
}
