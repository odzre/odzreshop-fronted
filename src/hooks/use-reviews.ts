"use client";

import useSWR from "swr";

export default function useReviews(product_name?: string) {
    const fetcher = (url: string) => fetch(url).then((r) => r.json());

    const { data, error, isLoading } = useSWR(
        product_name
            ? `/api/reviews?product_name=${encodeURIComponent(product_name)}`
            : null,
        fetcher
    );

    const allReviews = data?.data ?? [];

    // 🔹 hanya ambil yang sama
    const filtered = product_name
        ? allReviews.filter(
            (r: any) =>
                r.product_name?.trim().toLowerCase() ===
                product_name.trim().toLowerCase()
        )
        : allReviews;

    const totalReviews = filtered.length;
    const averageRating =
        totalReviews > 0
            ? filtered.reduce((sum: number, r: any) => sum + r.rating, 0) /
            totalReviews
            : 0;

    return {
        reviews: filtered,
        totalReviews,
        averageRating,
        isLoading,
        error
    };
}
