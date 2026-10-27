"use client";

import useSWR from "swr";
import { useSession, signOut } from "next-auth/react";

const fetcher = async (
    url: string,
    token: string,
    deviceId: string
) => {
    const res = await fetch(url, {
        credentials: "include", // 🔥 penting
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Device-Id": deviceId,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    // 🔥 handle 401 dengan aman
    if (res.status === 401) {
        console.warn("⚠️ Unauthorized (token/device mismatch)");

        // delay sedikit biar bukan false positive
        await new Promise((r) => setTimeout(r, 200));

        await signOut({
            callbackUrl: "/signin?expired=1",
        });

        throw new Error("Session expired");
    }

    if (!res.ok) {
        throw new Error("Gagal ambil data user");
    }

    const data = await res.json();
    return data.user || data;
};

export function useUser() {
    const { data: session, status } = useSession();
    const token = session?.user?.token;

    const deviceId =
        typeof window !== "undefined"
            ? localStorage.getItem("device_id")
            : null;

    // 🔥 FIX: jangan fetch kalau device_id belum ada
    const shouldFetch = status === "authenticated" && token && deviceId;

    const { data, mutate, error, isLoading } = useSWR(
        shouldFetch ? ["/api/auth/user", token, deviceId] : null,
        ([url, token, deviceId]: [string, string, string]) =>
            fetcher(url, token, deviceId),
        {
            refreshInterval: 15000,
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    return {
        user: data,
        loading: isLoading || status === "loading",
        error,
        refreshUser: mutate,
    };
}