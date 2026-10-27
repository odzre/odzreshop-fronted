"use client";

import { motion } from "framer-motion";
import { Transaction } from "@/types";
import LottiePlayerClient from "@/components/LottiePlayerClient";

interface InvoiceHeaderProps {
  order: Transaction | null;
  getBackgroundColor: () => string;
  getLottieAnimation: () => any;
  getPayStatusMessage: () => string;
  getBuyStatusMessage: () => string;
}

/**
 * Komponen Header untuk halaman invoice
 * Menampilkan animasi, status teks, warna latar belakang & progress bar
 */
export function InvoiceHeader({
  order,
  getBackgroundColor,
  getLottieAnimation,
  getPayStatusMessage,
  getBuyStatusMessage
}: InvoiceHeaderProps) {
  return (
    <motion.div
      initial={{
        scale: 1.1,
        height: "100vh",
        borderRadius: "0px",
        opacity: 0
      }}
      animate={{
        scale: 1,
        height: "auto",
        borderRadius: "0px",
        opacity: 1
      }}
      transition={{
        duration: 1,
        ease: "easeInOut"
      }}
      className={`flex flex-col items-center justify-center min-h-[300px] text-warning-foreground p-8 -mx-4 -my-8 md:-mx-8 overflow-hidden transition-all ${getBackgroundColor()}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center space-y-2"
      >
        {/* Animasi Lottie */}
        <div className="w-40 md:w-64 lg:w-80">
          <LottiePlayerClient loop animationData={getLottieAnimation()} play />
        </div>

        {/* Status teks */}
        <h2 className="text-2xl md:text-3xl font-semibold text-white mt-4">
          {getPayStatusMessage()}
        </h2>
        <p className="text-sm md:text-lg font-medium text-white mt-2">
          {getBuyStatusMessage()}
        </p>

        {/* Progress bar */}
      </motion.div>
    </motion.div>
  );
}
