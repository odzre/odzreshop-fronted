"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function GA4() {
    const [ga4Id, setGa4Id] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/settings`, {
                    headers: {
                        "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY ?? "",
                        Accept: "application/json",
                    },
                });

                if (!res.ok) return;
                const data = await res.json();

                // Ambil GA4 Measurement ID
                const id = data?.data?.["seo.ga4_id"] ?? null;
                setGa4Id(id);
            } catch (err) {
                console.error("GA4 fetch error:", err);
            }
        }

        fetchSettings();
    }, []);

    if (!ga4Id) return null;

    return (
        <>
            {/* Google tag (gtag.js) */}
            <Script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                strategy="afterInteractive"
            />

            {/* GA4 Init */}
            <Script id="ga4-init" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}');
        `}
            </Script>
        </>
    );
}
