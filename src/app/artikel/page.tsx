"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ContentLayout } from "@/components/panel/content-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ArtikelPage() {
  const { data, isLoading, error } = useSWR("/api/blog", fetcher);
  const [visibleCount, setVisibleCount] = useState(6);

  if (isLoading) {
    return (
      <ContentLayout title="Artikel">
        <div className="w-full h-[80vh] flex justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Artikel">
        <div className="w-full h-[60vh] flex justify-center items-center text-red-500">
          Gagal memuat artikel
        </div>
      </ContentLayout>
    );
  }

  const blogs = data?.blogs || [];

  if (blogs.length === 0) {
    return (
      <ContentLayout title="Artikel">
        <div className="w-full h-[60vh] flex justify-center items-center text-muted-foreground">
          Belum ada artikel.
        </div>
      </ContentLayout>
    );
  }

  const featured = blogs[0];
  const popular = blogs.slice(1, 4);
  const others = blogs.slice(4, visibleCount);
  const isMore = visibleCount < blogs.length;

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "-" : format(d, "dd MMM yyyy");
  };

  const fallbackImage = "/placeholder.jpg"; // pastikan ada di public

  return (
    <ContentLayout title="Artikel">
      <div className="container w-full mx-auto px-2 lg:px-8 pb-12">
        <h2 className="text-3xl font-bold tracking-tight pb-4 py-8 mb-6 border-b">
          Artikel & Berita
        </h2>

        <section className="flex flex-col md:flex-row gap-6">
          {/* Featured */}
          <div className="md:w-[60%]">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-xl overflow-hidden border bg-muted shadow-sm hover:ring-2 hover:ring-my-color3 hover:ring-offset-2 hover:ring-offset-background hover:shadow-md h-full"
            >
              <Link href={`/artikel/${featured.slug}`} className="block">
                <div className="relative aspect-[15/10] overflow-hidden">
                  <Image
                    src={featured.image || fallbackImage}
                    alt={featured.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="inline-block px-3 py-1 bg-my-color3 rounded-full text-xs font-medium mb-3">
                      {featured.category || "Berita"}
                    </div>
                    <h2 className="font-bold text-xl md:text-2xl line-clamp-2 mb-2">
                      {featured.title}
                    </h2>
                    <div className="text-sm text-gray-300 flex items-center gap-2">
                      <span>{featured.author || "Admin"}</span>
                      <span>•</span>
                      <span>{formatDate(featured.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Popular */}
          <div className="md:w-[40%] flex flex-col gap-4">
            {popular.map((post: any) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group rounded-xl overflow-hidden shadow-sm bg-background hover:shadow-md hover:ring-2 hover:ring-my-color3 hover:ring-offset-2"
              >
                <Link href={`/artikel/${post.slug}`} className="flex gap-2">
                  <div className="relative w-[120px] h-[150px]">
                    <Image
                      src={post.image || fallbackImage}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 py-2 pr-2">
                    <div className="inline-block px-2 py-1 bg-my-color3 rounded-full text-[10px] text-white mb-1">
                      {post.category || "Games News"}
                    </div>
                    <h3 className="font-semibold text-xs line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {formatDate(post.published_at)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Others */}
        <section>
          <h2 className="text-2xl font-bold mb-1 pt-4">
            ⭐ Artikel Lainnya
          </h2>
          <p className="mb-6">
            Berikut adalah list artikel yang sangat menarik untuk kamu baca!
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((post: any) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group rounded-xl bg-background overflow-hidden shadow-sm hover:shadow-md hover:ring-2 hover:ring-my-color3"
              >
                <Link href={`/artikel/${post.slug}`}>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={post.image || fallbackImage}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="py-2 px-2 pr-4">
                    <div className="inline-block px-2 py-1 bg-my-color3 rounded-full text-[10px] text-white mb-2">
                      {post.category || "Berita"}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(post.published_at)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {isMore && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setVisibleCount((prev) => prev + 6)}>
                Tampilkan Lainnya
              </Button>
            </div>
          )}
        </section>
      </div>
    </ContentLayout>
  );
}
