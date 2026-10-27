"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Transaction } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

const statusClassMap: Record<string, string> = {
    Pending: "bg-yellow-500 text-black",
    Proses: "bg-sky-600 text-sky-900",
    Batal: "bg-rose-300 text-rose-900",
    Gagal: "bg-red-500 text-white",
    Sukses: "bg-emerald-200 text-emerald-900"
};

const statusLabelMap: Record<string, string> = {
    Sukses: "Success",
    Pending: "Pending",
    Proses: "Process",
    Batal: "Expired",
    Gagal: "Cancelled"
};

function calcSpeed(createdAt: string, updatedAt?: string): string | null {
    if (!updatedAt) return null;
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();
    const diffMs = updated - created;
    if (diffMs <= 0) return null;
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return `${diffSeconds} second`;
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    if (minutes < 60) return `${minutes}m ${seconds}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

export default function Transactions() {
    const { data: session, status } = useSession();
    const { format } = useCurrency();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (status !== "authenticated") return;

        const fetchTransactions = async () => {
            try {
                let deviceId = localStorage.getItem("device_id");

                // 🔥 WAIT sampai device_id ada (solve race condition)
                if (!deviceId) {
                    console.warn("⏳ Menunggu device_id...");

                    await new Promise((resolve) => setTimeout(resolve, 300));
                    deviceId = localStorage.getItem("device_id");
                }

                if (!deviceId) {
                    console.error("❌ device_id tetap tidak ada");
                    setLoading(false); // 🔥 FIX loading stuck
                    return;
                }

                const res = await fetch("/api/transactions", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Device-Id": deviceId,
                    },
                });

                if (res.status === 401) {
                    console.error("❌ Unauthorized (device/token mismatch)");
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`HTTP ${res.status} - ${errText}`);
                }

                const data = await res.json();

                if (data.status === "success") {
                    setTransactions(data.data);
                } else {
                    console.error("API error:", data);
                }

            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [status]);

    if (status === "loading" || loading)
        return (
            <div className="w-full h-[60vh] flex justify-center items-center">
                <LoadingSpinner size={40} />
            </div>
        );

    if (!session) return redirect("/signin");

    // === Filtering ===
    const filtered = transactions.filter((tx) => {
        const matchSearch = Object.values(tx).some((v) =>
            v?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchDate = dateFilter
            ? new Date(tx.created_at).toISOString().slice(0, 10) === dateFilter
            : true;

        const matchStatus =
            statusFilter === "all"
                ? true
                : tx.buy_status.toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchDate && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <main className="relative">
            <h1 className="text-sm px-2 font-semibold mb-6">Riwayat Transaksi</h1>

            <div
                className="
    grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
    gap-3 sm:gap-4 px-2 mb-6 items-center
  "
            >
                {/* Search */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari transaksi..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="
        pl-9 pr-3 h-9 w-full rounded-md border border-input bg-muted text-sm
        placeholder:text-muted-foreground focus-visible:ring-2
        focus-visible:ring-my-color3 focus-visible:outline-none
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

                {/* Status Filter */}
                <div className="w-full">
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full h-9 rounded-md bg-background border border-input text-sm">
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Proses">Proses</SelectItem>
                            <SelectItem value="Sukses">Sukses</SelectItem>
                            <SelectItem value="Gagal">Gagal</SelectItem>
                            <SelectItem value="Batal">Batal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* === Table Transaksi === */}
            <div className="w-screen sm:w-full sm:container -mx-4 sm:mx-0 sm:rounded-lg sm:px-0">
                <div className="overflow-x-auto ring-1 ring-muted rounded-none sm:rounded-lg">
                    <table className="min-w-full text-sm whitespace-nowrap">
                        <thead>
                            <tr className="even:bg-muted/50 border-t border-b text-xs text-left rounded-lg">
                                <th className="p-3 text-left">Tanggal</th>
                                <th className="p-3 text-left">Nomor Invoice</th>
                                <th className="p-3 text-left">Game</th>
                                <th className="p-3 text-left">Produk</th>
                                <th className="p-3 text-left">Harga</th>
                                <th className="p-3 text-left">User Input</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Kecepatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length > 0 ? (
                                paginated.map((tx, index) => {
                                    const cls =
                                        statusClassMap[
                                        tx.buy_status as keyof typeof statusClassMap
                                        ] || "bg-gray-200 text-gray-800";
                                    const label =
                                        statusLabelMap[
                                        tx.buy_status as keyof typeof statusLabelMap
                                        ] || tx.buy_status;

                                    return (
                                        <motion.tr
                                            key={tx.order_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`text-xs transition-colors ${index % 2 === 0
                                                ? ""
                                                : ""
                                                }`}
                                        >
                                            <td className="p-3">{formatDateTime(tx.created_at)}</td>
                                            <td className="p-3 text-primary">
                                                <Link href={`/invoices/${tx.order_id}`}>
                                                    {tx.order_id}
                                                </Link>
                                            </td>
                                            <td className="p-3">{tx.games}</td>
                                            <td className="p-3">{tx.product}</td>
                                            <td className="p-3">
                                                {format(tx.price)}
                                            </td>
                                            <td className="p-3">
                                                {tx.id_games} {tx.server_games}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}
                                                >
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {tx.buy_status === "Sukses" && tx.updated_at ? (
                                                    <span className="text-xs text-emerald-400">
                                                        Waktu penyelesaian: sukses {calcSpeed(tx.created_at, tx.updated_at)}
                                                    </span>
                                                ) : tx.buy_status === "Proses" || tx.buy_status === "Pending" ? (
                                                    <span className="text-xs text-yellow-400">Menunggu...</span>
                                                ) : (
                                                    <span className="text-xs text-gray-500">-</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-400">
                                        Belum ada transaksi yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* === Pagination === */}
            <div className="flex justify-between items-center mt-4">
                <Button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span>
                    Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </main>
    );
}
