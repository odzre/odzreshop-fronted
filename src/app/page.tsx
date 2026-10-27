"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useSWR from "swr";

import { ContentLayout } from "@/components/panel/content-layout";
import { Slider } from "@/components/home/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { GamePopuler } from "@/components/home/game-populer";
import { GameCategories } from "@/components/home/game-category";
import { GameList } from "@/components/home/game-list";
import Promo from "@/components/home/promo";
import PromoPopup from "@/components/home/promo-popup";
import Artikel from "@/components/home/artikel";
import { HeroEffects } from "@/components/ui/hero-effects";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gagal mengambil data. Status: ${res.status}`);
    return res.json();
};

export default function HomePage() {
    const { data: dataSlider } = useSWR("/api/slider", fetcher);
    const { data: dataCategories } = useSWR("/api/category", fetcher);
    const { data: dataGames } = useSWR("/api/games", fetcher);
    const { data: dataSettings } = useSWR("/api/settings", fetcher);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const showAllButton =
        dataSettings?.data?.["general.show_category_all"] === "1";

    const categoryRef = useRef<HTMLDivElement | null>(null);

    const imageFlashsale =
        dataSettings?.data?.["general.image_flashsale"] || "";
    const imageBanner = dataSettings?.data?.["general.banner"] || "";

    const uiEffect = Number(
        dataSettings?.data?.["general.ui_effect"] ?? 0
    );

    // ✅ INIT CATEGORY (tidak diubah, hanya dirapikan)
    useEffect(() => {
        if (!dataCategories?.data?.length) return;

        setSelectedCategory(
            showAllButton ? "all" : dataCategories.data[0].id
        );
    }, [dataCategories, showAllButton]);

    // 🔍 DEBUG: Cek sort values (buka Console di browser untuk verifikasi, hapus setelah OK)
    useEffect(() => {
        if (!dataGames?.games?.length) return;
        const sample = dataGames.games.slice(0, 10).map((g: any) => ({
            title: g.title,
            sort: g.sort,
            category: g.category?.title,
            categorySort: g.category?.sort,
        }));
        console.table(sample);
    }, [dataGames]);

    // ✅ FLASHSALE BG
    useEffect(() => {
        if (!imageFlashsale) return;

        document.documentElement.style.setProperty(
            "--image-flashsale",
            `url(${imageFlashsale})`
        );
    }, [imageFlashsale]);

    // ✅ Helper: urutkan game berdasarkan sort dari backend
    const sortByOrder = (games: any[]) =>
        [...games].sort((a: any, b: any) => {
            const sortA = Number(a.sort ?? 0);
            const sortB = Number(b.sort ?? 0);
            if (sortA === 0 && sortB !== 0) return 1;
            if (sortA !== 0 && sortB === 0) return -1;
            if (sortA !== sortB) return sortA - sortB;
            return (a.title || '').localeCompare(b.title || '');
        });

    // ✅ GROUPED GAMES (kategori & game diurutkan berdasarkan sort)
    const groupedGames = useMemo<
        { category: any; games: any[] }[]
    >(() => {
        if (!dataGames?.games || !dataCategories?.data) return [];

        // Urutkan kategori berdasarkan sort (sama seperti tab nav)
        const sortedCats = sortByOrder(
            dataCategories.data.filter((category: any) => category.status !== false)
        );

        return sortedCats.map((category: any) => ({
            category,
            games: sortByOrder(
                dataGames.games.filter(
                    (game: any) => game.category.id === category.id
                )
            ),
        }));
    }, [dataGames, dataCategories]);

    // ✅ SCROLL (tidak diubah)
    const scrollCategories = useCallback((direction: "left" | "right") => {
        if (!categoryRef.current) return;

        const scrollAmount = 200;

        categoryRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    }, []);

    // ✅ FILTERED GAMES (diurutkan berdasarkan sort)
    const filteredGames = useMemo(() => {
        if (!dataGames?.games) return [];

        if (selectedCategory === "all") {
            return sortByOrder(dataGames.games);
        }

        return sortByOrder(
            dataGames.games.filter(
                (game: any) => game.category.id === selectedCategory
            )
        );
    }, [dataGames, selectedCategory]);

    // ✅ LOADING (tetap sama, tidak diubah)
    const isLoading = !dataGames;

    return (
        <ContentLayout title="Home">
            {/* Slider */}
            <div className="-mx-4">
                <div
                    className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw]
          w-screen bg-primary/50 -my-8 py-2 lg:py-4 mb-8 overflow-hidden"
                    style={{
                        backgroundImage: imageBanner
                            ? `url(${imageBanner})`
                            : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <HeroEffects effect={uiEffect} />

                    <div className="container w-full mx-auto px-4 z-10 relative">
                        {dataSlider ? (
                            <Slider slides={dataSlider.data} />
                        ) : (
                            <Skeleton className="w-full h-40 lg:h-64 rounded-lg" />
                        )}
                    </div>
                </div>
            </div>

            <div className="container w-full mx-auto space-y-6 px-0.5 lg:px-4">
                <Promo />

                {/* Game Populer */}
                <GamePopuler
                    isLoading={isLoading}
                    popularGames={dataGames?.populerGames}
                    settings={dataSettings?.data}
                    uiEffect={uiEffect}
                />

                {/* Tab Kategori */}
                <GameCategories
                    dataCategories={dataCategories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    scrollCategories={scrollCategories}
                    categoryRef={categoryRef}
                />

                {/* Game List */}
                {showAllButton && selectedCategory === "all" ? (
                    groupedGames.map(({ category, games }) =>
                        games.length > 0 ? (
                            <div key={category.id} className="space-y-4">
                                <h2 className="text-lg font-bold text-white">
                                    {category.title}
                                </h2>

                                <GameList
                                    isLoading={isLoading}
                                    filteredGames={games}
                                    uiEffect={uiEffect}
                                />
                            </div>
                        ) : null
                    )
                ) : (
                    <GameList
                        isLoading={isLoading}
                        filteredGames={filteredGames}
                        uiEffect={uiEffect}
                    />
                )}
            </div>

            <div className="container w-full mx-auto mt-16 px-0.5 lg:px-4">
                <Artikel uiEffect={uiEffect} />
            </div>

            <PromoPopup />
        </ContentLayout>
    );
}