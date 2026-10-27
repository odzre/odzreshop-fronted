"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  backgroundImage?: string;
  height?: string;
}

export default function PageHeader({
  title,
  description,
  backgroundImage = "/bannergame.webp",
  height = "320px"
}: PageHeaderProps) {
  return (
    <div className="w-full mx-auto mb-10">
      {/* Full-width banner */}
      <div className="-mx-[calc(50vw-50%)] -my-8">
        <div
          className="relative overflow-hidden bg-gray-900 flex items-center justify-center text-center"
          style={{ height }}
        >
          {/* Background */}
          <Image
            src={backgroundImage}
            alt={title}
            fill
            priority
            className="object-cover brightness-75 animate-[kenburns_20s_ease-in-out_infinite]"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-gray-950/40" />

          {/* Text */}
          <div className="relative z-10 px-4 md:px-8 max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-400 to-gray-200 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-4 text-sm md:text-base text-gray-300"
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* Ken Burns Animation */}
          <style jsx global>{`
            @keyframes kenburns {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.08);
              }
              100% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
