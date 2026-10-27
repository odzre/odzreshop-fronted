"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentLayout } from "@/components/panel/content-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function KalkulatorWinRatePage() {
  const { t } = useTranslation();
  const [totalMatch, setTotalMatch] = useState<string>("");
  const [currentWR, setCurrentWR] = useState<string>("");
  const [targetWR, setTargetWR] = useState<string>("");

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    setError(null);
    setResult(null);

    const total = parseFloat(totalMatch);
    const wr = parseFloat(currentWR);
    const target = parseFloat(targetWR);

    if (isNaN(total) || isNaN(wr) || isNaN(target)) {
      setError(t("winrate.error.invalid"));
      return;
    }

    if (target >= 100) {
      setError(t("winrate.error.max"));
      setResult(t("winrate.error.joke"));
      return;
    }

    const neededWins = calculateWins(total, wr, target);
    setResult(t("winrate.result", { wins: neededWins, target: target }));
  };

  const calculateWins = (total: number, wr: number, target: number): number => {
    const totalWins = total * (wr / 100);
    const totalLoses = total - totalWins;
    const remainingWR = 100 - target;
    const winRatio = 100 / remainingWR;
    const targetTotalMatches = totalLoses * winRatio;
    const requiredWins = targetTotalMatches - total;
    return Math.round(requiredWins);
  };

  return (
    <ContentLayout title={t("winrate.title")}>
      <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-my-color mb-2">
          {t("winrate.title")}
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {t("winrate.subtitle")}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              {t("winrate.total_label")}
            </label>
            <Input
              type="number"
              placeholder={t("winrate.total_placeholder")}
              value={totalMatch}
              onChange={(e) => setTotalMatch(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              {t("winrate.current_label")}
            </label>
            <Input
              type="number"
              placeholder={t("winrate.current_placeholder")}
              value={currentWR}
              onChange={(e) => setCurrentWR(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              {t("winrate.target_label")}
            </label>
            <Input
              type="number"
              placeholder={t("winrate.target_placeholder")}
              value={targetWR}
              onChange={(e) => setTargetWR(e.target.value)}
            />
          </div>

          <Button onClick={calculate} variant="default" className="w-full">
            {t("winrate.button")}
          </Button>

          {error && (
            <div className="text-sm text-red-600 bg-red-100 border border-red-300 p-3 rounded text-center">
              {error}
            </div>
          )}

          {result && !error && (
            <div className="text-sm bg-orange-100 text-orange-800 font-semibold p-3 rounded text-center ring-2 ring-orange-400">
              {result}
            </div>
          )}
        </div>
      </main>
    </ContentLayout>
  );
}
