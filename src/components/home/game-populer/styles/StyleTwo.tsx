"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "@/components/ui/Image";
import { WaveSnow } from "@/components/ui/WaveSnow";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

interface Props {
    games: any[];
    isLoading: boolean;
    isSnowEffect: boolean;
    handleClick: (slug: string, e: React.MouseEvent) => void;
}

export default function StyleTwo({
    games,
    isLoading,
    isSnowEffect,
    handleClick,
}: Props) {
    return (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
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
                        className="group relative rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] p-1.5 hover:shadow-sm hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background transition-all duration-300"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.08,
                            ease: [0.4, 0.0, 0.2, 1],
                        }}
                    >
                        <div className="relative">
                            <Link
                                href={`/order/${game.slug}`}
                                onClick={(e) =>
                                    handleClick(game.slug, e)
                                }
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
                                <WaveSnow className="absolute -left-[2px] -top-[8px] w-full h-6 sm:h-8" />
                            )}
                        </div>
                    </motion.li>
                ))}
        </ul>
    );
}