"use client";

import { useEffect, useState, useMemo } from "react";
import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface Mutation {
    invoice_number: string;
    description: string;
    amount: number;
    before_balance: number;
    after_balance: number;
    created_at: string;
}

export default function Mutasi() {
    const [mutations, setMutations] = useState<Mutation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const itemsPerPage = 10;

    const settings = useSettings();
    const coinImage =
        settings?.data?.["general.coin_image"] ||
        settings?.data?.general?.coin_image;

    // === Ambil tanggal hari ini ===
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function fetchMutations() {
            try {
                setLoading(true);

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

                const res = await fetch(`/api/mutation?page=${currentPage}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Device-Id": deviceId,
                    },
                    cache: "no-store"
                });

                const data = await res.json();

                if (data?.success) {
                    setMutations(data?.data ?? []);
                    setTotalPages(data?.pagination?.last_page ?? 1);
                    setTotalData(
                        data?.pagination?.total ?? data?.data?.length ?? 0
                    );
                } else {
                    console.error("API error:", data);
                }
            } catch (err) {
                console.error("Error fetching mutations:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchMutations();
    }, [currentPage]);

    // === Filtering (search & date) ===
    const filteredMutations = useMemo(() => {
        return mutations.filter((m) => {
            const matchSearch =
                m.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchDate = dateFilter
                ? new Date(m.created_at).toISOString().slice(0, 10) === dateFilter
                : true;
            return matchSearch && matchDate;
        });
    }, [mutations, searchTerm, dateFilter]);

    const paginatedData = filteredMutations; // 🔸 biarkan backend yang handle jumlah data per page

    return (
        <div className="space-y-6">
            {/* === Header Mutasi === */}
            <div className="flex flex-col gap-6 py-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20">
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        {coinImage && (
                            <Image
                                src={coinImage}
                                alt="Coin"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                        )}
                        <h2 className="font-semibold text-lg">Mutasi Saldo</h2>
                    </div>
                </div>

                <div className="px-6">
                    <p className="text-sm text-muted-foreground">
                        Riwayat perubahan saldo akun Anda (top-up & transaksi).
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
                        placeholder="Cari invoice atau deskripsi..."
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

            {/* === Table Mutasi === */}
            <div className="mt-4 w-screen sm:w-full sm:container -mx-4 sm:mx-0 sm:px-0">
                <div className="overflow-x-auto ring-1 ring-muted rounded-none sm:rounded-lg">
                    <table className="min-w-full text-sm whitespace-nowrap">
                        <thead className="bg-muted sticky top-0">
                            <tr className="even:bg-muted/50 border-t border-b text-xs text-left rounded-lg">
                                <th className="p-3 text-left">Nomor Invoice</th>
                                <th className="p-3 text-left">Deskripsi</th>
                                <th className="p-3 text-left">Jumlah</th>
                                <th className="p-3 text-left">Saldo Sebelum</th>
                                <th className="p-3 text-left">Saldo Setelah</th>
                                <th className="p-3 text-left">Tanggal</th>
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
                                paginatedData.map((item, index) => (
                                    <tr
                                        key={`${item.invoice_number}-${index}`}
                                        className={`text-xs transition-colors ${index % 2 === 0
                                            ? ""
                                            : ""
                                            }`}
                                    >
                                        <td className="p-3 font-medium">
                                            {item.invoice_number || "-"}
                                        </td>
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3 text-right">
                                            <Badge
                                                variant="outline"
                                                className={`font-bjcredits ${item.amount > 0
                                                    ? "bg-green-500/20 text-green-600"
                                                    : "bg-red-500/20 text-red-600"
                                                    }`}
                                            >
                                                {item.amount > 0 ? "+" : ""}
                                                {item.amount.toLocaleString("id-ID")} IDR
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-right">
                                            {item.before_balance.toLocaleString("id-ID")} IDR
                                        </td>
                                        <td className="p-3 text-right">
                                            {item.after_balance.toLocaleString("id-ID")} IDR
                                        </td>
                                        <td className="p-3">{formatDateTime(item.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        Belum ada riwayat mutasi.
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
                    Menampilkan {paginatedData.length} dari {totalData} data
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
