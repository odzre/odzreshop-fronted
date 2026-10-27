import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Transaction } from "@/types";

export default function usePusher() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const pusherRef = useRef<Pusher | null>(null);

    // 🧹 Normalize status agar tidak pernah "" atau undefined
    const normalizeStatus = (value: any) => {
        if (!value) return null;            // hindari string kosong
        return String(value).toUpperCase(); // seragam uppercase
    };

    useEffect(() => {
        if (pusherRef.current) return; // ⚡ Hindari koneksi ganda

        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!pusherKey || !pusherCluster) return;

        // 🚀 Inisialisasi koneksi
        const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
            forceTLS: true,
            enabledTransports: ["ws", "wss"]
        });
        pusherRef.current = pusher;

        // Channel
        const paymentsChannel = pusher.subscribe("payments");
        const buyStatusChannel = pusher.subscribe("buystatus");
        const depositChannel = pusher.subscribe("deposits");

        // 🧩 Fungsi update transaksi (termasuk quantity)
        const updateTransaction = (data: any) => {
            if (!data?.order_id) return;

            setTransactions((prev) => {
                const existingIndex = prev.findIndex(
                    (t) => t.order_id === data.order_id
                );

                if (existingIndex !== -1) {
                    // ✅ Update transaksi lama (fungsi asli tidak diubah)
                    return prev.map((t, i) =>
                        i === existingIndex
                            ? {
                                ...t,
                                payment_status:
                                    normalizeStatus(data.payment_status) ??
                                    t.payment_status ??
                                    "UNPAID",

                                buy_status:
                                    normalizeStatus(data.buy_status) ??
                                    t.buy_status ??
                                    "PENDING",

                                discount_voucher:
                                    data.discount_voucher ?? t.discount_voucher,
                                code_voucher: data.code_voucher ?? t.code_voucher,
                                order_inputs: data.order_inputs ?? t.order_inputs,
                                quantity: data.quantity ?? t.quantity ?? 1,
                                fee: data.fee ?? t.fee,
                                total_price: data.total_price ?? t.total_price
                            }
                            : t
                    );
                } else {
                    // ✅ Tambah transaksi baru (fungsi asli tetap)
                    return [
                        ...prev,
                        {
                            order_id: data.order_id,
                            games: data.games ?? "",
                            product: data.product ?? "",
                            id_games: data.id_games ?? "",
                            server_games: data.server_games ?? null,
                            order_inputs: data.order_inputs ?? null,
                            nickname: data.nickname ?? null,
                            price: data.price ?? 0,
                            fee: data.fee ?? 0,
                            discount_price: data.discount_price ?? 0,
                            discount_voucher: data.discount_voucher ?? 0,
                            code_voucher: data.code_voucher ?? null,
                            promo_price: data.promo_price ?? 0,
                            total_price: data.total_price ?? 0,
                            payment_name: data.payment_name ?? "",
                            payment_method: data.payment_method ?? "",
                            payment_code: data.payment_code ?? "",
                            payment_status: data.payment_status ?? "",
                            buy_status: data.buy_status ?? "",
                            payment_instructions: data.payment_instructions ?? [],
                            serial_number: data.serial_number ?? "",
                            expired_time: data.expired_time ?? 0,
                            created_at: data.created_at ?? "",
                            quantity: data.quantity ?? 1
                        }
                    ];
                }
            });
        };

        const updateDeposit = (data: any) => {
            if (!data?.invoice) return;

            setDeposits((prev) => {
                const index = prev.findIndex((d) => d.invoice === data.invoice);

                if (index !== -1) {
                    return prev.map((d, i) =>
                        i === index
                            ? {
                                ...d,
                                payment_status:
                                    normalizeStatus(data.payment_status) ??
                                    d.payment_status ??
                                    "UNPAID",
                            }
                            : d
                    );
                }

                return [
                    ...prev,
                    {
                        invoice: data.invoice,
                        payment_status: normalizeStatus(data.payment_status) ?? "UNPAID",
                    },
                ];
            });
        };

        const handleBuyStatusUpdate = (data: any) => {
            if (!data || typeof data !== "object" || !data.order_id || !data.buy_status) return;

            setTransactions((prev: Transaction[]) =>
                prev.map((t) =>
                    t.order_id === data.order_id ? { ...t, buy_status: data.buy_status } : t
                )
            );
        };

        // 🔔 Bind event
        paymentsChannel.bind("payment.updated", updateTransaction);
        buyStatusChannel.bind("buystatus.updated", updateTransaction);
        depositChannel.bind("deposit.updated", updateDeposit);

        // 🧹 Cleanup
        const cleanup = () => {
            paymentsChannel.unbind_all();
            buyStatusChannel.unbind_all();
            pusher.unsubscribe("payments");
            pusher.unsubscribe("buystatus");
            pusher.disconnect();
            pusherRef.current = null;
            depositChannel.unbind_all();
            pusher.unsubscribe("deposits");
        };

        window.addEventListener("beforeunload", cleanup);
        return () => {
            cleanup();
            window.removeEventListener("beforeunload", cleanup);
        };
    }, []);

    return { transactions, deposits };
}
