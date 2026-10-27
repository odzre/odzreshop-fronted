"use client";

import { useSettings } from "@/context/settings-context";
import { ContentLayout } from "@/components/panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
    Crown,
    Gem,
    Rocket,
    ArrowRight,
    Sparkles
} from "lucide-react";

interface PartnershipSettings {
    data: {
        "partnership.enabled"?: string | number | boolean;
        "partnership.hero_title"?: string;
        "partnership.hero_subtitle"?: string;
        "partnership.hero_banner"?: string;
        "partnership.gold.title"?: string;
        "partnership.gold.content"?: string;
        "partnership.gold.banner"?: string;
        "partnership.gold.cta_text"?: string;
        "partnership.gold.cta_url"?: string;
        "partnership.gold.min_deposit"?: string;
        "partnership.platinum.title"?: string;
        "partnership.platinum.content"?: string;
        "partnership.platinum.banner"?: string;
        "partnership.platinum.cta_text"?: string;
        "partnership.platinum.cta_url"?: string;
        "partnership.platinum.min_deposit"?: string;
        "partnership.reseller.title"?: string;
        "partnership.reseller.content"?: string;
        "partnership.reseller.banner"?: string;
        "partnership.reseller.cta_text"?: string;
        "partnership.reseller.cta_url"?: string;
        "partnership.reseller.min_deposit"?: string;
    };
}

const ROLE_CONFIG = [
    {
        slug: "gold" as const,
        prop: "Gold",
        icon: Crown,
        accentClass: "border-amber-500/40 bg-gradient-to-b from-amber-500/15 to-transparent",
        badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        iconClass: "bg-amber-500/15 text-amber-500",
        buttonClass: "bg-amber-500 hover:bg-amber-600 text-white"
    },
    {
        slug: "platinum" as const,
        prop: "Platinum",
        icon: Gem,
        accentClass: "border-blue-800/50 bg-gradient-to-b from-blue-800/20 to-transparent",
        badgeClass: "bg-blue-800/20 text-blue-700 border-blue-800/30 dark:text-blue-400",
        iconClass: "bg-blue-800/20 text-blue-700 dark:text-blue-400",
        buttonClass: "bg-blue-800 hover:bg-blue-900 text-white"
    },
    {
        slug: "reseller" as const,
        prop: "Reseller",
        icon: Rocket,
        accentClass: "border-red-500/40 bg-gradient-to-b from-red-500/15 to-transparent",
        badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
        iconClass: "bg-red-500/15 text-red-500",
        buttonClass: "bg-red-500 hover:bg-red-600 text-white"
    }
];

function CtaLink({
    text,
    url,
    className
}: {
    text?: string;
    url?: string;
    className?: string;
}) {
    if (!text || !url) return null;

    const isExternal = /^https?:\/\//i.test(url);

    if (isExternal) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
                {text}
                <ArrowRight className="h-4 w-4" />
            </a>
        );
    }

    return (
        <Link href={url} className={className}>
            {text}
            <ArrowRight className="h-4 w-4" />
        </Link>
    );
}

export default function PartnershipPage() {
    const settings = useSettings() as unknown as PartnershipSettings | null;
    const isLoading = !settings;
    const s = settings?.data;

    const enabled = useMemo(() => {
        if (isLoading) return true;
        const v = s?.["partnership.enabled"];
        if (v === undefined || v === null || v === "") return true;
        return v === 1 || v === "1" || v === true || v === "true";
    }, [isLoading, s]);

    const roles = ROLE_CONFIG.map(({ slug, prop, icon: Icon, accentClass, badgeClass, iconClass, buttonClass }) => ({
        slug,
        prop,
        Icon,
        accentClass,
        badgeClass,
        iconClass,
        buttonClass,
        title: s?.[`partnership.${slug}.title`],
        content: s?.[`partnership.${slug}.content`],
        banner: s?.[`partnership.${slug}.banner`],
        ctaText: s?.[`partnership.${slug}.cta_text`],
        ctaUrl: s?.[`partnership.${slug}.cta_url`],
        minDeposit: s?.[`partnership.${slug}.min_deposit`]
    }));

    if (isLoading) {
        return (
            <ContentLayout title="Partnership">
                <main className="w-full px-4 py-10 space-y-6">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Skeleton className="h-72 w-full rounded-xl" />
                        <Skeleton className="h-72 w-full rounded-xl" />
                        <Skeleton className="h-72 w-full rounded-xl" />
                    </div>
                </main>
            </ContentLayout>
        );
    }

    if (!enabled) {
        return (
            <ContentLayout title="Partnership">
                <main className="w-full px-4 py-16">
                    <div className="max-w-md mx-auto text-center space-y-3 rounded-xl border border-muted bg-card/50 p-8">
                        <Sparkles className="h-10 w-10 mx-auto text-muted-foreground" />
                        <h1 className="text-xl font-semibold">Halaman Tidak Tersedia</h1>
                        <p className="text-sm text-muted-foreground">
                            Halaman partnership sedang tidak tersedia. Silakan hubungi kami untuk info lebih lanjut.
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-2">
                            <Link href="/contact">Hubungi Kami</Link>
                        </Button>
                    </div>
                </main>
            </ContentLayout>
        );
    }

    const heroTitle = s?.["partnership.hero_title"] || "Partnership & Upgrade Role";
    const heroSubtitle = s?.["partnership.hero_subtitle"];
    const heroBanner = s?.["partnership.hero_banner"];

    return (
        <ContentLayout title="Partnership">
            <main className="w-full px-4 py-10 space-y-8">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-xl border border-muted bg-card">
                    {heroBanner && (
                        <div className="relative h-40 sm:h-56 w-full">
                            <Image
                                src={heroBanner}
                                alt={heroTitle}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                        </div>
                    )}
                    <div className={`space-y-2 ${heroBanner ? "p-6 pt-2" : "p-6"}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-my-color1">
                            {heroTitle}
                        </h1>
                        {heroSubtitle && (
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                                {heroSubtitle}
                            </p>
                        )}
                    </div>
                </section>

                {/* ROLE CARDS */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {roles.map((role) => (
                        <article
                            key={role.slug}
                            className={`flex flex-col overflow-hidden rounded-xl border bg-gradient-to-b ${role.accentClass} bg-card`}
                        >
                            {role.banner && (
                                <div className="relative h-36 w-full">
                                    <Image
                                        src={role.banner}
                                        alt={role.title || role.prop}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}

                            <div className="flex flex-1 flex-col gap-4 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${role.iconClass}`}>
                                            <role.Icon className="h-5 w-5" />
                                        </span>
                                        <h2 className="text-lg font-bold">
                                            {role.title || role.prop}
                                        </h2>
                                    </div>
                                    {role.minDeposit && (
                                        <span className={`rounded-full border px-2.5 py-1 text-xxs font-medium ${role.badgeClass}`}>
                                            {role.minDeposit}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 text-sm leading-relaxed text-muted-foreground partnership-content [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-2">
                                    {role.content ? parse(role.content) : (
                                        <p className="italic">Konten akan segera hadir.</p>
                                    )}
                                </div>

                                {(role.ctaText && role.ctaUrl) && (
                                    <CtaLink
                                        text={role.ctaText}
                                        url={role.ctaUrl}
                                        className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${role.buttonClass}`}
                                    />
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </main>
        </ContentLayout>
    );
}
