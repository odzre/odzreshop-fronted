"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function GTM() {
  const [gtmId, setGtmId] = useState<string | null>(null);

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

        // ambil dari flat key "seo.gtm_id"
        const id = data?.data?.["seo.gtm_id"] ?? null;
        setGtmId(id);
      } catch (err) {
        console.error("GTM fetch error:", err);
      }
    }

    fetchSettings();
  }, []);

  if (!gtmId) return null;

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      {/* End Google Tag Manager */}
    </>
  );
}
