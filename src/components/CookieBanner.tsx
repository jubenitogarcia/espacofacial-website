"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    dispatchConsent,
    getCookieConsent,
    hasStoredConsent,
    setCookieConsent,
    COOKIE_CONSENT_EVENT,
    COOKIE_CONSENT_OPEN_EVENT,
    type CookieConsent,
} from "@/lib/cookieConsent";

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
    const [marketingAllowed, setMarketingAllowed] = useState(false);

    useEffect(() => {
        const consent = getCookieConsent();
        setVisible(!hasStoredConsent());
        setAnalyticsAllowed(consent?.analytics ?? false);
        setMarketingAllowed(consent?.marketing ?? false);
    }, []);

    useEffect(() => {
        function onOpenPrefs() {
            const consent = getCookieConsent();
            setAnalyticsAllowed(consent?.analytics ?? false);
            setMarketingAllowed(consent?.marketing ?? false);
            setVisible(true);
            setPrefsOpen(true);
        }

        window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpenPrefs);
        return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, onOpenPrefs);
    }, []);

    useEffect(() => {
        function onConsent(event: Event) {
            const detail = (event as CustomEvent<CookieConsent>).detail;
            if (!detail) return;
            setAnalyticsAllowed(detail.analytics);
            setMarketingAllowed(detail.marketing);
        }

        window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
        return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
    }, []);

    if (!visible) return null;

    function applyConsent(consent: CookieConsent) {
        setCookieConsent(consent);
        dispatchConsent(consent);
        setVisible(false);
        setPrefsOpen(false);
    }

    return (
        <div className="cookieBanner" role="dialog" aria-label="Cookies">
            <div className="cookieBannerInner">
                <div className="cookieBannerText">
                    Usamos cookies essenciais e, com seu consentimento, cookies de análise e marketing para melhorar
                    sua experiência, medir resultados e oferecer conteúdos relevantes.
                    <span style={{ display: "inline-block", marginLeft: 6 }}>
                        <Link href="/privacidade" style={{ textDecoration: "underline" }}>
                            Saiba mais
                        </Link>
                        .
                    </span>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                        className="cookieBannerButton"
                        onClick={() => {
                            setPrefsOpen((v) => !v);
                        }}
                    >
                        Preferências
                    </button>
                    <button
                        className="cookieBannerButton"
                        onClick={() => {
                            applyConsent({ analytics: false, marketing: false });
                        }}
                    >
                        Rejeitar
                    </button>
                    <button
                        className="cookieBannerButton"
                        onClick={() => {
                            applyConsent({ analytics: true, marketing: true });
                        }}
                    >
                        Aceitar tudo
                    </button>
                </div>
            </div>

            {prefsOpen ? (
                <div className="cookieBannerInner" style={{ marginTop: 10 }}>
                    <div className="cookieBannerText">
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>Preferências</div>
                        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                                type="checkbox"
                                checked={analyticsAllowed}
                                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                            />
                            Cookies de análise (ex.: GA4)
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                            <input
                                type="checkbox"
                                checked={marketingAllowed}
                                onChange={(e) => setMarketingAllowed(e.target.checked)}
                            />
                            Cookies de marketing/remarketing (ex.: Google Ads, Meta)
                        </label>
                        <div className="small" style={{ marginTop: 6 }}>
                            Essenciais sempre ativos.
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                            className="cookieBannerButton"
                            onClick={() => {
                                applyConsent({ analytics: analyticsAllowed, marketing: marketingAllowed });
                            }}
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
