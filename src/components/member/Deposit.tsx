"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ConfirmDrawerDeposit from "@/components/member/ConfirmDrawerDeposit";
import type { PaymentMethod } from "@/types";
import { useCurrency } from "@/hooks/useCurrency";

export default function Deposit() {
    const router = useRouter();
    const { format } = useCurrency();

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(50000);
    const [customAmount, setCustomAmount] = useState<number | null>(50000);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const nominalOptions = [
        20000, 50000, 100000, 150000, 200000, 300000, 500000, 1000000
    ];

    useEffect(() => {
        const fetchMethods = async () => {
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
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    toast.error(data.message || "Gagal memuat metode pembayaran");
                    return;
                }

                setMethods(data.data?.methods ?? []);
            } catch (error) {
                console.error(error);
                toast.error("Gagal memuat metode pembayaran.");
            } finally {
                setLoading(false);
            }
        };

        fetchMethods();
    }, []);

    const totalToPay = useMemo(() => {
        const base = Number(customAmount || selectedAmount || 0);
        if (!selectedMethod) return base;

        const flat = Number(selectedMethod.fee) || 0;
        const percent = Number(selectedMethod.fee_percent) || 0;

        const percentFee = Math.floor((percent * base) / 100);
        return base + flat + percentFee;
    }, [selectedMethod, selectedAmount, customAmount]);

    const openConfirm = () => {
        if (!customAmount && !selectedAmount) {
            toast.error("Masukkan nominal deposit terlebih dahulu!");
            return;
        }
        if (!selectedMethod) {
            toast.error("Pilih metode pembayaran terlebih dahulu!");
            return;
        }
        if (!selectedMethod.code) {
            toast.error("Metode pembayaran tidak memiliki kode valid!");
            return;
        }
        setConfirmOpen(true);
    };

    const handleTopup = async () => {
        if (!selectedMethod?.code) {
            toast.error("Metode pembayaran tidak valid!");
            return;
        }

        const amount = customAmount || selectedAmount || 0;
        setSubmitting(true);

        try {
            let deviceId = localStorage.getItem("device_id");

            // 🔥 wait device_id
            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            if (!deviceId) {
                toast.error("Device tidak valid, refresh halaman");
                return;
            }

            const res = await fetch("/api/deposit", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-Device-Id": deviceId,
                },
                body: JSON.stringify({
                    amount,
                    method_code: selectedMethod.code
                })
            });

            const result = await res.json();

            if (!res.ok || result.success === false) {
                toast.error(result.message);
                return;
            }

            toast.success(result.message);
            const invoice = result.data?.deposit?.invoice_number;
            if (invoice) {
                setTimeout(() => router.push(`/deposit/${invoice}`), 800);
            }
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat membuat deposit.");
        } finally {
            setSubmitting(false);
            setConfirmOpen(false);
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <LoadingSpinner size={40} />
            </div>
        );

    return (
        <div className="col-span-6 space-y-6">
            <h2 className="text-lg font-semibold">Top Up Saldo</h2>

            {/* ================= NOMINAL ================= */}
            <section className="rounded-xl bg-background/90 shadow-sm ring-1 ring-border">
                <div className="flex items-center bg-muted rounded-t-xl">
                    <h2 className="ml-3 text-sm font-semibold py-2">
                        Pilih Nominal
                    </h2>
                </div>

                <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {nominalOptions.map((nominal) => {
                            const selected = selectedAmount === nominal;

                            return (
                                <label
                                    key={nominal}
                                    className={cn(
                                        "relative flex cursor-pointer flex-col justify-center rounded-xl border border-transparent bg-muted p-3 shadow-sm",
                                        selected
                                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            : "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="nominal"
                                        className="sr-only"
                                        checked={selected}
                                        onChange={() => {
                                            setSelectedAmount(nominal);
                                            setCustomAmount(nominal);
                                        }}
                                    />

                                    <span className="text-xs text-muted-foreground">
                                        Credits
                                    </span>
                                    <span className="font-semibold text-sm md:text-base">
                                        {format(nominal)}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {/* INPUT CUSTOM */}
                    <div className="border-t pt-4 space-y-3">
                        <label className="text-sm text-muted-foreground">
                            Atau Masukkan Nominal
                        </label>

                        <Input
                            type="number"
                            value={customAmount || ""}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setCustomAmount(val > 0 ? val : null);
                                setSelectedAmount(null);
                            }}
                            placeholder="Masukkan nominal"

                        />

                        <p className="text-xs text-muted-foreground">
                            Minimal deposit:{" "}
                            <span className="font-semibold text-primary">
                                {format(20000)}
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= PAYMENT ================= */}
            <section className="rounded-xl bg-background/90 shadow-sm ring-1 ring-border">
                <div className="flex items-center bg-muted rounded-t-xl">
                    <h2 className="ml-3 text-sm font-semibold py-2">
                        Pilih Pembayaran
                    </h2>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
                        {methods.map((method) => {
                            const selected = selectedMethod?.id === method.id;

                            const baseAmount = Number(customAmount || selectedAmount || 0);
                            const flatFee = Number(method.fee) || 0;
                            const percentFee = Number(method.fee_percent) || 0;

                            const total =
                                baseAmount +
                                flatFee +
                                Math.floor((percentFee * baseAmount) / 100);

                            return (
                                <label
                                    key={method.id}
                                    className={cn(
                                        "relative flex cursor-pointer flex-col justify-between rounded-lg border border-transparent bg-muted p-3 shadow-sm",
                                        selected
                                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            : "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="sr-only"
                                        checked={selected}
                                        onChange={() => setSelectedMethod(method)}
                                    />

                                    <div>
                                        {method.images && (
                                            <Image
                                                src={method.images}
                                                alt={method.name}
                                                width={100}
                                                height={30}
                                                className="max-h-5 object-contain"
                                            />
                                        )}
                                    </div>

                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span>{method.name}</span>
                                            <span className="text-primary">
                                                {format(total)}
                                            </span>
                                        </div>

                                        <div className="mt-1 h-px bg-secondary/20" />

                                        <span className="text-xxs italic text-muted-foreground">
                                            {percentFee > 0
                                                ? `Fee +${format(flatFee)} + ${percentFee}%`
                                                : `Fee +${format(flatFee)}`}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* BUTTON */}
            <div className="pt-4 border-t flex justify-end">
                <Button
                    onClick={openConfirm}
                    disabled={submitting}
                    className="w-full md:w-auto bg-my-color3 text-primary-foreground"
                >
                    {submitting ? (
                        <>
                            <LoadingSpinner size={18} /> &nbsp; Memproses...
                        </>
                    ) : (
                        "Lanjutkan Pembayaran"
                    )}
                </Button>
            </div>

            {/* DRAWER */}
            <ConfirmDrawerDeposit
                isOpen={confirmOpen}
                onOpenChange={setConfirmOpen}
                amount={customAmount || selectedAmount || 0}
                methodName={selectedMethod?.name || ""}
                fee={selectedMethod?.fee || 0}
                feePercent={selectedMethod?.fee_percent || 0}
                total={totalToPay}
                submitting={submitting}
                onConfirm={handleTopup}
            />
        </div>
    );
}