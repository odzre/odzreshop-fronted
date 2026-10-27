"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder"; // ✅ tambah ini

type ToastItem = {
    order_id: string;
    whatsapp: string;
    product: string;
    game: string;
    image?: string | null;
    time_ago: string;
};

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed fetch social proof");
    return res.json();
};

export default function SocialProfEngine() {
    /*
    |--------------------------------------------------------------------------
    | FETCH API
    |--------------------------------------------------------------------------
    */

    const { data } = useSWR("/api/social-proof", fetcher, {
        refreshInterval: 60000,
        revalidateOnFocus: false,
        dedupingInterval: 30000,
    });

    const enabled = data?.social_proof?.enabled ?? false;

    const delayMs = useMemo(() => {
        const base = data?.social_proof?.delay ?? 6;
        return (base + Math.random() * 3) * 1000;
    }, [data]);

    const apiToasts: ToastItem[] = useMemo(() => {
        return data?.toast ?? [];
    }, [data]);

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [queue, setQueue] = useState<ToastItem[]>([]);
    const isPlaying = useRef(false);
    const isStopped = useRef(false);

    /*
    |--------------------------------------------------------------------------
    | STOP EVENT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const stopToast = () => {
            isStopped.current = true;
            toast.dismiss();
            setQueue([]);
            isPlaying.current = false;
        };

        window.addEventListener("product-selected", stopToast);
        return () => window.removeEventListener("product-selected", stopToast);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SESSION ANTI DUPLICATE
    |--------------------------------------------------------------------------
    */

    const shownIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        const saved = sessionStorage.getItem("social_proof_seen");
        if (saved) {
            shownIds.current = new Set(JSON.parse(saved));
        }
    }, []);

    const saveShownIds = () => {
        sessionStorage.setItem(
            "social_proof_seen",
            JSON.stringify([...shownIds.current])
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PUSH QUEUE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!enabled) return;
        if (isStopped.current) return;
        if (!apiToasts.length) return;

        const newItems = apiToasts.filter((t) => {
            if (shownIds.current.has(t.order_id)) return false;
            shownIds.current.add(t.order_id);
            return true;
        });

        if (!newItems.length) return;

        saveShownIds();

        setQueue((prev) => [...prev, ...newItems].slice(-20));
    }, [apiToasts, enabled]);

    /*
    |--------------------------------------------------------------------------
    | TOAST ENGINE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!enabled) return;
        if (isStopped.current) return;
        if (isPlaying.current) return;
        if (!queue.length) return;

        const next = queue[0];
        isPlaying.current = true;

        toast.custom(
            () => {
                // ✅ LOCAL STATE khusus image (aman karena isolated per render toast)
                const ToastImage = () => {
                    const [loaded, setLoaded] = useState(false);

                    return (
                        <div className="relative w-14 h-14 overflow-hidden rounded-md shrink-0">

                            {!loaded && (
                                <ImagePlaceholder className="absolute inset-0" />
                            )}

                            {next.image && (
                                <Image
                                    src={next.image}
                                    alt={next.game}
                                    fill
                                    sizes="56px"
                                    onLoadingComplete={() => setLoaded(true)}
                                    className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"
                                        }`}
                                />
                            )}
                        </div>
                    );
                };

                return (
                    <div className="relative flex w-fit max-w-[300px] gap-3 pointer-events-auto">

                        {/* IMAGE */}
                        <ToastImage />

                        {/* TEXT */}
                        <div className="flex flex-col justify-between min-w-0">

                            <p className="text-xs text-neutral-300 truncate">
                                {next.whatsapp} • {next.time_ago}
                            </p>

                            <p className="text-xs font-semibold text-amber-400 break-words line-clamp-2">
                                {next.product}
                            </p>

                            <p className="text-xs text-neutral-400 break-words">
                                {next.game}
                            </p>

                            <div className="flex items-center mt-1 whitespace-nowrap">
                                <Image
                                    src="/verified.png"
                                    alt="verified"
                                    width={12}
                                    height={12}
                                    className="mr-1"
                                />
                                <span className="text-[8px] sm:text-[11px] text-green-400">
                                    Verified by {data?.general?.title}
                                </span>
                            </div>

                        </div>
                    </div>
                );
            },
            {
                id: next.order_id,
                duration: delayMs,
                toasterId: "social-prof",
            }
        );

        const timer = setTimeout(() => {
            isPlaying.current = false;
            setQueue((prev) => prev.slice(1));
        }, delayMs);

        return () => clearTimeout(timer);
    }, [queue, enabled, delayMs]);

    return null;
}