"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function KalkulatorZodiacPage() {
  const { t } = useTranslation();
  const [zodiacPoint, setZodiacPoint] = useState(0);
  const [diamondNeeded, setDiamondNeeded] = useState(0);

  useEffect(() => {
    const result =
      zodiacPoint < 90
        ? Math.ceil(((2000 - zodiacPoint * 20) * 850) / 1000)
        : Math.ceil(2000 - zodiacPoint * 20);
    setDiamondNeeded(result);
  }, [zodiacPoint]);

  return (
    <ContentLayout title={t("zodiac.title_full")}>
      <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-my-color mb-2">
          {t("zodiac.title")}
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {t("zodiac.subtitle")}
        </p>

        <div className="space-y-4">
          <label className="text-sm font-medium block mb-2">
            {t("zodiac.slider_label")}
          </label>

          <input
            type="range"
            min={0}
            max={99}
            value={zodiacPoint}
            onChange={(e) => setZodiacPoint(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-orange-500"
          />

          <div className="flex items-center justify-between pt-4 text-sm font-semibold">
            <div>
              {t("zodiac.current_point")}:{" "}
              <span className="text-orange-600">{zodiacPoint}</span>
            </div>
            <div>
              {t("zodiac.needed_diamond")}:{" "}
              <span className="text-orange-600">{diamondNeeded}</span> Diamond
            </div>
          </div>

          <Button asChild variant="default" className="w-full">
            <Link href="/">{t("zodiac.cta")}</Link>
          </Button>
        </div>
      </main>
    </ContentLayout>
  );
}
