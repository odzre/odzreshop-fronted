import "./globals.css";
import "./embla.css";
import "./custom.css";
import "@/lib/i18n";

import I18nProvider from "./I18nProvider";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { SettingsProvider } from "@/context/settings-context";
import PanelLayout from "@/components/panel/panel-layout";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ProgressBar } from "@/components/progress-bar/progress-bar";
import { Toaster } from "sonner";
import { Metadata } from "next";
import { DynamicCssVars } from "@/components/providers/DynamicCssVars";
import FloatingContact from "@/components/FloatingContact";
import SocialProfSonner from "@/components/ui/socialprofsonner";
import SocialProfEngine from "@/components/social-prof-sonner";
import TrackingScripts from "@/components/TrackingScripts"; // 🔥 FULL TRACKING

import { notFound } from "next/navigation";

const ibmPlex = IBM_Plex_Sans_Condensed({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"], // sesuaikan kebutuhan
    display: "swap",
});

// ======================================================
// 🔹 Generate metadata
// ======================================================
export async function generateMetadata(): Promise<Metadata> {
    const metadataBase = new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    );

    try {
        const apiUrl = `${process.env.NEXT_PRIVATE_API_URL}/api/settings`;

        const res = await fetch(apiUrl, {
            headers: {
                "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
                Accept: "application/json"
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) throw new Error("Failed to fetch settings");

        const settings = await res.json();

        const BASE_URL =
            process.env.NEXT_PRIVATE_API_URL || "http://127.0.0.1:3000";

        const getFullUrl = (path?: string) =>
            path?.startsWith("https") ? path : `${BASE_URL}/storage/${path}`;

        const rawFavicon = settings.data?.["general.favicon"];
        const rawLogo = settings.data?.["general.favicon"];

        const favicon = Array.isArray(rawFavicon) ? rawFavicon[0] : rawFavicon;
        const logo = Array.isArray(rawLogo) ? rawLogo[0] : rawLogo;

        const iconUrl = favicon ? getFullUrl(favicon) : undefined;
        const logoUrl = logo ? getFullUrl(logo) : undefined;

        return {
            metadataBase,
            title: settings.data?.["seo.title"] ?? undefined,
            description: settings.data?.["seo_description_id"] ?? undefined,
            keywords: settings.data?.["seo_keywords_id"] ?? undefined,

            ...(iconUrl && { icons: { icon: iconUrl } }),

            verification: settings.data?.["seo.gsc_verification"]
                ? { google: settings.data["seo.gsc_verification"] }
                : undefined,

            openGraph: {
                title: settings.data?.["seo.title"] ?? undefined,
                description: settings.data?.["seo_description_id"] ?? undefined,
                url: metadataBase.origin,
                ...(logoUrl && {
                    images: [
                        {
                            url: logoUrl,
                            width: 1200,
                            height: 630,
                            alt: settings.data?.["seo.title"] ?? undefined
                        }
                    ]
                }),
                type: "website"
            },

            twitter: {
                card: "summary_large_image",
                title: settings.data?.["seo.title"] ?? undefined,
                description: settings.data?.["seo_description_id"] ?? undefined,
                ...(logoUrl && { images: [logoUrl] })
            }
        };
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return { metadataBase };
    }
}

// ======================================================
// 🔹 Layout utama
// ======================================================
export default async function Layout({
    children
}: {
    children: React.ReactNode;
}) {
    const apiUrl = `${process.env.NEXT_PRIVATE_API_URL}/api/settings`;

    const res = await fetch(apiUrl, {
        headers: {
            "X-API-KEY": process.env.API_ACCESS_KEY ?? "",
            Accept: "application/json"
        },
        next: { revalidate: 3600 }
    });

    const settings = res.ok ? await res.json() : null;

    const regionData = settings?.data?.region;

    const activeRegion = regionData?.active ?? "ID";
    const availableRegions = regionData?.data ?? [];
    const hasMalaysia =
        activeRegion === "MY" ||
        availableRegions.some((r: any) => r.code === "MY");

    const userRegion = activeRegion ?? "ID";

    if (userRegion === "MY" && !hasMalaysia) {
        notFound();
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <TrackingScripts />
                {settings?.data && process.env.NEXT_PUBLIC_SITE_URL && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebSite",
                                name:
                                    settings.data["general.site_name"] ||
                                    settings.data["seo.site_name"] ||
                                    settings.data["seo.title"],
                                alternateName:
                                    settings.data["general.site_name_alt"] ||
                                    settings.data["seo.title"],
                                url: process.env.NEXT_PUBLIC_SITE_URL
                            })
                        }}
                    />
                )}
            </head>

            <body className={`${ibmPlex.className} overflow-x-hidden`}>

                <ProgressBar className="fixed top-0 h-0.5 z-30">
                    <Toaster position="top-center" />

                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        forcedTheme={undefined}
                        storageKey="theme"
                    >
                        <SettingsProvider>
                            <DynamicCssVars />
                            <I18nProvider>
                                <FloatingContact />
                                <PanelLayout>{children}</PanelLayout>
                            </I18nProvider>
                        </SettingsProvider>
                    </ThemeProvider>
                </ProgressBar>
                <SocialProfSonner />

                {/* ✅ SOCIAL PROOF ENGINE */}
                <SocialProfEngine />
            </body>
        </html>
    );
}
