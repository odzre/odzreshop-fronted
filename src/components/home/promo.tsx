"use client";

import { useEffect, useState } from "react";
import Image from "@/components/ui/Image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LogoInstan from "@/components/logo/instan";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useCurrency } from "@/hooks/useCurrency";

interface PromoProduct {
    id: number;
    title: string;
    brand: string;
    selling_price: number;
    selling_price_gold: number;
    selling_price_platinum: number;
    promo_price: number;
    images: string | null;
    game_logo: string | null;
    game_image?: string | null;
    game_slug: string;
    end_at: string;
    stock?: number;
    stock_usage?: number;
    show_in_home?: boolean;
}

export default function Promo() {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const role = session?.user?.role ?? "user";

    const { data } = useSWR<{ success: boolean; products: PromoProduct[] }>(
        "/api/promo",
        fetcher
    );
    const visibleProducts = data?.products?.filter(
        (item) => item.show_in_home === undefined || item.show_in_home === true
    ) ?? [];
    const { format } = useCurrency();

    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const promoEndAt = data?.products?.[0]?.end_at;

    const getRoleBasedPrice = (item: PromoProduct, role: string) => {
        switch (role) {
            case "platinum":
                return item.selling_price_platinum;
            case "gold":
                return item.selling_price_gold;
            default:
                return item.selling_price;
        }
    };

    useEffect(() => {
        if (!promoEndAt) return;

        const end = new Date(promoEndAt).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const distance = end - now;

            if (distance <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((distance / (1000 * 60)) % 60);
            const seconds = Math.floor((distance / 1000) % 60);

            setCountdown({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [promoEndAt]);

    const isPromoExpired = (endTime: string) =>
        new Date(endTime).getTime() <= Date.now();

    const isOutOfStock = (item: PromoProduct) => {
        if (item.stock === null || item.stock === undefined) return false;
        return item.stock - (item.stock_usage ?? 0) <= 0;
    };

    if (
        !data ||
        !visibleProducts.length || // 🔥 kunci utama
        (promoEndAt && isPromoExpired(promoEndAt))
    ) {
        return null;
    }

    const promoCount = visibleProducts.length;
    const duration = Math.min(80, Math.max(25, promoCount * 6));

    return (
        <div className="w-full bg-muted/90 ring-1 ring-slate-900/5 shadow-xl pb-4 rounded-2xl">

            {/* HEADER */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">

                    <Image
                        src="/voltage.gif"
                        alt="Promo"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                    />

                    <h2>{t("flash_sale", { defaultValue: "FLASH SALE" })}</h2>

                    <div className="flex gap-1 ml-auto text-sm font-mono">
                        {["days", "hours", "minutes", "seconds"].map((unit) => (
                            <span key={unit}>
                                <span className="bg-background px-2 py-2 rounded-full">
                                    {countdown[unit as keyof typeof countdown]
                                        .toString()
                                        .padStart(2, "0")}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>

                <p className="text-sm">
                    {t("limited_stock", {
                        defaultValue: "Pesan sekarang! Persediaan terbatas."
                    })}
                </p>
            </div>

            {/* MARQUEE */}
            <div className="relative overflow-hidden pb-4 py-2 group">

                <div
                    className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]"
                    style={{ animationDuration: `${duration}s` }}
                >

                    {[...visibleProducts, ...visibleProducts].map((item, i) => {

                        const normalPrice = getRoleBasedPrice(item, role);

                        const discount = Math.max(
                            0,
                            normalPrice - item.promo_price
                        );

                        const discountPercent = Math.round(
                            (discount / (normalPrice || 1)) * 100
                        );

                        const imageSrc =
                            item.images ||
                            item.game_logo ||
                            item.game_image ||
                            null;

                        const outOfStock = isOutOfStock(item);
                        const expired = isPromoExpired(item.end_at);

                        const remaining =
                            item.stock && item.stock_usage !== undefined
                                ? Math.max(0, item.stock - item.stock_usage)
                                : null;

                        const stockPercent =
                            item.stock && item.stock > 0
                                ? ((remaining ?? 0) / item.stock) * 100
                                : 0;

                        return (
                            <Link
                                key={`${item.id}-${i}`}
                                href={{
                                    pathname: `/order/${item.game_slug}`,
                                    query: { product_id: item.id }
                                }}
                                className={cn(
                                    "group/flashsale relative flex flex-col justify-between shrink-0 lg:w-[256px] border border-border/75 rounded-xl overflow-hidden transition-all duration-300",
                                    "bg-muted",
                                    (expired || outOfStock) &&
                                    "pointer-events-none opacity-60 grayscale",
                                    !expired &&
                                    !outOfStock &&
                                    "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background hover:shadow-xl"
                                )}
                                style={{
                                    backgroundImage: "var(--image-flashsale)",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}
                            >

                                {/* BODY */}
                                <div className="flex flex-col gap-2 p-3 lg:p-4">

                                    {/* TITLE */}

                                    <figcaption className="text-sm font-semibold text-wrap">
                                        {item.title}
                                    </figcaption>


                                    <figcaption className="text-xs text-gray-300">
                                        {item.brand}
                                    </figcaption>

                                    {/* IMAGE + PRICE */}
                                    <div className="flex items-center gap-2 lg:gap-3">

                                        <div className="relative h-6 w-6 lg:h-8 lg:w-8">

                                            {!imageSrc && (
                                                <ImagePlaceholder className="absolute inset-0 rounded-md" />
                                            )}

                                            {imageSrc && (
                                                <Image
                                                    src={imageSrc}
                                                    alt={item.title}
                                                    width={36}
                                                    height={36}
                                                    className="h-full w-full object-contain duration-300 group-hover/flashsale:rotate-12 group-hover/flashsale:scale-110"
                                                />
                                            )}

                                        </div>

                                        <div className="flex flex-col gap-1">

                                            <p className="text-sm font-bold text-white">
                                                {format(item.promo_price)}
                                            </p>

                                            <p className="text-xs italic line-through text-red-500">
                                                {format(normalPrice)}
                                            </p>

                                        </div>

                                    </div>

                                    {/* STOCK */}
                                    {item.stock !== undefined && item.stock !== null && (
                                        <div className="mt-auto">

                                            <div className="relative w-full h-1.5 rounded-full bg-secondary mb-1 overflow-hidden">

                                                <div
                                                    className={cn(
                                                        "h-full transition-all",
                                                        stockPercent < 20
                                                            ? "bg-red-600"
                                                            : stockPercent < 50
                                                                ? "bg-yellow-400"
                                                                : "bg-primary"
                                                    )}
                                                    style={{
                                                        width: `${stockPercent}%`
                                                    }}
                                                />

                                            </div>

                                            <div className="flex justify-end">
                                                <span className="text-[9px] font-semibold">
                                                    {item.stock_usage ?? 0} / {item.stock} purchased
                                                </span>
                                            </div>

                                        </div>
                                    )}
                                </div>

                                {/* FOOTER */}
                                <div className="flex items-end justify-end gap-2 bg-gradient-to-b from-primary to-primary/40 p-2">

                                    <div className="rounded bg-gradient-to-b from-primary to-primary/60 px-2 py-0.5 text-xxs font-semibold text-primary-foreground shadow">
                                        -{discountPercent}%
                                    </div>

                                    <div className="bg-white text-black px-2 py-1 rounded flex items-center">
                                        <LogoInstan className="h-4 w-12" />
                                    </div>

                                </div>

                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}