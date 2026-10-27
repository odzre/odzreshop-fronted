"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { WaveSnow } from "@/components/ui/WaveSnow";
import { Button } from "@/components/ui/button";

export default function Artikel({ uiEffect }: { uiEffect: number }) {
    const isSnowEffect = uiEffect === 1;
    const { data, isLoading } = useSWR("/api/blog", fetcher);
    const [visibleCount] = useState(6);

    const blogs = data?.blogs || [];
    const visibleBlogs = blogs.slice(0, visibleCount);

    // =============================
    // 📌 SKELETON MODE
    // =============================
    if (isLoading) {
        return (
            <div className="pb-12">
                <div className="mb-6 text-center">
                    <div className="h-8 w-64 mx-auto bg-muted animate-pulse rounded-lg mb-3" />
                    <div className="h-4 w-96 max-w-full mx-auto bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl overflow-hidden bg-muted animate-pulse aspect-[4/3]"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Tidak ada blog → jangan tampilkan list
    if (!blogs.length) return null;

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-lg sm:text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                    <span>📰</span> Artikel Terbaru & Berita Game
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                    Temukan info menarik seputar dunia game: panduan, update, promo top-up, hingga berita komunitas.
                </p>
            </div>

            {/* Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleBlogs.map((post: any) => (
                    <div key={post.id} className="relative">
                        <Card className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-card border-0">
                            <Link href={`/artikel/${post.slug}`} className="block w-full h-full focus:outline-none">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        priority
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-sm sm:text-base line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                </div>
                            </Link>
                        </Card>

                        {isSnowEffect && (
                            <WaveSnow className="absolute -left-[2px] -top-[8px] w-full h-6 sm:h-8" />
                        )}
                    </div>
                ))}
            </div>

            {/* Button */}
            <div className="mt-6 text-center">
                <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-6 py-2 text-sm font-medium rounded-lg bg-transparent hover:bg-accent/75 hover:text-accent-foreground ring-1 ring-slate-900/5 shadow transition-all duration-300"
                >
                    <Link href="/artikel">
                        Lihat Semua Artikel
                    </Link>
                </Button>
            </div>
        </div>
    );
}
