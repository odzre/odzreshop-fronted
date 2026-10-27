"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "@/components/ui/Image";
import { WaveSnow } from "@/components/ui/WaveSnow";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useImageColor } from "@/hooks/useImageColor";
import { useState } from "react";

interface Props {
    games: any[];
    isLoading: boolean;
    isSnowEffect: boolean;
    handleClick: (slug: string, e: React.MouseEvent) => void;
}

export default function StyleThree({
    games,
    isLoading,
    isSnowEffect,
    handleClick,
}: Props) {
    return (
        <motion.ul
            className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4"
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
            }}
        >
            {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <li
                        key={i}
                        className="h-[88px] sm:h-[104px] rounded-xl bg-muted animate-pulse"
                    />
                ))
                : games.map((game) => (
                    <Item
                        key={game.id}
                        game={game}
                        handleClick={handleClick}
                        isSnowEffect={isSnowEffect}
                    />
                ))}
        </motion.ul>
    );
}

function Item({ game, handleClick, isSnowEffect }: any) {
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
                className="relative group flex items-center gap-3 rounded-xl bg-[image:var(--image-popular)] bg-cover bg-center p-2.5 sm:p-3 transition-all duration-300 hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background focus-visible:outline-none"
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
                        onLoadingComplete={(img) => setImgEl(img)}
                        className="aspect-square h-14 w-14 sm:h-20 sm:w-20 rounded-lg object-cover ring-1 ring-background transition-transform duration-300 group-hover:scale-105"
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