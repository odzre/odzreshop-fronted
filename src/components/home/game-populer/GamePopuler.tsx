"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "@/components/ui/Image";

import StyleOne from "./styles/StyleOne";
import StyleTwo from "./styles/StyleTwo";
import StyleThree from "./styles/StyleThree";

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

interface GamePopulerProps {
    isLoading: boolean;
    popularGames?: Game[];
    settings?: Record<string, any>;
    uiEffect: number;
}

export function GamePopuler({
    isLoading,
    popularGames,
    settings,
    uiEffect,
}: GamePopulerProps) {
    const { i18n } = useTranslation();
    const router = useRouter();

    const lang = i18n.language || "id";
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
    const isSnowEffect = uiEffect === 1;

    // ================= SORT GAME =================
    const games = useMemo(() => {
        return (
            popularGames
                ?.filter((game) => game.status === 1)
                .sort((a, b) => {
                    const sortA = Number(a.sort);
                    const sortB = Number(b.sort);
                    if (sortA === 0 && sortB !== 0) return 1;
                    if (sortA !== 0 && sortB === 0) return -1;
                    if (sortA !== sortB) return sortA - sortB;
                    return (a.title || '').localeCompare(b.title || '');
                }) || []
        );
    }, [popularGames]);

    // ================= HANDLE CLICK =================
    const handleClick = (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        router.push(`/order/${slug}`);
    };

    // ================= IMAGE POPULAR =================
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

    // ================= HEADER (REUSABLE) =================
    const Header = ({
        variant = "default",
    }: {
        variant?: "default" | "style2" | "style3";
    }) => {
        return (
            <div
                className={`mb-5 ${variant !== "default" ? "mt-5" : ""
                    } text-foreground`}
            >
                <div
                    className={`flex items-center ${variant === "style3" ? "gap-2" : "gap-1"
                        } mb-2`}
                >
                    {popularIcon && (
                        <Image
                            src={popularIcon}
                            alt="Popular"
                            width={28}
                            height={28}
                            className="w-7 h-7"
                        />
                    )}

                    <h3
                        className={`text-lg font-semibold uppercase leading-relaxed tracking-wider ${variant !== "default" ? "text-my-color1" : ""
                            }`}
                    >
                        {title}
                    </h3>
                </div>

                <p
                    className={`text-xs ${variant === "style3" ? "pl-9" : "pl-6"
                        } ${variant !== "default" ? "text-muted-foreground" : ""
                        }`}
                >
                    {subtitle}
                </p>
            </div>
        );
    };

    // ================= STYLE 1 =================
    if (style === "0") {
        return (
            <div>
                <Header variant="default" />

                <StyleOne
                    games={games}
                    isLoading={isLoading}
                    isSnowEffect={isSnowEffect}
                    handleClick={handleClick}
                />
            </div>
        );
    }

    // ================= STYLE 2 =================
    if (style === "1") {
        return (
            <div>
                <Header variant="style2" />

                <StyleTwo
                    games={games}
                    isLoading={isLoading}
                    isSnowEffect={isSnowEffect}
                    handleClick={handleClick}
                />
            </div>
        );
    }

    // ================= STYLE 3 =================
    return (
        <div>
            <Header variant="style3" />

            <StyleThree
                games={games}
                isLoading={isLoading}
                isSnowEffect={isSnowEffect}
                handleClick={handleClick}
            />
        </div>
    );
}