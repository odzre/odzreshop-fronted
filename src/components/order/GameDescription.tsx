"use client";

import { Skeleton } from "@/components/ui/skeleton";
import parse from "html-react-parser";
import { useTranslation } from "react-i18next";

interface GameDescriptionProps {
    description?: string;
}

export default function GameDescription({ description }: GameDescriptionProps) {
    const isLoading = description === undefined;
    const { t } = useTranslation();

    return (
        <section
            className="relative scroll-mt-20 rounded-xl bg-card/50 shadow-sm md:scroll-mt-[7.5rem]"
            id="description"
        >
            {/* HEADER */}
            <div className="flex items-center overflow-hidden rounded-t-xl bg-card">
                <div className="flex h-10 w-10 items-center justify-center bg-primary">

                </div>

                <h2 className="px-4 py-2 text-sm/6 font-semibold text-card-foreground">
                    {t("order.Deskripsi")}
                </h2>
            </div>

            {/* CONTENT */}
            <div className="p-4 text-sm">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ) : description ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                        {parse(description)}
                    </div>
                ) : (
                    <div className="italic text-muted-foreground">
                        Tidak ada deskripsi.
                    </div>
                )}
            </div>
        </section>
    );
}
