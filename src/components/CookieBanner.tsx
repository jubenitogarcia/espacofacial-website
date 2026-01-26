"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCookieConsent, setCookieConsent, type CookieConsentValue } from "@/lib/cookieConsent";

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

    useEffect(() => {
        const v = getCookieConsent();
        setVisible(v === null);
    }, []);

    if (!visible) return null;

    return (
        <div className="cookieBanner" role="dialog" aria-label="Cookies">
            <div className="cookieBannerInner">
                <div className="cookieBannerText">
                    Usamos cookies essenciais e, com seu consentimento, cookies de análise para melhorar sua experiência.
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
                            setCookieConsent("0");
                            setVisible(false);
                        }}
                    >
                        Rejeitar
                    </button>
                    <button
                        className="cookieBannerButton"
                        onClick={() => {
                            setCookieConsent("1");
                            setVisible(false);
                            window.dispatchEvent(new Event("ef_cookie_consent"));
                        }}
                    >
                        Aceitar
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
                            Cookies de análise (GTM/GA4)
                        </label>
                        <div className="small" style={{ marginTop: 6 }}>
                            Essenciais sempre ativos.
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <button
                            className="cookieBannerButton"
                            onClick={() => {
                                const v: CookieConsentValue = analyticsAllowed ? "1" : "0";
                                setCookieConsent(v);
                                setVisible(false);
                                if (v === "1") window.dispatchEvent(new Event("ef_cookie_consent"));
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
