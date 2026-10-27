"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function PromoPopup() {
  const { t } = useTranslation();

  const [shouldFetch, setShouldFetch] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // cek localStorage dulu sebelum fetch
  useEffect(() => {
    const dismissedUntil = localStorage.getItem("promo_dismissed_until");
    const now = new Date();

    if (dismissedUntil && new Date(dismissedUntil) > now) return;

    setShouldFetch(true);
  }, []);

  const { data } = useSWR(
    shouldFetch ? "/api/popup-promo" : null,
    fetcher
  );

  // cek promo aktif
  useEffect(() => {
    if (!data?.promo) return;

    const now = new Date();

    if (!data.promo.is_active) return;

    const start = new Date(data.promo.start_at);
    const end = new Date(data.promo.end_at);

    if (now >= start && now <= end) {
      const timer = setTimeout(() => setShowPopup(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // auto close
  useEffect(() => {
    if (!showPopup) return;

    const timer = setTimeout(() => setShowPopup(false), 30000);
    return () => clearTimeout(timer);
  }, [showPopup]);

  const handleClose = () => {
    if (dontShowAgain) {
      const next24Hours = new Date();
      next24Hours.setHours(next24Hours.getHours() + 24);

      localStorage.setItem(
        "promo_dismissed_until",
        next24Hours.toISOString()
      );
    }

    setShowPopup(false);
  };

  if (!data?.promo) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <Transition appear show={showPopup} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleClose}>
            {/* Overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/80" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">

                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200"
                  enterFrom="opacity-0 translate-y-4 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:scale-95"
                >

                  <Dialog.Panel className="relative w-full sm:max-w-2xl overflow-hidden rounded-lg bg-secondary text-left shadow-xl">

                    {/* Close */}
                    <div className="absolute right-2 top-2 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50"
                        onClick={handleClose}
                      >
                        <X className="h-4 w-4 text-white" />
                        <span className="sr-only">{t("Tutup")}</span>
                      </Button>
                    </div>

                    {/* Motion container */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: {
                          when: "beforeChildren",
                          staggerChildren: 0.1,
                        },
                      }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      className="relative"
                    >

                      {/* IMAGE */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >

                        {data.promo.link ? (
                          <a
                            href={data.promo.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleClose}
                            className="block"
                          >
                            <Image
                              src={data.promo.image_url}
                              alt={data.promo.title}
                              width={360}
                              height={360}
                              loading="lazy"
                              sizes="(max-width:768px) 100vw, 360px"
                              className="w-full object-cover hover:opacity-95 transition-opacity"
                            />
                          </a>
                        ) : (
                          <Image
                            src={data.promo.image_url}
                            alt={data.promo.title}
                            width={360}
                            height={360}
                            loading="lazy"
                            sizes="(max-width:768px) 100vw, 360px"
                            className="w-full object-cover"
                          />
                        )}

                      </motion.div>

                      {/* CONTENT */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6"
                      >

                        <Dialog.Title className="text-xs text-center font-semibold mb-2">
                          {data.promo.title}
                        </Dialog.Title>

                        {data.promo.description && (
                          <div
                            className="prose prose-sm max-w-none text-xs text-foreground pt-4 prose-a:text-primary prose-a:font-semibold prose-a:underline prose-a:decoration-primary hover:prose-a:opacity-80"
                            dangerouslySetInnerHTML={{
                              __html: data.promo.description,
                            }}
                          />
                        )}

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center space-x-2 pt-4 mt-4"
                        >

                          <motion.div whileTap={{ scale: 0.95 }}>
                            <input
                              type="checkbox"
                              id="dontShowAgain"
                              checked={dontShowAgain}
                              onChange={() =>
                                setDontShowAgain(!dontShowAgain)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </motion.div>

                          <label htmlFor="dontShowAgain" className="text-xs">
                            {t("Jangan tampilkan lagi")}
                          </label>

                        </motion.div>

                      </motion.div>

                    </motion.div>

                  </Dialog.Panel>

                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </AnimatePresence>
  );
}