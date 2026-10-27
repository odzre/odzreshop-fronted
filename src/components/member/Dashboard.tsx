"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, Smartphone, Wallet } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUser } from "@/hooks/use-user";
import { useSettings } from "@/context/settings-context";
import { useUserGlobal } from "@/context/user-context";
import { useCurrency } from "@/hooks/useCurrency";
import { SummaryData, Transaction } from "@/types";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const { user, refreshUser } = useUserGlobal();
    const { format } = useCurrency();
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const settings = useSettings();

    // === Map warna & label status ===
    const statusClassMap: Record<string, string> = {
        Pending: "bg-yellow-500 text-black",
        Proses: "bg-sky-600 text-sky-900",
        Batal: "bg-rose-300 text-rose-900",
        Gagal: "bg-red-500 text-white",
        Sukses: "bg-emerald-200 text-emerald-900"
    };

    const statusLabelMap: Record<string, string> = {
        Pending: "Menunggu",
        Proses: "Diproses",
        Batal: "Dibatalkan",
        Gagal: "Gagal",
        Sukses: "Sukses"
    };

    const getBadgeEmoji = (role?: string) => {
        switch (role) {
            case "gold":
                return "🥇 gold";
            case "platinum":
                return "💎 platinum";
            case "reseller":
                return "⭐ reseller";
            case "admin":
                return "Admin";
            default:
                return "🥈 silver";
        }
    };

    useEffect(() => {
        if (status !== "authenticated") return;

        const fetchAll = async () => {
            try {
                let deviceId = localStorage.getItem("device_id");

                // 🔥 WAIT device_id (hindari race condition)
                if (!deviceId) {
                    console.warn("⏳ Menunggu device_id...");
                    await new Promise((r) => setTimeout(r, 300));
                    deviceId = localStorage.getItem("device_id");
                }

                if (!deviceId) {
                    console.error("❌ device_id tidak ditemukan");
                    return;
                }

                // 🔥 FETCH SUMMARY
                const summaryRes = await fetch("/api/transactions/transaction-summary", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Device-Id": deviceId,
                    },
                });

                if (summaryRes.ok) {
                    const data = await summaryRes.json();
                    if (data.status === "success") {
                        setSummary(data.data);
                    }
                } else {
                    console.error("❌ summary error", await summaryRes.text());
                }

                // 🔥 FETCH TRANSACTIONS
                const trxRes = await fetch("/api/transactions", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Device-Id": deviceId,
                    },
                });

                if (trxRes.ok) {
                    const data = await trxRes.json();

                    if (data.status === "success") {
                        const todayDate = new Date().toLocaleDateString("id-ID");

                        const todayOnly = data.data.filter((trx: any) => {
                            const trxDate = new Date(
                                trx.created_at.replace(" ", "T")
                            ).toLocaleDateString("id-ID");
                            return trxDate === todayDate;
                        });

                        setTransactions(todayOnly);
                    }
                } else {
                    console.error("❌ transactions error", await trxRes.text());
                }

                // 🔥 refresh user
                refreshUser();

            } catch (error) {
                console.error("💥 Dashboard error:", error);
            }
        };

        fetchAll();
    }, [status, refreshUser]);

    const coinImage =
        settings?.data?.["general.coin_image"] ||
        settings?.data?.general?.coin_image;

    // === Filter transaksi hari ini ===
    const today = new Date().toISOString().slice(0, 10);
    const todayTransactions = transactions.filter((trx) => {
        const trxDate = new Date(trx.created_at).toISOString().slice(0, 10);
        return trxDate === today;
    });

    // ✅ Hitung status summary di atas sebelum return (agar tidak conditional hook)
    const statusSummary = useMemo(() => {
        const summaryCount = { Pending: 0, Proses: 0, Sukses: 0, Gagal: 0 };
        todayTransactions.forEach((trx) => {
            const s = trx.buy_status as keyof typeof summaryCount;
            if (summaryCount[s] !== undefined) summaryCount[s]++;
        });
        return summaryCount;
    }, [todayTransactions]);

    if (status === "loading") {
        return (
            <div className="w-full h-[60vh] flex justify-center items-center">
                <LoadingSpinner size={40} />
            </div>
        );
    }

    if (!session) return redirect("/signin");

    return (
        <div className="col-span-6 space-y-6">
            {/* === Card Profil & Saldo === */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Profil */}
                <div className="flex flex-col gap-6 py-6 rounded-2xl bg-gradient-to-bl from-primary/5 to-primary/20">
                    <div className="px-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 rounded-xl">
                                <AvatarImage
                                    src={session.user?.image || ""}
                                    alt={session.user?.name || "User"}
                                />
                                <AvatarFallback>
                                    {session.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold">{session.user?.name}</h2>
                                <Badge className="capitalize">
                                    {getBadgeEmoji(session?.user?.role)}
                                </Badge>
                            </div>
                        </div>
                        <Link href="/settings">
                            <Settings size={18} />
                        </Link>
                    </div>
                    <div className="px-6 flex items-center gap-4 text-sm text-muted-foreground">
                        <Smartphone size={15} />
                        <span>{session.user?.email}</span>
                    </div>
                </div>

                {/* Saldo */}
                <div className="flex flex-col gap-6 py-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/20">
                    <div className="px-6 flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {coinImage && (
                                <Image
                                    src={coinImage}
                                    alt="Coin"
                                    width={22}
                                    height={22}
                                    className="w-6 h-6"
                                />
                            )}
                            <h2 className="font-semibold text-lg">Credits</h2>
                        </div>
                        <Button asChild size="sm">
                            <Link href="/member/deposit">Top Up</Link>
                        </Button>
                    </div>

                    <div className="px-6">
                        <div className="flex items-center gap-3 text-2xl font-bold">
                            <Wallet className="w-7 h-7 text-muted-foreground" />
                            <span>{format(Number(user?.saldo ?? 0))}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Transaksi Hari Ini === */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Transaksi Hari Ini</h2>

                {/* Ringkasan Utama */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border bg-accent/30 p-4">
                        <h2 className="text-xl font-semibold">
                            {todayTransactions.length}
                        </h2>
                        <p className="text-sm text-muted-foreground">Total Transaksi</p>
                    </div>
                    <div className="rounded-2xl border bg-accent/30 p-4">
                        <h2 className="text-xl font-semibold">
                            {format(todayTransactions.reduce((acc, trx) => acc + trx.price, 0))}
                        </h2>
                        <p className="text-sm text-muted-foreground">Total Penjualan</p>
                    </div>
                </div>

                {/* === Status Summary === */}
                <div className="mt-4 grid grid-cols-2 gap-4 xl:mt-8 xl:grid-cols-4 xl:gap-8">
                    <div className="flex flex-col items-center justify-center rounded-lg border p-6 border-yellow-800 bg-yellow-700 hover:bg-yellow-500">
                        <div className="text-3xl font-semibold">
                            {statusSummary.Pending}
                        </div>
                        <div className="pt-2 text-sm font-medium">Menunggu</div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-6 border-sky-400 bg-sky-700 hover:bg-sky-500">
                        <div className="text-3xl font-semibold">{statusSummary.Proses}</div>
                        <div className="pt-2 text-sm font-medium">Dalam Proses</div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-6 border-emerald-400 bg-emerald-700 hover:bg-emerald-500">
                        <div className="text-3xl font-semibold">{statusSummary.Sukses}</div>
                        <div className="pt-2 text-sm font-medium">Sukses</div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-6 border-rose-400 bg-rose-700 hover:bg-rose-500">
                        <div className="text-3xl font-semibold">{statusSummary.Gagal}</div>
                        <div className="pt-2 text-sm font-medium">Gagal</div>
                    </div>
                </div>
                <h2 className="text-lg font-semibold">
                    Riwayat Transaksi Terbaru Hari Ini
                </h2>
                {/* === Table Transaksi Hari Ini === */}
                <div className="overflow-x-auto ring-1 ring-muted sm:mx-0 rounded-lg">
                    <table className="min-w-full text-sm whitespace-nowrap divide-y divide-muted">
                        <thead>
                            <tr className="even:bg-muted/50 text-xs">
                                <th className="px-3 py-3.5 text-left font-semibold">
                                    Nomor Invoice
                                </th>
                                <th className="px-3 py-3.5 text-left font-semibold">Game</th>
                                <th className="px-3 py-3.5 text-left font-semibold">Produk</th>
                                <th className="px-3 py-3.5 text-left font-semibold">
                                    User Input
                                </th>
                                <th className="px-3 py-3.5 text-left font-semibold">Harga</th>
                                <th className="px-3 py-3.5 text-left font-semibold">Tanggal</th>
                                <th className="px-3 py-3.5 text-left font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayTransactions.length > 0 ? (
                                todayTransactions.map((trx, i) => {
                                    const cls =
                                        statusClassMap[
                                        trx.buy_status as keyof typeof statusClassMap
                                        ] || "bg-gray-200 text-gray-700";
                                    const label =
                                        statusLabelMap[
                                        trx.buy_status as keyof typeof statusLabelMap
                                        ] || trx.buy_status;

                                    return (
                                        <tr
                                            key={trx.order_id}
                                            className={`text-xs ${i % 2 === 0
                                                ? ""
                                                : ""
                                                }`}
                                        >
                                            <td className="px-3 py-3.5 text-primary">
                                                <Link href={`/invoices/${trx.order_id}`}>
                                                    {trx.order_id}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-3.5">{trx.games}</td>
                                            <td className="px-3 py-3.5">{trx.product}</td>
                                            <td className="px-3 py-3.5">
                                                {trx.id_games} {trx.server_games}
                                            </td>
                                            <td className="px-3 py-3.5">
                                                {format(Number(trx.price))}
                                            </td>
                                            <td className="px-3 py-3.5">
                                                {new Date(trx.created_at).toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}
                                                >
                                                    {label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        Belum ada transaksi hari ini
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
