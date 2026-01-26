"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { hasCookieConsent } from "@/lib/cookieConsent";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function Analytics() {
    const [enabled, setEnabled] = useState<boolean>(() => hasCookieConsent());

    useEffect(() => {
        if (hasCookieConsent()) {
            setEnabled(true);
            return;
        }

        function onConsent() {
            setEnabled(true);
        }

        window.addEventListener("ef_cookie_consent", onConsent);
        return () => window.removeEventListener("ef_cookie_consent", onConsent);
    }, []);

    if (!enabled) return null;

    return (
        <>
            <Script
                id="ef-datalayer"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];`,
                }}
            />

            {GTM_ID ? (
                <Script
                    id="ef-gtm"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
 j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
 })(window,document,'script','dataLayer','${GTM_ID}');`,
                    }}
                />
            ) : null}

            {!GTM_ID && GA4_ID ? (
                <>
                    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
                    <Script
                        id="ef-ga4"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js', new Date());
gtag('config', '${GA4_ID}', { send_page_view: true });`,
                        }}
                    />
                </>
            ) : null}

            {/* TODO: opcional - adicionar Meta Pixel via env var (NEXT_PUBLIC_META_PIXEL_ID). */}
        </>
    );
}
