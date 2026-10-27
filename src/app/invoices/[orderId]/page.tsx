"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import usePusher from "@/hooks/use-pusher";
import { Transaction } from "@/types";

import { InvoiceHeader } from "@/components/invoice/Header";
import { InvoiceGameInfo } from "@/components/invoice/GameInfo";
import { InvoicePaymentDetails } from "@/components/invoice/PaymentDetails";
import { InvoicePaymentMethod } from "@/components/invoice/PaymentMethod";
import { InvoiceCountdown } from "@/components/invoice/Countdown";
import { InvoicePaymentInstructions } from "@/components/invoice/PaymentInstructions";
import { ProgressBar } from "@/components/invoice/ProgressBar";
import ReviewModal from "@/components/invoice/ReviewModal";

// Animasi Lottie
import animationWaitingPayment from "@/data/lottie/payment-waiting.json";
import animationBuyProcess from "@/data/lottie/buy-process.json";
import animationBuySuccess from "@/data/lottie/buy-success.json";
import animationFailed from "@/data/lottie/failed.json";

export default function InvoicePage() {
    const { orderId } = useParams();
    const [game, setGame] = useState<any>(null);
    const [order, setOrder] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [showReview, setShowReview] = useState(false);
    const { transactions } = usePusher();

    // 🚀 Ambil data order
    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/order/${orderId}`);
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

                const data = await res.json();
                if (data.success) {
                    const fixedOrder = {
                        ...data.order,
                        quantity: data.order?.quantity ?? 1
                    };

                    setOrder(fixedOrder);
                    setGame(data.game || null);

                    // 🔹 Jika status sukses → tampilkan modal review
                    if (fixedOrder.buy_status === "Sukses") {
                        const localKey = `review_${fixedOrder.order_id}`;

                        try {
                            const checkRes = await fetch(
                                `/api/reviews?order_id=${fixedOrder.order_id}`
                            );
                            const checkData = await checkRes.json();

                            if (!checkData.exists) {
                                const alreadyShown = localStorage.getItem(localKey);
                                if (!alreadyShown) {
                                    setTimeout(() => setShowReview(true), 1200);
                                }
                            } else {
                                localStorage.removeItem(localKey);
                            }
                        } catch (err) {
                            console.warn("Gagal memeriksa review:", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (!order?.order_id || transactions.length === 0) return;

        const updatedTransaction = transactions.find(
            (t) => t.order_id === order.order_id
        );

        if (updatedTransaction) {
            const { payment_status, buy_status } = updatedTransaction;
            if (
                payment_status !== order.payment_status ||
                buy_status !== order.buy_status
            ) {
                setOrder((prev: Transaction | null) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        payment_status,
                        buy_status
                    };
                });
            }
        }
    }, [transactions, order]);

    // ⏱️ Hitung waktu expired
    useEffect(() => {
        if (!order?.expired_time) return;

        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const diff = order.expired_time - now;

            if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

            return {
                hours: Math.floor(diff / 3600),
                minutes: Math.floor((diff % 3600) / 60),
                seconds: diff % 60
            };
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

        return () => clearInterval(interval);
    }, [order]);

    // 💬 Helper status
    const getPayStatusMessage = () => {
        if (!order) return "Pesanan tidak ditemukan.";
        switch (order.payment_status) {
            case "UNPAID":
                return "Menunggu Pembayaran";
            case "REFUNDED":
                return "Dana Dikembalikan"
            case "PAID":
                return "Pembayaran Berhasil";
            case "EXPIRED":
                return "Pembayaran Kadaluarsa";
            case "FAILED":
                return "Pembayaran Gagal";
            default:
                return "Status Pembayaran Tidak Diketahui.";
        }
    };

    const getBuyStatusMessage = () => {
        if (!order) return "Pesanan tidak ditemukan.";

        if (order.payment_status === "UNPAID")
            return "Silakan lakukan pembayaran dengan metode yang kamu pilih.";

        if (
            order.buy_status === "Batal" &&
            order.payment_status === "REFUNDED"
        ) {
            return "Dana telah dikembalikan ke saldo akun kamu.";
        }

        switch (order.buy_status) {
            case "Proses":
                return "Pembelian sedang dalam proses.";
            case "Pending":
                return "Pembelian sedang dalam Pending.";
            case "Sukses":
                return "Transaksi telah berhasil dilakukan.";
            case "Gagal":
                return "Pembelian gagal, hubungi layanan pelanggan.";
            case "Batal":
                return "Batas waktu pembayaran telah berakhir.";
            default:
                return "Status Pesanan Tidak Diketahui.";
        }
    };

    // 🎨 Warna & Animasi
    const getLottieAnimation = () => {
        if (!order) return animationWaitingPayment;
        if (order.payment_status === "UNPAID") return animationWaitingPayment;
        if (["EXPIRED", "FAILED"].includes(order.payment_status))
            return animationFailed;
        if (order.buy_status === "Proses") return animationBuyProcess;
        if (order.buy_status === "Sukses") return animationBuySuccess;
        if (["Batal", "Gagal"].includes(order.buy_status)) return animationFailed;
        return animationWaitingPayment;
    };

    const getBackgroundColor = () => {
        if (!order) return "bg-gray-500";

        if (
            order.buy_status === "Batal" &&
            order.payment_status === "REFUNDED"
        ) {
            return "bg-sky-600";
        }
        switch (order.buy_status) {
            case "Pending":
                return "bg-yellow-500";
            case "Proses":
                return "bg-blue-500";
            case "Sukses":
                return "bg-green-500";
            case "Gagal":
            case "Batal":
                return "bg-red-600";
            default:
                return "bg-gray-500";
        }
    };

    const getBackgroundBuyStatusColor = () => {
        if (!order) return "bg-muted";
        switch (order.buy_status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Proses":
                return "bg-blue-100 text-blue-800";
            case "Sukses":
                return "bg-green-100 text-green-800";
            case "Gagal":
            case "Batal":
                return "bg-red-100 text-red-800";
            default:
                return "bg-muted";
        }
    };

    const getBackgroundPayStatusColor = () => {
        if (!order) return "bg-muted";
        switch (order.payment_status) {
            case "UNPAID":
                return "bg-yellow-100 text-yellow-800";
            case "EXPIRED":
            case "FAILED":
                return "bg-red-100 text-red-800";
            case "PAID":
                return "bg-green-100 text-green-800";
            case "REFUNDED":
                return "bg-purple-100 text-purple-800";

            default:
                return "bg-muted";
        }
    };

    const handleCopy = (value: string, label: string) => {
        navigator.clipboard.writeText(value ?? "");
        toast.success(`${label} berhasil disalin!`);
    };

    if (loading)
        return (
            <ContentLayout title="Invoices">
                <div className="w-full h-[80vh] flex justify-center items-center">
                    <LoadingSpinner size={40} />
                </div>
            </ContentLayout>
        );

    if (!order)
        return (
            <ContentLayout title="Invoices">
                <p className="text-red-500 text-lg font-semibold">
                    Invoice tidak ditemukan.
                </p>
            </ContentLayout>
        );

    // 🧾 Tampilan utama
    return (
        <ContentLayout title="Invoices">
            <main className="relative">
                <InvoiceHeader
                    order={order}
                    getLottieAnimation={getLottieAnimation}
                    getPayStatusMessage={getPayStatusMessage}
                    getBuyStatusMessage={getBuyStatusMessage}
                    getBackgroundColor={getBackgroundColor}
                />

                <div className="container w-full mx-auto px-2 lg:px-8 mt-8 space-y-4 lg:mt-12 lg:space-y-12">
                    <div className="flex flex-col gap-4">
                        <ProgressBar order={order} />

                        {order.payment_status === "UNPAID" ? (
                            <InvoiceCountdown timeLeft={timeLeft} />
                        ) : (
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="mt-4"
                            >
                                {new Date(order.created_at).toLocaleString()}
                            </motion.p>
                        )}

                        <div className="grid grid-cols-12 gap-y-8 md:gap-8">
                            <div className="col-span-12 sm:col-span-8 md:col-span-6 space-y-4">
                                <InvoiceGameInfo order={order} game={game} />
                                {/* ✅ Sudah otomatis tampilkan quantity di dalam */}
                                <InvoicePaymentDetails order={order} />
                            </div>

                            <div className="col-span-12 sm:col-span-6">
                                <InvoicePaymentMethod
                                    order={order}
                                    handleCopyPayCode={() =>
                                        handleCopy(order.payment_code ?? "", "Kode pembayaran")
                                    }
                                    handleCopyOrderId={() =>
                                        handleCopy(order.order_id ?? "", "Nomor Invoice")
                                    }
                                    handleCopySn={() =>
                                        handleCopy(order.serial_number ?? "", "SN")
                                    }
                                    getBackgroundPayStatusColor={getBackgroundPayStatusColor}
                                    getBackgroundBuyStatusColor={getBackgroundBuyStatusColor}
                                    getBuyStatusMessage={getBuyStatusMessage}
                                />
                            </div>

                            {order.payment_status === "UNPAID" && (
                                <InvoicePaymentInstructions order={order} />
                            )}
                        </div>
                    </div>
                </div>

                {showReview && (
                    <ReviewModal order={order} onClose={() => setShowReview(false)} />
                )}
            </main>
        </ContentLayout>
    );
}
