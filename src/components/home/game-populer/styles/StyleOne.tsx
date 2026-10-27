"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "@/components/ui/Image";
import { Card, CardContent } from "@/components/ui/card";
import { WaveSnow } from "@/components/ui/WaveSnow";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

interface Props {
    games: any[];
    isLoading: boolean;
    isSnowEffect: boolean;
    handleClick: (slug: string, e: React.MouseEvent) => void;
}

export default function StyleOne({
    games,
    isLoading,
    isSnowEffect,
    handleClick,
}: Props) {
    return (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <li
                        key={i}
                        className="h-[88px] sm:h-[104px] rounded-xl bg-muted animate-pulse"
                    />
                ))
                : games.map((game, index) => (
                    <motion.li
                        key={game.id}
                        className="transition-all"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                    >
                        <div className="relative">
                            <Card className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 ease-in-out">
                                <Link
                                    href={`/order/${game.slug}`}
                                    onClick={(e) =>
                                        handleClick(game.slug, e)
                                    }
                                    className="relative block focus:outline-none"
                                >
                                    <div className="relative h-[4.5rem] sm:h-24 overflow-hidden">
                                        {game.image ? (
                                            <Image
                                                alt={game.title}
                                                src={game.image}
                                                fill
                                                className="object-cover object-top grayscale transition duration-500 ease-in-out group-hover:grayscale-0 group-hover:scale-105 md:object-[100%_20%]"
                                                style={{ inset: 0 }}
                                                priority
                                            />
                                        ) : (
                                            <ImagePlaceholder className="absolute inset-0" />
                                        )}

                                        {game.logo && (
                                            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-12 sm:w-16">
                                                <Image
                                                    alt={`${game.title} Logo`}
                                                    src={game.logo}
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
                                            {game.title}
                                        </h2>
                                        <p className="text-xxs sm:text-xs opacity-80 truncate">
                                            {game.developers}
                                        </p>
                                    </CardContent>
                                </Link>
                            </Card>

                            {isSnowEffect && (
                                <WaveSnow className="absolute -left-[2px] -top-[8px] w-full h-6 sm:h-8" />
                            )}
                        </div>
                    </motion.li>
                ))}
        </ul>
    );
}