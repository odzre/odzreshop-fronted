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
  handleClick: (slug: string, e: React.MouseEvent) => void;
  loadMoreGames: () => void;
  t: (key: string) => string;
}

export default function StyleThree({
  games,
  visibleCount,
  isSnowEffect,
  handleClick,
  loadMoreGames,
  t
}: Props) {

  // Ensure games are sorted by `sort` (ascending, 0 placed at end)
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
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
      >

        {sortedGames.slice(0, visibleCount).map((game, index) => (
          <motion.li
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.04,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >

            <Link
              href={`/order/${game.slug}`}
              onClick={(e) => handleClick(game.slug, e)}
              className="block focus:outline-none"
            >

              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateZ: 3,
                  y: -6
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18
                }}
                className="relative overflow-hidden rounded-xl bg-muted
                               hover:shadow-2xl
                               hover:ring-2 hover:ring-primary
                               hover:ring-offset-2 hover:ring-offset-background"
              >

                {game.image ? (
                  <Image
                    src={game.image}
                    alt={game.title}
                    width={300}
                    height={300}
                    className="aspect-square w-full object-cover object-center rounded-t-xl"
                    priority
                  />
                ) : (
                  <ImagePlaceholder className="aspect-square w-full rounded-t-xl" />
                )}

                {isSnowEffect && (
                  <WaveSnow className="absolute -top-2 left-0 w-full h-6" />
                )}

                <div className="rounded-b-xl bg-muted py-2">
                  <div className="flex flex-col px-3 py-1">
                    <h2 className="truncate text-sm font-semibold sm:text-base">
                      {game.title}
                    </h2>
                    <p className="truncate text-xs opacity-70">
                      {game.developers}
                    </p>
                  </div>
                </div>

              </motion.div>
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
  );
}