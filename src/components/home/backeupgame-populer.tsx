"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "@/components/ui/Image";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { WaveSnow } from "@/components/ui/WaveSnow";
import { useImageColor } from "@/hooks/useImageColor";

interface Game {
    id: string;
    title: string;
    developers: string;
    image: string;
    slug: string;
    status: number;
    logo: string;
    sort: string;
}

interface PopularGamesProps {
    isLoading: boolean;
    popularGames?: Game[];
    settings?: Record<string, any>;
    uiEffect: number;

}

function ImagePlaceholder({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-1/3 h-1/3 text-gray-400"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
                />
            </svg>
        </div>
    );
}

function Style3Item({ game, handleClick, isSnowEffect }: any) {
    const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
    const bgColor = useImageColor(imgEl);

    return (
        <motion.li
            variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            <Link
                href={`/order/${game.slug}`}
                onClick={(e) => handleClick(game.slug, e)}
                style={bgColor ? { backgroundColor: bgColor } : undefined}
                className="
                    relative group flex items-center gap-3
                    rounded-xl
                    bg-[image:var(--image-popular)]
                    bg-cover bg-center
                    p-2.5 sm:p-3
                    transition-all duration-300
                    hover:ring-2 hover:ring-primary
                    hover:ring-offset-2 hover:ring-offset-background
                    focus-visible:outline-none
                "
            >
                {isSnowEffect && (
                    <WaveSnow className="absolute -top-2 left-0 w-full h-6 sm:h-8 pointer-events-none" />
                )}

                {game.image ? (
                    <Image
                        src={game.image}
                        alt={game.title}
                        width={64}
                        height={64}
                        crossOrigin="anonymous"
                        onLoadingComplete={(img) => {
                            setImgEl(img);
                        }}
                        className="
            aspect-square h-14 w-14 sm:h-20 sm:w-20
            rounded-lg object-cover
            ring-1 ring-background
            transition-transform duration-300
            group-hover:scale-105
        "
                    />
                ) : (
                    <ImagePlaceholder className="aspect-square h-14 w-14 sm:h-20 sm:w-20 rounded-lg" />
                )}

                <div className="min-w-0">
                    <h2 className="truncate text-xs sm:text-sm md:text-base font-semibold">
                        {game.title}
                    </h2>
                    <p className="truncate text-[10px] sm:text-xs text-my-color3 opacity-75">
                        {game.developers}
                    </p>
                </div>
            </Link>
        </motion.li>
    );
}

export function PopularGames({
    isLoading,
    popularGames,
    settings,
    uiEffect
}: PopularGamesProps) {
    const { i18n } = useTranslation();
    const lang = i18n.language || "id";
    const router = useRouter();
    const style = settings?.["general.popular_style"] ?? "0";
    const title =
        lang === "en"
            ? settings?.["general.popular_title_en"] ?? ""
            : settings?.["general.popular_title_id"] ?? "";

    const subtitle =
        lang === "en"
            ? settings?.["general.popular_subtitle_en"] ?? ""
            : settings?.["general.popular_subtitle_id"] ?? "";

    const popularIcon = settings?.["general.popular_icon"];

    // urutkan game populer
    const gamesPopulerTerurut = useMemo(() => {
        return (
            popularGames
                ?.filter((game) => game.status === 1)
                .sort((a, b) => {
                    const sortA = Number(a.sort);
                    const sortB = Number(b.sort);
                    if (sortA === 0 && sortB !== 0) return 1;
                    if (sortA !== 0 && sortB === 0) return -1;
                    return sortA - sortB;
                }) || []
        );
    }, [popularGames]);

    const isSnowEffect = uiEffect === 1


    const handleClick = async (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        await router.prefetch(`/order/${slug}`);
        setTimeout(() => router.push(`/order/${slug}`), 500);
    };

    useEffect(() => {
        if (!settings) return;

        const imgPopular = settings["general.image_popular"];

        if (imgPopular) {
            document.documentElement.style.setProperty(
                "--image-popular",
                `url(${imgPopular})`
            );
        }
    }, [settings]);


    // ================= STYLE 1 =================
    if (style === "0") {
        return (
            <div>
                <motion.div
                    className="mb-5 text-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="flex items-center gap-1 mb-2">
                        {popularIcon && (
                            <Image
                                src={popularIcon}
                                alt="Popular"
                                width={28}
                                height={28}
                                className="w-7 h-7"
                            />
                        )}
                        <h3 className="text-lg font-semibold uppercase leading-relaxed tracking-wider">
                            {title}
                        </h3>
                    </div>
                    <p className="pl-6 text-xs">{subtitle}</p>
                </motion.div>

                <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <li key={index} className="rounded-2xl overflow-hidden">
                                <div className="rounded-2xl w-full">
                                    {/* Skeleton gambar — sama tinggi dengan gambar asli */}
                                    <div className="h-[4.5rem] sm:h-24 w-full bg-gray-700/40 dark:bg-gray-600/40 animate-pulse" />

                                    {/* Skeleton CardContent */}
                                    <div className="px-4 py-2 bg-gray-800/30 dark:bg-gray-700/30">
                                        {/* Title */}
                                        <div className="h-3 sm:h-4 w-3/4 bg-gray-600/40 dark:bg-gray-500/40 rounded-md animate-pulse mb-2" />

                                        {/* Developers */}
                                        <div className="h-2.5 sm:h-3 w-1/2 bg-gray-600/30 dark:bg-gray-500/30 rounded-md animate-pulse" />
                                    </div>
                                </div>
                            </li>
                        ))

                        : gamesPopulerTerurut.map((gamePopuler, index) => (
                            <motion.li
                                key={gamePopuler.id}
                                className="transition-all"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                    ease: [0.4, 0.0, 0.2, 1]
                                }}
                            >
                                <div className="relative ">
                                    <Card className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 ease-in-out">

                                        <Link
                                            href={`/order/${gamePopuler.slug}`}
                                            onClick={(e) => handleClick(gamePopuler.slug, e)}
                                            className="relative block focus:outline-none"
                                        >

                                            <div className="relative h-[4.5rem] sm:h-24 overflow-hidden">
                                                {gamePopuler.image ? (
                                                    <Image
                                                        alt={gamePopuler.title}
                                                        src={gamePopuler.image}
                                                        fill
                                                        className="object-cover object-top grayscale transition duration-500 ease-in-out group-hover:grayscale-0 group-hover:scale-105 md:object-[100%_20%]"
                                                        style={{ inset: 0 }}
                                                        priority
                                                    />
                                                ) : (
                                                    <ImagePlaceholder className="absolute inset-0" />
                                                )}
                                                {gamePopuler.logo && (
                                                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-12 sm:w-16">
                                                        <Image
                                                            alt={`${gamePopuler.title} Logo`}
                                                            src={gamePopuler.logo}
                                                            width={64}
                                                            height={64}
                                                            className="object-contain"
                                                            priority
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="flex flex-col items-start justify-between bg-primary bg-popular-overlay bg-cover bg-center bg-no-repeat px-4 py-2 md:flex-row md:items-center md:py-4">
                                                <h2 className="font-semibold text-xs sm:text-base truncate">
                                                    {gamePopuler.title}
                                                </h2>
                                                <p className="text-xxs sm:text-xs opacity-80 truncate">
                                                    {gamePopuler.developers}
                                                </p>
                                            </CardContent>
                                        </Link>


                                    </Card>
                                    {isSnowEffect && (
                                        <WaveSnow
                                            className="absolute -left-[2px] -top-[8px] w-full h-6 sm:h-8"

                                        />
                                    )}
                                </div>

                            </motion.li>
                        ))}
                </ul>
            </div>
        );
    }

    // ================= STYLE 3 =================
    if (style === "2") {
        return (
            <div>
                {/* HEADER */}
                <motion.div
                    className="mb-5 mt-5 text-foreground"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        {popularIcon && (
                            <Image
                                src={popularIcon}
                                alt="Popular"
                                width={28}
                                height={28}
                                className="w-7 h-7"
                            />
                        )}
                        <h3 className="text-lg font-semibold text-my-color1 uppercase tracking-wider">
                            {title}
                        </h3>
                    </div>

                    <p className="pl-9 text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                </motion.div>

                {/* GRID */}
                <motion.ul
                    className="
                        grid grid-cols-2 gap-2.5
                        sm:gap-3
                        md:grid-cols-3 md:gap-4
                    "
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: {
                            transition: { staggerChildren: 0.06 },
                        },
                    }}
                >
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <li
                                key={i}
                                className="h-[88px] sm:h-[104px] rounded-xl bg-muted animate-pulse"
                            />
                        ))
                        : gamesPopulerTerurut.map((game) => (
                            <Style3Item
                                key={game.id}
                                game={game}
                                handleClick={handleClick}
                                isSnowEffect={isSnowEffect}
                            />
                        ))}
                </motion.ul>
            </div>
        );
    }



    // ================= STYLE 2 =================
    return (
        <div className="pb-4">
            <motion.div
                className="mb-5 mt-5 text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="flex items-center gap-1 mb-2">
                    {popularIcon && (
                        <Image
                            src={popularIcon}
                            alt="Popular"
                            width={28}
                            height={28}
                            className="w-7 h-7"
                        />
                    )}
                    <h3 className="text-lg font-semibold text-my-color1 uppercase leading-relaxed tracking-wider">
                        {title}
                    </h3>
                </div>
                <p className="pl-6 text-xs text-muted-foreground">{subtitle}</p>
            </motion.div>

            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <li
                            key={index}
                            className="group relative rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] p-1.5"
                        >
                            {/* IMAGE SKELETON */}
                            <div className="relative h-24 sm:h-28 rounded-xl overflow-hidden outline outline-2 outline-offset-2">
                                <div className="absolute inset-0 bg-gray-700/50 dark:bg-gray-600/50 animate-pulse" />
                            </div>

                            {/* TEXT AREA */}
                            <div className="px-1 pt-3 pb-1">
                                {/* Title skeleton */}
                                <div className="h-3 w-3/4 bg-gray-600/50 dark:bg-gray-500/50 rounded-md animate-pulse mb-2"></div>

                                {/* Developers skeleton */}
                                <div className="h-2.5 w-1/2 bg-gray-600/40 dark:bg-gray-500/40 rounded-md animate-pulse"></div>
                            </div>
                        </li>
                    ))

                    : gamesPopulerTerurut.map((game, index) => (
                        <motion.li
                            key={game.id}
                            className="group relative rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] p-1.5 hover:shadow-sm hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background transition-all duration-300"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.08,
                                ease: [0.4, 0.0, 0.2, 1]
                            }}
                        >

                            <div className="relative">

                                <Link
                                    href={`/order/${game.slug}`}
                                    onClick={(e) => handleClick(game.slug, e)}
                                    className="block"
                                >
                                    <div className="relative h-24 sm:h-28 rounded-xl overflow-hidden outline outline-2 outline-primary outline-offset-2">
                                        {game.image ? (
                                            <Image
                                                src={game.image}
                                                alt={game.title}
                                                fill
                                                priority
                                                sizes="100vw"
                                                className="absolute inset-0 object-cover transition duration-300"
                                            />
                                        ) : (
                                            <ImagePlaceholder className="absolute inset-0 rounded-xl" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                                    </div>
                                    <div className="px-1 pt-3 pb-1 text-left">
                                        <h2 className="text-sm font-semibold text-my-color1 truncate">
                                            {game.title}
                                        </h2>
                                        <p className="text-[11px] text-foreground truncate">
                                            {game.developers}
                                        </p>
                                    </div>
                                </Link>
                                {isSnowEffect && (
                                    <WaveSnow
                                        className="absolute -left-[2px] -top-[8px] w-full h-6 sm:h-8"

                                    />
                                )}
                            </div>
                        </motion.li>
                    ))}
            </ul>
        </div>
    );
}
