"use client";

import Head from "next/head";
import Image from "next/image";
import { Transaction } from "@/types";

interface InvoiceGameInfoProps {
  order: Transaction & { order_inputs?: Record<string, any> | null };
  game: {
    title: string;
    image: string;
  };
}

export function InvoiceGameInfo({ order, game }: InvoiceGameInfoProps) {
  // ✅ Ambil input custom dan filter nilai kosong/null/id/server
  const customInputs =
    order.order_inputs && typeof order.order_inputs === "object"
      ? Object.entries(order.order_inputs)
        .filter(([key, value]) => {
          const skipKeys = ["id", "server"];
          const val = String(value ?? "").trim();
          return !skipKeys.includes(key.toLowerCase()) && val !== "";
        })
        .map(([key, value]) => ({
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          value: String(value)
        }))
      : [];

  return (
    <>
      <Head>
        <title>
          {order.order_id} | {game.title}
        </title>
        <meta
          property="og:title"
          content={`${order.order_id} | ${game.title}`}
        />
        <meta property="og:image" content={game.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={game.image} />
      </Head>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/50 p-4">
        {/* 🖼️ Gambar Game */}
        <div className="relative aspect-[4/6] w-24 sm:w-32 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            alt={game.title}
            src={game.image}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 96px, 128px"
            priority
          />
        </div>

        {/* 📄 Detail Game */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-md font-semibold text-foreground">
              {order.games}
            </h3>
            <p className="text-sm text-muted-foreground">{order.product}</p>
          </div>

          <div className="space-y-2 text-sm">
            {/* ✅ Nickname */}
            {order.nickname && (
              <div>
                <span className="block text-muted-foreground text-xs font-medium">
                  Nickname
                </span>
                <p className="text-foreground">{order.nickname}</p>
              </div>
            )}

            {/* ✅ ID Game */}
            {order.id_games && (
              <div>
                <span className="block text-muted-foreground text-xs font-medium">
                  ID
                </span>
                <p className="text-foreground">{order.id_games}</p>
              </div>
            )}

            {/* ✅ Server Game */}
            {order.server_games && (
              <div>
                <span className="block text-muted-foreground text-xs font-medium">
                  Server
                </span>
                <p className="text-foreground">{order.server_games}</p>
              </div>
            )}

            {/* ✅ Custom Input (filtered) */}
            {customInputs.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/40 space-y-2">
                {customInputs.map(({ label, value }) => (
                  <div key={label}>
                    <span className="block text-muted-foreground text-xs font-medium">
                      {label}
                    </span>
                    <p className="text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
