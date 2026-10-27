"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "@/components/ui/Image";
import { WaveSnow } from "@/components/ui/WaveSnow";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

interface Props {
    games: any[];
    visibleCount: number;
    isSnowEffect: boolean;
    defaultCharacter?: string;
    handleClick: (slug: string, e: React.MouseEvent) => void;
    loadMoreGames: () => void;
    t: (key: string) => string;
}

export default function StyleOne({
    games,
    visibleCount,
    isSnowEffect,
    defaultCharacter,
    handleClick,
    loadMoreGames,
    t,
}: Props) {

    // Ensure games are sorted by `sort` (ascending, 0 placed at end) before rendering
    const sortedGames = useMemo(() => {
        return [...games].sort((a: any, b: any) => {
            const sortA = Number(a.sort ?? 0);
            const sortB = Number(b.sort ?? 0);
            if (sortA === 0 && sortB !== 0) return 1;
            if (sortA !== 0 && sortB === 0) return -1;
            if (sortA !== sortB) return sortA - sortB;
            return (a.title || '').localeCompare(b.title || '');
        });
    }, [games]);

    return (
        <>
            <motion.ul
                className="mb-4 grid grid-cols-3 gap-4 sm:mb-8 sm:grid-cols-4 sm:gap-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
            >

                {sortedGames.slice(0, visibleCount).map((game, index) => (
                    <motion.li
                        key={game.id}
                        className="group relative"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            delay: index * 0.05,
                            ease: [0.4, 0.0, 0.2, 1]
                        }}
                        layout
                    >

                        <Link
                            href={`/order/${game.slug}`}
                            onClick={(e) => handleClick(game.slug, e)}
                            className="relative block focus:outline-none"
                        >

                            <div
                                className="card relative flex justify-center items-end mx-auto px-3 sm:px-4 w-full aspect-[4/6]"
                                style={{ perspective: "2500px" }}
                            >

                                <div className="wrapper absolute w-full z-[-1] transition-all duration-500">

                                    {game.image ? (
                                        <Image
                                            src={game.image}
                                            alt={game.title}
                                            width={192}
                                            height={288}
                                            className="aspect-[4/6] object-cover object-center w-full rounded-sm transition-all duration-300"
                                            priority
                                        />
                                    ) : (
                                        <ImagePlaceholder className="aspect-[4/6] w-full rounded-sm" />
                                    )}

                                    {isSnowEffect && (
                                        <WaveSnow className="absolute -left-[2px] -top-[10px] w-full h-6 sm:h-8" />
                                    )}

                                </div>

                                {game.logo && (
                                    <div className="title w-full h-26 md:h-26 transition-transform duration-500 flex items-center justify-center pb-2">
                                        <Image
                                            src={game.logo}
                                            alt={game.title}
                                            width={257}
                                            height={76}
                                            className="object-contain w-full"
                                            priority
                                        />
                                    </div>
                                )}

                                {(game.character || defaultCharacter) && (
                                    <Image
                                        src={(game.character || defaultCharacter)!}
                                        alt={game.title}
                                        width={146}
                                        height={219}
                                        className="character object-contain w-full absolute z-[-1] opacity-0 transition-all duration-500"
                                        priority
                                    />
                                )}

                            </div>
                        </Link>
                    </motion.li>
                ))}
            </motion.ul>

            {sortedGames.length > visibleCount && (
                <div className="flex justify-center mt-4">
                    <motion.button
                        onClick={loadMoreGames}
                        className="px-6 py-2 text-sm font-medium rounded-lg bg-transparent hover:bg-accent/75 hover:text-accent-foreground ring-1 ring-slate-900/5 shadow transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {t("Tampilkan Lainnya")}
                    </motion.button>
                </div>
            )}
        </>
    )
}