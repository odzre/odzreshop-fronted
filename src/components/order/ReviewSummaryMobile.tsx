"use client";

import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface Review {
    id: number;
    whatsapp: string;
    product: string;
    comment: string;
    rating: number;
    created_at: string;
}

interface RatingItem {
    rating: number;
    total: number;
}
interface Props {
    averageRating?: number;
    totalReviews?: number;
    ratings?: RatingItem[];
    reviews?: Review[];

}



export default function ReviewSummaryMobile({
    averageRating,
    totalReviews,
    ratings = [],   // ✅ default aman
    reviews = []
}: Props) {
    const { t } = useTranslation();


    if (averageRating == null || totalReviews == null) return null;

    const displayRating = Number(averageRating.toFixed(2));

    const formatDateTime = (datetime: string) => {
        const d = new Date(datetime);
        return (
            d
                .toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                })
                .replace(/\//g, "-") +
            " " +
            d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            })
        );
    };

    const getStars = (rating: number) =>
        [...Array(5)].map((_, idx) => (
            <Star
                key={idx}
                size={14}
                className={
                    idx < rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                }
            />
        ));

    // map rating -> total
    const ratingMap = ratings.reduce<Record<number, number>>((acc, r) => {
        acc[r.rating] = r.total;
        return acc;
    }, {});

    const starLevels = [5, 4, 3, 2, 1];

    return (
        <section
            id="Ulasan"
            className="block lg:hidden relative scroll-mt-20 rounded-xl bg-card/50 shadow-2xl md:scroll-mt-[7.5rem] mt-4"
        >
            <div className="flex items-center overflow-hidden rounded-t-xl bg-card">
                <div className="flex h-10 w-10 items-center justify-center bg-primary font-semibold text-primary-foreground">
                    <Star className="h-4 w-4" />
                </div>
                <h2 className="px-4 py-2 text-sm font-semibold">
                    {t("order.Ulasan")}
                </h2>
            </div>

            <div className="p-4">
                <div className="mb-6 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <Star className="h-10 w-10 text-yellow-400" fill="currentColor" />
                        <div>
                            <span className="text-5xl font-semibold">
                                {displayRating.toFixed(2)}
                            </span>
                            <sub className="text-lg font-semibold">/ 5.0</sub>
                        </div>
                    </div>
                    <p className="pt-2 text-center text-sm">
                        {t("order.Berdasarkan")}{" "}
                        <span className="font-semibold">
                            {Intl.NumberFormat("id-ID").format(totalReviews)}
                        </span>{" "}
                        {t("order.ulasan pelanggan")}
                    </p>
                </div>

                <dl className="space-y-3">
                    {starLevels.map((star) => {
                        const count = ratingMap[star] || 0;
                        const percentage =
                            totalReviews > 0
                                ? Math.round((count / totalReviews) * 100)
                                : 0;

                        return (
                            <div key={star} className="flex items-center text-sm">
                                <dt className="flex flex-1 items-center">
                                    <span className="w-3 font-medium">{star}</span>
                                    <Star className="ml-1 h-5 w-5 text-yellow-400 fill-yellow-400" />
                                    <div className="relative ml-3 flex-1">
                                        <div className="h-3 rounded border bg-gray-100" />
                                        <div
                                            className="absolute inset-y-0 rounded bg-yellow-400"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </dt>
                                <dd className="ml-3 w-14 text-right">
                                    {Intl.NumberFormat("id-ID").format(count)}
                                </dd>
                            </div>
                        );
                    })}
                </dl>

                <div className="mt-6 flex flex-col gap-y-4 divide-y divide-card-foreground/25 border-t border-card-foreground/25">
                    {reviews.slice(0, 4).map((r) => (
                        <div key={r.id} className="pt-4 text-xxs">
                            <div className="flex justify-between">
                                <strong>{r.whatsapp}</strong>
                                <div className="flex">{getStars(r.rating)}</div>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span>{r.product}</span>
                                <span>{formatDateTime(r.created_at)}</span>
                            </div>
                            <p className="mt-1 italic">“{r.comment}”</p>
                        </div>
                    ))}

                    {reviews.length === 0 && (
                        <p className="py-3 text-center text-xs text-muted-foreground">
                            {t("order.Belum ada ulasan")}
                        </p>
                    )}
                </div>

                {reviews.length > 0 && (
                    <div className="flex justify-end pt-4">
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="px-6 py-2 text-sm font-medium rounded-lg bg-transparent hover:bg-accent/75 hover:text-accent-foreground ring-1 ring-slate-900/5 shadow transition-all duration-300"
                        >
                            <Link href="/reviews" className="flex items-center gap-2">
                                {t("order.Lihat semua ulasan")}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
