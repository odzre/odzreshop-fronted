"use client";

import Image from "@/components/ui/Image";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import React, { memo, useMemo, useEffect } from "react";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "react-i18next";
import { HeroEffects } from "@/components/ui/hero-effects";


interface GameHeaderProps {
    games: {
        image?: string | null;
        banner?: string | null;
        title?: string | null;
        logo?: string | null;
        character?: string | null;
        developers?: string | null;
    } | null;
    backgroundTitle?: string | null;
}

const safe = (v?: string | null) => (v && v.trim().length > 0 ? v : null);

const Feature = memo(function Feature({
    img,
    alt,
    text
}: {
    img: string;
    alt: string;
    text: string;
}) {
    return (
        <div className="flex items-center justify-center md:justify-start gap-2">
            <Image
                src={img}
                alt={alt}
                width={24}
                height={24}
                unoptimized
                loading="lazy"
            />
            <span className="text-xxs md:text-sm">{text}</span>
        </div>
    );
});

function GameHeaderBase({ games, backgroundTitle }: GameHeaderProps) {
    const { t } = useTranslation();
    const settings = useSettings() as { data?: Record<string, string> } | null;
    const uiEffect = Number(
        settings?.data?.["general.ui_effect"] ?? 0
    );

    const style = settings?.data?.["general.game_list_style"] ?? "0";
    const bannerSrc = useMemo(() => {
        if (safe(games?.banner)) return games!.banner!;

        const settingBanner = safe(settings?.data?.["general.banner_game"]);
        if (settingBanner) return settingBanner;

        return null;
    }, [games, settings?.data]);
    const title = games?.title ?? "Loading…";
    const developers = games?.developers ?? "";

    useEffect(() => {
        if (games?.title) {
            document.title = `Top Up ${games.title} Termurah & Terpercaya #TopUpTanpaRagu`;
        } else {
            document.title = "Top Up Game";
        }
        if (backgroundTitle) {
            document.documentElement.style.setProperty(
                "--image-overlay",
                `url(${backgroundTitle})`
            );
        }
    }, [games?.title, backgroundTitle]);

    const FEATURES = useMemo(
        () => [
            {
                img: "/petir.gif",
                alt: t("order.Proses Cepat"),
                text: t("order.Proses Cepat")
            },
            {
                img: "/contact-support.gif",
                alt: t("order.Layanan Chat 24/7"),
                text: t("order.Layanan Chat 24/7")
            },
            {
                img: "/secure.gif",
                alt: t("order.Pembayaran Aman"),
                text: t("order.Pembayaran Aman")
            }
        ],
        [t]
    );

    return (
        <div className="w-full mx-auto">
            {/* Banner */}
            <div className="-mx-[calc(50vw-50%)] -my-8">
                <div className="relative w-full min-h-80 overflow-hidden">
                    {/* 🌨️ / ☄️ UI EFFECT – UKURAN SAMA DENGAN BANNER */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <HeroEffects effect={uiEffect} />
                    </div>

                    {bannerSrc ? (
                        <Image
                            src={bannerSrc}
                            alt={title || "Game banner"}
                            width={1280}
                            height={640}
                            className="absolute inset-0 z-0 w-full h-full object-cover"
                            priority
                            sizes="100vw"
                        />
                    ) : (
                        <Skeleton className="absolute inset-0 z-0" />
                    )}
                </div>
            </div>




            {/* Card Section */}
            <section className="relative w-full mx-auto -mt-10 z-10">
                <div className="-mx-[calc(50vw-50%)]">
                    <div className="w-full mx-auto bg-background backdrop-blur-md boder-none shadow-sm bg-title-overlay bg-cover bg-center bg-no-repeat">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full container mx-auto px-6 sm:px-6 md:px-8 py-4 md:py-6 flex flex-row items-start gap-4"
                        >
                            {/* ================= STYLE 1 ================= */}
                            {(style === "0" || style === "2") && (
                                <div className="relative flex-shrink-0 -mt-12 md:-mt-24 w-24 sm:w-48 md:w-48">
                                    {games ? (
                                        <div className="relative w-full aspect-square">
                                            {safe(games?.image) && (
                                                <Image
                                                    src={games!.image!}
                                                    alt={`${title} cover`}
                                                    width={180}
                                                    height={180}
                                                    className="absolute inset-0 w-full h-full rounded-xl shadow-xl object-cover blur-[4px]"
                                                    style={{
                                                        zIndex: 1,
                                                        transform:
                                                            "perspective(900px) translateY(-5%) rotateX(25deg)"
                                                    }}
                                                />
                                            )}
                                            {safe(games?.character) && (
                                                <Image
                                                    src={games!.character!}
                                                    alt={`${title} character`}
                                                    width={384}
                                                    height={384}
                                                    className="absolute inset-0 w-full h-full object-contain"
                                                    style={{
                                                        zIndex: 2,
                                                        transform:
                                                            "translateY(-8%) scale(1.2) rotateX(8deg)",
                                                        transformOrigin: "bottom center"
                                                    }}
                                                />
                                            )}
                                            {safe(games?.logo) && (
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-[120px] md:w-[180px]">
                                                    <Image
                                                        src={games!.logo!}
                                                        alt={`${title} logo`}
                                                        width={275}
                                                        height={69}
                                                        className="object-contain w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Skeleton className="w-24 h-24 sm:h-48 sm:w-48 md:h-48 md:w-48 rounded-xl" />
                                    )}
                                </div>
                            )}

                            {/* ================= STYLE 2 ================= */}
                            {style === "1" && (
                                <div className="product-thumbnail-container flex-shrink-0 -mt-8 md:-mt-18">
                                    {safe(games?.image) ? (
                                        <Image
                                            src={games!.image!}
                                            alt={`${title} cover`}
                                            width={120}
                                            height={120}
                                            className="z-20 -mb-14 aspect-square w-32 rounded-2xl object-cover shadow-2xl md:-mb-20 md:w-60"
                                        />
                                    ) : (
                                        <Skeleton className="w-24 h-24 sm:h-48 sm:w-48 md:h-48 md:w-48 rounded-xl" />
                                    )}
                                </div>
                            )}

                            {/* Game Info */}
                            <div className="flex flex-col justify-center text-left flex-1">
                                {games ? (
                                    <>
                                        <h1 className="text-base sm:text-lg md:text-2xl font-bold tracking-tight">
                                            {title}
                                        </h1>
                                        {developers && (
                                            <p className="text-sm text-muted-foreground">
                                                {developers}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Skeleton className="h-6 w-48 mb-2" />
                                        <Skeleton className="h-4 w-32 mb-4" />
                                    </>
                                )}
                                <div className="hidden md:flex mt-4 gap-4">
                                    {FEATURES.map((f) => (
                                        <Feature key={f.img} {...f} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        {/* Mobile features */}
                        <div className="-mt-2 py-4 md:hidden grid grid-cols-3 text-center">
                            {games ? (
                                FEATURES.map((f) => <Feature key={`m-${f.img}`} {...f} />)
                            ) : (
                                <>
                                    <FeatureSkeleton />
                                    <FeatureSkeleton />
                                    <FeatureSkeleton />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureSkeleton() {
    return (
        <div className="flex items-center justify-center gap-2">
            <Skeleton className="rounded-full size-5" />
            <Skeleton className="h-3 w-12" />
        </div>
    );
}

export default memo(GameHeaderBase);
