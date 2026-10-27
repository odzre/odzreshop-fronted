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

export default function StyleTwo({
  games,
  visibleCount,
  isSnowEffect,
  handleClick,
  loadMoreGames,
  t
}: Props) {

  // Ensure games are sorted by `sort`
  const sortedGames = useMemo(() => {
    return [...games].sort((a:any,b:any)=>{
      const sortA = Number(a.sort ?? 0);
      const sortB = Number(b.sort ?? 0);
      if (sortA===0 && sortB!==0) return 1;
      if (sortA!==0 && sortB===0) return -1;
      if (sortA!==sortB) return sortA - sortB;
      return (a.title||'').localeCompare(b.title||'');
    });
  },[games]);
  return (
    <>
      <motion.ul
        className="mb-4 grid grid-cols-3 gap-4 sm:mb-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-5 xl:grid-cols-6"
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
            className="group relative"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileTap={{ scale: 1.05 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.4, 0.0, 0.2, 1]
            }}
          >



            <Link
              href={`/order/${game.slug}`}
              onClick={(e) => handleClick(game.slug, e)}
              className="relative block focus:outline-none"
            >

              <div className="group relative transform overflow-hidden rounded-2xl bg-muted duration-300 ease-in-out hover:shadow-2xl hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background">

                {game.image ? (
                  <Image
                    src={game.image}
                    alt={game.title}
                    width={192}
                    height={288}
                    className="
                      aspect-[4/6] object-cover object-center w-full
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                    priority
                  />
                ) : (
                  <ImagePlaceholder className="aspect-[4/6] w-full" />
                )}

                {isSnowEffect && (
                  <WaveSnow
                    className="absolute -left-[2px] -top-[10px] w-full h-6 sm:h-8"
                  />
                )}

                <article className="
                  absolute inset-x-0 -bottom-10 z-10 flex flex-col px-3
                  transition-all duration-300 ease-in-out
                  group-hover:bottom-3 sm:px-4 group-hover:sm:bottom-4
                ">
                  <h2 className="truncate text-sm font-semibold text-foreground sm:text-base">
                    {game.title}
                  </h2>
                  <p className="truncate text-xs opacity-80 sm:text-sm">
                    {game.developers}
                  </p>
                </article>

                <div className="
                  absolute inset-0 bg-gradient-to-t from-transparent
                  transition-all duration-300
                  group-hover:from-background
                " />

              </div>

              {isSnowEffect && (
                <WaveSnow
                  className="absolute -left-[4px] -top-[10px] w-full h-6 z-20"
                />
              )}

            </Link>
          </motion.li>
        ))}
      </motion.ul>

      {games.length > visibleCount && (
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