"use client";

import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
    averageRating?: number;
    totalReviews?: number;

}


export default function ReviewSummaryDesktop({
    averageRating,
    totalReviews
}: Props) {
    const { t } = useTranslation();


    if (averageRating == null || totalReviews == null) return null;

    const displayRating = Number(averageRating.toFixed(2));


    return (
        <div className="hidden lg:flex flex-col items-start justify-center gap-2 rounded-xl bg-my-color2/40 p-4 text-card-foreground shadow-2xl">
            <div className="text-sm font-semibold tracking-wide">
                {t("order.Ulasan dan Rating")}
            </div>

            <div className="flex items-baseline gap-4">
                <div className="text-[40px] font-bold leading-none xl:text-[50px]">
                    {averageRating.toFixed(2)}
                </div>

                <div className="flex flex-col">
                    <div className="flex">
                        {[...Array(5)].map((_, idx) => (
                            <Star
                                key={idx}
                                className={`size-10 xl:size-11 ${idx < Math.floor(displayRating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted-foreground/30"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="ml-1.5 mt-1 text-sm font-semibold">
                        {t("order.Berdasarkan total")}{" "}
                        {Intl.NumberFormat("id-ID").format(totalReviews)} rating
                    </div>
                </div>
            </div>
        </div>
    );
}
