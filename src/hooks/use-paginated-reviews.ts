"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function usePaginatedReviews(page = 1, limit = 10) {
    const { data, error, isLoading } = useSWR(
        `/api/reviews/paginated?page=${page}&limit=${limit}`,
        fetcher
    );

    return {
        reviews: data?.data ?? [],
        pagination: data?.pagination,
        isLoading,
        error
    };
}
