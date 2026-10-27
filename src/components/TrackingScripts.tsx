"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TrackingScripts() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/settings`, {
                    headers: {
                        "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY ?? "",
                        Accept: "application/json",
                    },
                });

                if (!res.ok) return;

                const data = await res.json();
                setSettings(data.data);
            } catch (error) {
                console.error("TrackingScripts error:", error);
            }
        }

        loadSettings();
    }, []);

    if (!settings) return null;

    const gtmId = settings["seo.gtm_id"];
    const ga4Id = settings["seo.ga4_id"];
    const pixelId = settings["seo.meta_pixel_id"];
    const gscCode = settings["seo.gsc_verification"];

    return (
        <>
            {/* ========================= */}
            {/* 🔷 GOOGLE SEARCH CONSOLE */}
            {/* ========================= */}
            {gscCode && (
                <meta name="google-site-verification" content={gscCode} />
            )}

            {/* ========================= */}
            {/* 🔶 GOOGLE TAG MANAGER */}
            {/* ========================= */}
            {gtmId && (
                <>
                    <Script id="gtm-script" strategy="afterInteractive">
                        {`
                        if (!window.__GTM_LOADED__) {
                            window.__GTM_LOADED__ = true;
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${gtmId}');
                        }
                    `}
                    </Script>

                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                            height="0"
                            width="0"
                            style={{ display: "none", visibility: "hidden" }}
                        />
                    </noscript>
                </>
            )}

            {/* ========================= */}
            {/* 🔵 GOOGLE ANALYTICS 4 */}
            {/* ========================= */}
            {ga4Id && (
                <>
                    <Script
                        async
                        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                        strategy="afterInteractive"
                    />

                    <Script id="ga4-script" strategy="afterInteractive">
                        {`
                            if (!window.__GA4_LOADED__) {
                                window.__GA4_LOADED__ = true;
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${ga4Id}');
                            }
                        `}
                    </Script>
                </>
            )}

            {/* ========================= */}
            {/* 🟣 META PIXEL (Facebook Pixel) */}
            {/* ========================= */}
            {pixelId && (
                <>
                    <Script id="fb-pixel-script" strategy="afterInteractive">
                        {`
                            if (!window.__META_PIXEL_LOADED__) {
                                window.__META_PIXEL_LOADED__ = true;
                                !function(f,b,e,v,n,t,s)
                                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                                n.queue=[];t=b.createElement(e);t.async=!0;
                                t.src=v;s=b.getElementsByTagName(e)[0];
                                s.parentNode.insertBefore(t,s)}(window, document,'script',
                                'https://connect.facebook.net/en_US/fbevents.js');
                                
                                fbq('init', '${pixelId}');
                                fbq('track', 'PageView');
                            }
                        `}
                    </Script>

                    <noscript>
                        <Image
                            height="1"
                            width="1"
                            alt=""
                            style={{ display: "none" }}
                            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                        />
                    </noscript>
                </>
            )}
        </>
    );
}
