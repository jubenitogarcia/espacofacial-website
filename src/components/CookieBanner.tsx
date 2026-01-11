"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "ef_cookie_consent";

function hasConsentCookie(): boolean {
    if (typeof document === "undefined") return true;
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=1`));
}

function setConsentCookie(): void {
    const oneYear = 60 * 60 * 24 * 365;
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=1; Max-Age=${oneYear}; Path=/; SameSite=Lax${secure}`;
}

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(!hasConsentCookie());
    }, []);

    if (!visible) return null;

    return (
        <div className="cookieBanner" role="dialog" aria-label="Cookies">
            <div className="cookieBannerInner">
                <div className="cookieBannerText">
                    Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com o uso de cookies.
                </div>
                <button
                    className="cookieBannerButton"
                    onClick={() => {
                        setConsentCookie();
                        setVisible(false);
                    }}
                >
                    Aceitar
                </button>
            </div>
        </div>
    );
}
