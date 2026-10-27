"use client";

import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { ContentLayout } from "@/components/panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";
import { Settings } from "@/types";
import PageHeader from "@/components/ui/PageHeader";

interface LeaderboardUser {
  user: string;
  total: number;
}

interface LeaderboardResponse {
  data: {
    harian: LeaderboardUser[];
    mingguan: LeaderboardUser[];
    bulanan: LeaderboardUser[];
  };
  generalTitle: string;
}

function LeaderboardList({
  title,
  data
}: {
  title: string;
  data: LeaderboardUser[];
}) {
  const { t } = useTranslation();

  return (
    <div>
      {/* 🔹 Header kecil di atas box */}
      <h2 className="ml-3 inline-flex rounded-t-md border border-b-0 bg-muted px-4 py-1 text-xs leading-6">
        {t("leaderboard.top10")} - {t(title)} {t("leaderboard.period")}
      </h2>

      {/* 🔹 Card leaderboard */}
      <div className="relative rounded-lg bg-muted/50 p-6 ring-1 ring-muted">
        <ul className="space-y-3 text-sm leading-6 text-foreground">
          {data.length === 0 ? (
            <li className="text-center text-muted-foreground text-sm">
              {t("leaderboard.no_data", { period: t(title.toLowerCase()) })}
            </li>
          ) : (
            data.map((user, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-x-3"
              >
                <div>
                  {index + 1}. {user.user}{" "}
                  {index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : ""}
                </div>
                <div>
                  Rp&nbsp;
                  {user.total.toLocaleString()}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { data, error, isLoading } = useSWR<LeaderboardResponse>(
    "/api/transactions/leaderboard",
    fetcher
  );
  const { data: settings } = useSWR<Settings>("/api/settings", fetcher);

  const showLeaderboard = settings?.data?.["general.show_leaderboard"] === "1";

  if (isLoading) {
    return (
      <ContentLayout title={t("leaderboard.title")}>
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </ContentLayout>
    );
  }

  if (error || !data) {
    return (
      <ContentLayout title={t("leaderboard.title")}>
        <div className="text-center text-red-500 font-semibold">
          {t("leaderboard.failed")}
        </div>
      </ContentLayout>
    );
  }

  const { harian, mingguan, bulanan } = data.data;
  const generalTitle = data.generalTitle || "NVD STORE";

  return (
    <ContentLayout title={t("leaderboard.title")}>
      {/* 🔹 Banner Header */}
      <div className="-mx-2 lg:-mx-8 mb-8">
        <PageHeader
          title={t("leaderboard.title")}
          description={`${t("leaderboard.description", {
            store: generalTitle
          })}`}
          backgroundImage="/bannergame.webp"
          height="320px"
        />
      </div>

      {showLeaderboard ? (
        <div className="container mx-auto w-full mt-24">
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:grid-cols-2 lg:mx-0 lg:max-w-none xl:grid-cols-3">
            <LeaderboardList title="Hari" data={harian} />
            <LeaderboardList title="Minggu" data={mingguan} />
            <LeaderboardList title="Bulan" data={bulanan} />
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-20">
          {t("leaderboard.disabled")}
        </div>
      )}
    </ContentLayout>
  );
}
