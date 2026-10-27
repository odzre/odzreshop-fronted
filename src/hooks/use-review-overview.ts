"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function useReviewOverview(product_name?: string) {
    const { data, error, isLoading } = useSWR(
        product_name
            ? `/api/reviews/overview?product_name=${encodeURIComponent(product_name)}`
            : null,
        fetcher
    );

    return {
        averageRating: data?.data?.average ?? 0,
        totalReviews: data?.data?.total ?? 0,
        ratings: data?.data?.ratings ?? [],
        isLoading,
        error
    };
}
