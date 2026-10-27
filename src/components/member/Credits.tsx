"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useUserGlobal } from "@/context/user-context";
import { useCurrency } from "@/hooks/useCurrency";

// === Map Warna & Label Status ===
const statusClassMap: Record<string, string> = {
    SUCCESS: "bg-emerald-200 text-emerald-900",
    PENDING: "bg-yellow-300 text-yellow-900",
    FAILED: "bg-red-400 text-white",
    EXPIRED: "bg-rose-300 text-rose-900",
    CANCELLED: "bg-gray-300 text-gray-800"
};

const statusLabelMap: Record<string, string> = {
    SUCCESS: "Berhasil",
    PENDING: "Menunggu",
    FAILED: "Gagal",
    EXPIRED: "Expired",
    CANCELLED: "Dibatalkan"
};

interface Deposit {
    invoice_number: string;
    payment_method: string;
    payment_status: string;
    payment_name: string;
    total_amount: number;
    created_at: string;
}

export default function Credits() {
    const { data: session } = useSession();
    const { user, refreshUser } = useUserGlobal();
    const { format } = useCurrency();
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [balance, setBalance] = useState<number>(session?.user?.saldo ?? 0);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const settings = useSettings();
    const coinImage =
        settings?.data?.["general.coin_image"] ||
        settings?.data?.general?.coin_image;

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function fetchDeposits() {
            try {
                let deviceId = localStorage.getItem("device_id");

                // 🔥 wait device_id (hindari race condition)
                if (!deviceId) {
                    await new Promise((r) => setTimeout(r, 300));
                    deviceId = localStorage.getItem("device_id");
                }

                if (!deviceId) {
                    console.error("❌ device_id tidak ditemukan");
                    setLoading(false);
                    return;
                }

                const res = await fetch("/api/deposit", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Device-Id": deviceId,
                    },
                    cache: "no-store",
                });

                const data = await res.json();

                if (!res.ok) {
                    console.error("❌ API error:", data);
                    return;
                }

                setDeposits(data?.data?.deposits?.data ?? []);

                if (data?.data?.user_balance) {
                    setBalance(data.data.user_balance);
                }
            } catch (err) {
                console.error("Error fetching deposits:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDeposits();
        refreshUser();
    }, [session, refreshUser]);

    const filteredDeposits = useMemo(() => {
        return deposits.filter((d) => {
            const matchSearch = d.invoice_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchDate = dateFilter
                ? new Date(d.created_at).toISOString().slice(0, 10) === dateFilter
                : true;
            return matchSearch && matchDate;
        });
    }, [deposits, searchTerm, dateFilter]);

    const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
    const paginatedData = filteredDeposits.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            {/* === Header Credits === */}
            <div className="flex flex-col gap-6 py-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20">
                <div className="flex items-center justify-between px-6">
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

                    <div className="flex gap-2">
                        <Link href="/member/deposit">
                            <Button size="sm">Top Up</Button>
                        </Link>
                        <Button size="sm" variant="outline">
                            Redeem
                        </Button>
                    </div>
                </div>

                <div className="px-6">
                    <p className="text-2xl font-bold">
                        {format(Number(user?.saldo ?? 0))}
                    </p>
                </div>
            </div>

            {/* === Filter & Search === */}
            <div
                className="
          grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
          gap-3 sm:gap-4 items-center
        "
            >
                {/* Search */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari Invoice..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="
              pl-9 pr-3 h-9 w-full rounded-md border border-input bg-background text-sm
              placeholder:text-muted-foreground
              focus-visible:ring-2 focus-visible:ring-my-color3 focus-visible:outline-none
            "
                    />
                </div>

                {/* Date Filter */}
                <div className="relative w-full">
                    <input
                        type="date"
                        value={dateFilter || today}
                        onChange={(e) => {
                            setDateFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="
              h-9 w-full rounded-md border border-input bg-background px-3 text-sm
              focus-visible:ring-2 focus-visible:ring-my-color3 focus-visible:outline-none
            "
                    />
                </div>
            </div>

            {/* === Table === */}
            <div className="mt-4 w-screen sm:w-full sm:container -mx-4 sm:mx-0 sm:px-0">
                <div className="overflow-x-auto ring-1 ring-muted rounded-none sm:rounded-lg">
                    <table className="min-w-full text-sm whitespace-nowrap">
                        <thead className="bg-muted sticky top-0">
                            <tr className="even:bg-muted/50 border-t border-b text-xs text-left rounded-lg">
                                <th className="p-3 text-left">Nomor Invoice</th>
                                <th className="p-3 text-left">Tanggal</th>
                                <th className="p-3 text-left">Jumlah</th>
                                <th className="p-3 text-left">Metode</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="h-[200px] text-center align-middle"
                                    >
                                        <div className="p-8 flex items-center justify-center h-full">
                                            <LoadingSpinner />
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => {
                                    const cls =
                                        statusClassMap[item.payment_status] ||
                                        "bg-gray-200 text-gray-800";
                                    const label =
                                        statusLabelMap[item.payment_status] || item.payment_status;

                                    return (
                                        <tr
                                            key={item.invoice_number}
                                            className={`text-xs transition-colors ${index % 2 === 0
                                                ? ""
                                                : ""
                                                }`}
                                        >
                                            <td className="p-3 font-medium">{item.invoice_number}</td>
                                            <td className="p-3">{formatDateTime(item.created_at)}</td>
                                            <td className="p-3">
                                                {format(item.total_amount)}
                                            </td>
                                            <td className="p-3 uppercase">{item.payment_name}</td>
                                            <td className="p-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`uppercase font-semibold ${cls}`}
                                                >
                                                    {label}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Belum ada riwayat transaksi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* === Pagination === */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                <p className="text-sm text-muted-foreground">
                    Menampilkan {paginatedData.length} dari {filteredDeposits.length} data
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    >
                        Sebelumnya
                    </Button>
                    <span className="text-sm">
                        Halaman {currentPage} dari {totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
