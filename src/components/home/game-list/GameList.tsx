"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

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
    character: string;
    sort: string;
}

interface GameListProps {
    isLoading: boolean;
    filteredGames?: Game[];
    uiEffect: number;
}

export function GameList({ isLoading, filteredGames, uiEffect }: GameListProps) {

    const [visibleCount, setVisibleCount] = useState(12);
    const router = useRouter();
    const { t } = useTranslation();

    const loadMoreGames = () => setVisibleCount((prev) => prev + 6);

    const settings = useSettings() as { data?: Record<string, string> } | null;

    const style = settings?.data?.["general.game_list_style"] ?? "0";
    const defaultCharacter = settings?.data?.["general.logo"];

    const isSnowEffect = uiEffect === 1;

    const activeGames =
        filteredGames
            ?.filter((game) => game.status === 1)
            .sort((a, b) => {
                const sortA = Number(a.sort);
                const sortB = Number(b.sort);
                if (sortA === 0 && sortB !== 0) return 1;
                if (sortA !== 0 && sortB === 0) return -1;
                if (sortA !== sortB) return sortA - sortB;
                return (a.title || '').localeCompare(b.title || '');
            }) || [];

    const handleClick = async (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        await router.prefetch(`/order/${slug}`);
        setTimeout(() => {
            router.push(`/order/${slug}`);
        }, 500);
    };

    // 🔥 GLOBAL SKELETON (1 untuk semua style)
    if (isLoading) {
        return (
            <ul className="mb-4 grid grid-cols-3 gap-4 sm:mb-8 sm:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                {[...Array(visibleCount)].map((_, index) => (
                    <li key={index}>
                        <div className="relative overflow-hidden rounded-2xl bg-muted w-full aspect-[4/6]" />
                        <div className="absolute inset-x-0 bottom-0 flex flex-col px-3 pb-3 pt-1 sm:px-4">
                            <Skeleton className="h-4 w-3/4 mb-1 rounded" />
                            <Skeleton className="h-3 w-1/2 rounded" />
                        </div>


                    </li>
                ))
                }
            </ul >
        );
    }


    if (style === "0") {
        return (
            <StyleOne
                games={activeGames}
                visibleCount={visibleCount}
                isSnowEffect={isSnowEffect}
                defaultCharacter={defaultCharacter}
                handleClick={handleClick}
                loadMoreGames={loadMoreGames}
                t={t}
            />
        );
    }

    if (style === "1") {
        return (
            <StyleTwo
                games={activeGames}
                visibleCount={visibleCount}
                isSnowEffect={isSnowEffect}
                handleClick={handleClick}
                loadMoreGames={loadMoreGames}
                t={t}
            />
        );
    }

    return (
        <StyleThree
            games={activeGames}
            visibleCount={visibleCount}
            isSnowEffect={isSnowEffect}
            handleClick={handleClick}
            loadMoreGames={loadMoreGames}
            t={t}
        />
    );
}