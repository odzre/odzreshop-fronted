"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/panel/content-layout";
import PageHeader from "@/components/ui/PageHeader";

interface Review {
    id: number;
    order_id: string;
    whatsapp: string;
    product_name: string;
    product: string;
    comment: string;
    rating: number;
    created_at: string;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

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

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/reviews/paginated?page=${page}&limit=6`
                );
                const data = await res.json();

                const fetchedReviews: Review[] = data?.data ?? [];

                setReviews(prev => {
                    const existingIds = new Set(prev.map(r => r.id));
                    const newItems = fetchedReviews.filter(
                        r => !existingIds.has(r.id)
                    );
                    return [...prev, ...newItems];
                });

                if (page >= data?.pagination?.totalPages) {
                    setHasMore(false);
                }
            } catch (err) {
                console.error("❌ Gagal memuat review:", err);
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        };

        fetchReviews();
    }, [page]);

    if (initialLoading) {
        return (
            <ContentLayout title="Ulasan Pelanggan">
                <div className="w-full h-[80vh] flex justify-center items-center">
                    <LoadingSpinner size={40} />
                </div>
            </ContentLayout>
        );
    }

    if (reviews.length === 0) {
        return (
            <ContentLayout title="Ulasan Pelanggan">
                <div className="flex justify-center items-center h-[60vh] text-muted-foreground">
                    Belum ada review dari pelanggan.
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title="Ulasan Pelanggan">
            <div className="-mx-2 lg:-mx-8 mb-8">
                <PageHeader
                    title="Ulasan & Reviews"
                    description={`Terima kasih atas kepercayaan Anda.\n\nBerikut ini adalah kumpulan ulasan dan penilaian dari pelanggan kami terhadap layanan ${process.env.NEXT_PUBLIC_SITE_NAME || "kami"
                        }.`}
                    backgroundImage="/bannergame.webp"
                    height="300px"
                />
            </div>

            <section className="mt-12 py-10 sm:py-16">
                <div className="container mx-auto px-2">
                    <div className="mx-auto max-w-2xl text-center mb-10">
                        <h2 className="text-lg font-semibold text-primary">
                            Ulasan Terbaru
                        </h2>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            Apa kata pelanggan tentang kami?
                        </p>
                    </div>

                    <div className="-mt-8 sm:-mx-4 sm:columns-2 lg:columns-3">
                        {reviews.map((r, i) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="pt-8 sm:inline-block sm:w-full sm:px-4"
                            >
                                <figure className="rounded-2xl bg-secondary p-6 shadow-sm">
                                    <h3 className="font-bold">{r.product_name}</h3>
                                    <blockquote className="mt-3 italic">
                                        “{r.comment}”
                                    </blockquote>

                                    <div className="mt-3 flex justify-between">
                                        <span>{r.whatsapp}</span>
                                        <div className="flex">
                                            {[...Array(5)].map((_, idx) => (
                                                <Star
                                                    key={idx}
                                                    size={18}
                                                    className={
                                                        idx < r.rating
                                                            ? "text-yellow-400 fill-yellow-400"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex justify-between text-xs">
                                        <span>{r.product}</span>
                                        <span>{formatDateTime(r.created_at)}</span>
                                    </div>
                                </figure>
                            </motion.div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-12">
                            <Button
                                variant="secondary"
                                onClick={() => setPage(p => p + 1)}
                                disabled={loading}
                            >
                                {loading ? "Memuat..." : "Muat Lebih Banyak"}
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </ContentLayout>
    );
}
