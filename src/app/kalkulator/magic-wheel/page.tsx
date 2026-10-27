"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function KalkulatorMagicWheelPage() {
  const { t } = useTranslation();
  const [magicPoint, setMagicPoint] = useState(100);

  const diamondNeeded = useMemo(() => {
    const spinLeft = 200 - magicPoint;

    return spinLeft < 196
      ? Math.ceil(spinLeft / 5) * 270
      : spinLeft * 60;
  }, [magicPoint]);

  return (
    <ContentLayout title={t("magicwheel.title_full")}>
      <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-my-color mb-2">
          {t("magicwheel.title")}
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {t("magicwheel.subtitle")}
        </p>

        <div className="space-y-4">
          <label className="text-sm font-medium block mb-2">
            {t("magicwheel.slider_label")}
          </label>

          <input
            type="range"
            min={0}
            max={199}
            value={magicPoint}
            onChange={(e) => setMagicPoint(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-orange-500"
          />

          <div className="flex items-center justify-between pt-4 text-sm font-semibold">
            <div>
              {t("magicwheel.current_point")}:{" "}
              <span className="text-orange-600">{magicPoint}</span>
            </div>
            <div>
              {t("magicwheel.needed_diamond")}:{" "}
              <span className="text-orange-600">{diamondNeeded}</span> Diamond
            </div>
          </div>

          <Button asChild variant="default" className="w-full">
            <Link href="/">{t("magicwheel.cta")}</Link>
          </Button>
        </div>
      </main>
    </ContentLayout>
  );
}
