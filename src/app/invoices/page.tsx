"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import useSWR from "swr";
import { Settings } from "@/types";
import useRealtimeTransactions from "@/hooks/use-realtime-transactions";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MotionInput = motion(Input);
const MotionButton = motion(Button);

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

const fetcher = (url: string) => fetch(url).then((r) => r.json());


export default function InvoiceSearchPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"orderId" | "whatsapp">("orderId");
    const [orderId, setOrderId] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [loading, setLoading] = useState(false);
    const { data: orders, isLoading: isLoadingOrders } = useRealtimeTransactions();
    const { data: settings } = useSWR<Settings>("/api/settings", fetcher);

    const showTransactions = settings?.data?.["general.show_last_transactions"] === "1";

    const handleSubmitOrderId = async (e: FormEvent) => {
        e.preventDefault();

        if (!orderId.trim()) {
            toast.error("Nomor invoice tidak boleh kosong!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `/api/invoices/search?order_id=${encodeURIComponent(orderId)}`
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || `Error ${response.status}`);
                return;
            }

            if (data.success && data.data) {
                router.push(`/invoices/${orderId}`);
            } else {
                toast.error("Invoice tidak ditemukan!");
            }
        } catch {
            toast.error("Terjadi kesalahan saat mencari invoice.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitWhatsapp = async (e: FormEvent) => {
        e.preventDefault();

        const trimmed = whatsapp.trim();

        if (!/^08\d{8,11}$/.test(trimmed)) {
            toast.error(
                "Nomor WhatsApp harus diawali dengan 08 dan terdiri dari 10-13 digit!"
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `/api/invoices/search-by-whatsapp?whatsapp=${encodeURIComponent(
                    trimmed
                )}`
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || `Error ${response.status}`);
                return;
            }

            if (data.data && data.data.length > 0) {
                router.push(`/invoices/whatsapp/${encodeURIComponent(trimmed)}`);
            } else {
                toast.error(
                    "Data order dengan nomor WhatsApp tersebut tidak ditemukan."
                );
            }
        } catch (error: any) {
            toast.error(
                error?.message || "Terjadi kesalahan saat mencari data WhatsApp."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContentLayout title="Search Invoice">
            <main className="relative">

                <div className="lg:m-6 py-4 shadow-sm rounded-lg bg-primary/5 p-6">

                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-3xl px-4 lg:px-8 py-16"
                    >

                        <div className="text-center space-y-3">

                            <motion.h1
                                className="text-3xl md:text-4xl font-bold tracking-tight"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {t("invoice.title")}
                            </motion.h1>

                            <motion.p
                                className="text-muted-foreground text-sm md:text-base"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {t("invoice.subtitle")}
                            </motion.p>

                        </div>

                        {/* Tabs */}

                        <div className="mt-8 flex justify-center space-x-4 border-b border-border">

                            <button
                                type="button"
                                onClick={() => setActiveTab("orderId")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "orderId"
                                    ? "border-b-2 border-primary text-muted-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {t("invoice.tab_invoice")}
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("whatsapp")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "whatsapp"
                                    ? "border-b-2 border-primary text-muted-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {t("invoice.tab_whatsapp")}
                            </button>

                        </div>

                        {/* Form Invoice */}

                        {activeTab === "orderId" && (

                            <motion.form
                                onSubmit={handleSubmitOrderId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6 rounded-2xl bg-background backdrop-blur-md shadow-lg p-6 space-y-4"
                            >

                                <div className="space-y-1">

                                    <label
                                        htmlFor="orderId"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        {t("invoice.label_invoice")}
                                    </label>

                                    <MotionInput
                                        id="orderId"
                                        type="text"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        placeholder="Contoh: INV-123456789"
                                        whileFocus={{ scale: 1.02 }}
                                    />

                                </div>

                                <MotionButton
                                    variant="default"
                                    size="lg"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {loading
                                        ? t("invoice.loading")
                                        : t("invoice.search_invoice")}
                                </MotionButton>

                            </motion.form>
                        )}

                        {/* Form WhatsApp */}

                        {activeTab === "whatsapp" && (

                            <motion.form
                                onSubmit={handleSubmitWhatsapp}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6 rounded-2xl bg-background backdrop-blur-md shadow-lg p-6 space-y-4"
                            >

                                <div className="space-y-1">

                                    <label
                                        htmlFor="whatsapp"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        {t("invoice.label_invoice")}
                                    </label>

                                    <MotionInput
                                        id="whatsapp"
                                        type="tel"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        whileFocus={{ scale: 1.02 }}
                                    />

                                </div>

                                <MotionButton
                                    variant="default"
                                    size="lg"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {loading
                                        ? t("invoice.loading")
                                        : t("invoice.search_invoice")}
                                </MotionButton>

                            </motion.form>
                        )}

                    </motion.section>

                </div>
                {showTransactions && (
                    <div className="w-full mx-auto relative pt-4 lg:px-4">

                        <h2 className="text-xl font-bold mb-2 text-left lg:text-center">
                            {t("invoice.realtime_title")}
                        </h2>

                        <p className="text-sm text-muted-foreground mb-6 text-left lg:text-center">
                            {t("invoice.realtime_subtitle")}
                        </p>

                        <div className="w-full sm:container">
                            <div className="-mx-4 overflow-x-auto ring-1 ring-border sm:mx-0 sm:rounded-lg">

                                <table className="min-w-full text-sm whitespace-nowrap">

                                    <thead>
                                        <tr className="border-t border-b text-xs text-left">
                                            <th className="p-3">{t("table.date")}</th>
                                            <th className="p-3">{t("table.invoice_number")}</th>
                                            <th className="p-3">{t("table.whatsapp")}</th>
                                            <th className="p-3">{t("table.price")}</th>
                                            <th className="p-3">{t("table.status")}</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {isLoadingOrders ? (
                                            <tr>
                                                <td colSpan={5} className="p-8">
                                                    <div className="flex items-center justify-center">
                                                        <LoadingSpinner size={28} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : orders?.data && orders.data.length > 0 ? (
                                            orders.data.map((order: any, index: number) => (
                                                <motion.tr
                                                    key={order.order_id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`text-xs ${index % 2 === 0 ? "bg-background" : "bg-muted/30"
                                                        }`}
                                                >
                                                    <td className="p-3">{order.updated_at}</td>
                                                    <td className="p-3">{order.order_id}</td>
                                                    <td className="p-3">{order.whatsapp}</td>
                                                    <td className="p-3">IDR {order.total_price}</td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-semibold ${statusClassMap[order.buy_status] ?? "bg-gray-500 text-white"
                                                                }`}
                                                        >
                                                            {statusLabelMap[order.buy_status] ?? order.buy_status}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="p-8 text-center text-muted-foreground"
                                                >
                                                    {t("invoice.no_transactions_today")}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>

                            </div>
                        </div>

                    </div>
                )}

            </main>
        </ContentLayout>
    );
}