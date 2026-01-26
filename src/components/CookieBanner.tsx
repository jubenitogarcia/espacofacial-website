"use client";

import { useEffect, useState } from "react";
import { hasCookieConsent, setCookieConsent } from "@/lib/cookieConsent";

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(!hasCookieConsent());
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
                        setCookieConsent();
                        setVisible(false);
                        window.dispatchEvent(new Event("ef_cookie_consent"));
                    }}
                >
                    Aceitar
                </button>
            </div>
        </div>
    );
}
