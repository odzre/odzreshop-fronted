"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function useLatestReviews(product_name?: string, limit = 5) {
    const { data, error, isLoading } = useSWR(
        product_name
            ? `/api/reviews/latest?product_name=${encodeURIComponent(product_name)}&limit=${limit}`
            : null,
        fetcher
    );

    return {
        reviews: data?.data ?? [],
        isLoading,
        error
    };
}
