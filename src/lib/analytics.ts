export type AnalyticsEventParams = Record<string, unknown>;

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

export function trackEvent(event: string, params: AnalyticsEventParams = {}) {
    if (typeof window === "undefined") return;

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
