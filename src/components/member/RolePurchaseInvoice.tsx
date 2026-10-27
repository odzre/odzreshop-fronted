"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, XCircle, Loader2, Copy } from "lucide-react";

interface Purchase {
    invoice_number: string;
    role: string;
    price: string | number;
    payment_mode: string;
    payment_name: string | null;
    payment_method: string | null;
    payment_code: string | null;
    payment_data: {
        account_name?: string | null;
        account_number?: string | null;
        manual_qris?: string | null;
        pay_url?: string | null;
        payment_code?: string | null;
        payment_guide?: string | null;
    } | null;
    payment_status: string;
    status_desc: string | null;
    expired_at: string | null;
}

const ROLE_BADGE: Record<string, string> = {
    gold: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    platinum: "bg-blue-800/20 text-blue-700 border-blue-800/30 dark:text-blue-400",
    reseller: "bg-red-500/15 text-red-500 border-red-500/30"
};

function formatRupiah(value: number | string): string {
    const n = typeof value === "string" ? parseFloat(value) : value;
    return "Rp " + new Intl.NumberFormat("id-ID").format(n || 0);
}

export default function RolePurchaseInvoice() {
    const { data: session, status, update } = useSession();
    const params = useParams();
    const router = useRouter();
    const invoice = params?.invoice as string;

    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<string>("");
    const [upgraded, setUpgraded] = useState(false);

    const fetchData = useCallback(async () => {
        if (!invoice) return;

        try {
            let deviceId = localStorage.getItem("device_id");
            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            const res = await fetch(`/api/role-purchases/${invoice}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-Device-Id": deviceId ?? ""
                },
                cache: "no-store"
            });

            const data = await res.json();

            if (data.success) {
                const prev = purchase?.payment_status;
                const next = data.data.purchase.payment_status;

                setPurchase(data.data.purchase);

                if (prev && prev === "PENDING" && next === "PAID" && !upgraded) {
                    setUpgraded(true);
                    toast.success(`Selamat! Role Anda sekarang ${String(data.data.purchase.role).toUpperCase()}`);
                    // 🔥 update session realtime dengan role baru dari response polling
                    await update({ role: data.data.role ?? data.data.purchase.role });
                    setTimeout(() => router.push("/upgrade-roles"), 2500);
                }
            }
        } catch {
            // silent — polling
        } finally {
            setLoading(false);
        }
    }, [invoice, purchase?.payment_status, upgraded, update, router]);

    // initial load
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoice]);

    // polling setiap 5 detik selama PENDING
    useEffect(() => {
        if (purchase?.payment_status !== "PENDING") return;

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [purchase?.payment_status, fetchData]);

    // countdown expired
    useEffect(() => {
        if (!purchase?.expired_at || purchase.payment_status !== "PENDING") return;

        const tick = () => {
            const exp = new Date(purchase.expired_at!).getTime();
            const diff = exp - Date.now();

            if (diff <= 0) {
                setCountdown("Kadaluarsa");
                return;
            }

            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${m}:${s.toString().padStart(2, "0")}`);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [purchase?.expired_at, purchase?.payment_status]);

    // QR generate
    useEffect(() => {
        const code = purchase?.payment_data?.payment_code ?? purchase?.payment_code;

        if (code && code.startsWith("000201")) {
            QRCode.toDataURL(code, { width: 240 })
                .then(setQrImage)
                .catch(() => setQrImage(null));
        }
    }, [purchase?.payment_code, purchase?.payment_data]);

    if (status === "loading" || loading) {
        return (
            <div className="w-full max-w-md mx-auto space-y-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="w-full max-w-md mx-auto rounded-xl border border-muted bg-card p-8 text-center space-y-3">
                <XCircle className="h-10 w-10 mx-auto text-red-500" />
                <h1 className="text-lg font-bold">Invoice Tidak Ditemukan</h1>
                <Button onClick={() => router.push("/upgrade-roles")} variant="outline">
                    Kembali
                </Button>
            </div>
        );
    }

    const isPending = purchase.payment_status === "PENDING";
    const isPaid = purchase.payment_status === "PAID";

    const payCode = purchase.payment_data?.payment_code ?? purchase.payment_code;
    const isQr = payCode?.startsWith("000201") ?? false;
    const isUrl = payCode?.startsWith("http") ?? false;

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            {/* HEADER STATUS */}
            <div
                className={`rounded-xl border p-5 text-center space-y-2 ${
                    isPaid
                        ? "border-green-500/40 bg-green-500/10"
                        : isPending
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-red-500/40 bg-red-500/10"
                }`}
            >
                {isPaid ? (
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                ) : isPending ? (
                    <Clock className="h-12 w-12 mx-auto text-amber-500" />
                ) : (
                    <XCircle className="h-12 w-12 mx-auto text-red-500" />
                )}

                <h1 className="text-lg font-bold">
                    {isPaid ? "Pembayaran Berhasil!" : isPending ? "Menunggu Pembayaran" : "Pembayaran Gagal/Kadaluarsa"}
                </h1>

                {isPending && countdown && (
                    <p className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400">
                        Berakhir dalam {countdown}
                    </p>
                )}

                {isPaid && (
                    <p className="text-sm text-muted-foreground">
                        Role Anda sekarang{" "}
                        <span className="font-bold uppercase">{purchase.role}</span>. Mengalihkan...
                    </p>
                )}
            </div>

            {/* DETAIL INVOICE */}
            <div className="rounded-xl border border-muted bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Invoice</span>
                    <button
                        type="button"
                        className="flex items-center gap-1 text-sm font-mono font-semibold hover:text-primary"
                        onClick={() => {
                            navigator.clipboard.writeText(purchase.invoice_number);
                            toast.success("Invoice disalin");
                        }}
                    >
                        {purchase.invoice_number}
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${ROLE_BADGE[purchase.role] ?? ""}`}>
                        {purchase.role}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Metode</span>
                    <span className="text-sm font-medium">{purchase.payment_name}</span>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-lg font-bold">{formatRupiah(purchase.price)}</span>
                </div>
            </div>

            {/* PEMBAYARAN */}
            {isPending && payCode && (
                <div className="rounded-xl border border-muted bg-card p-5 space-y-4">
                    <h2 className="text-sm font-bold">Pembayaran</h2>

                    {isQr && qrImage && (
                        <div className="flex flex-col items-center gap-3">
                            <img src={qrImage} alt="QR Payment" className="h-56 w-56 rounded-lg border bg-white p-2" />
                            <p className="text-xs text-muted-foreground">Scan QRIS dengan aplikasi e-wallet/m-banking</p>
                        </div>
                    )}

                    {isUrl && (
                        <a
                            href={payCode}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            <Loader2 className="hidden" />
                            Bayar Sekarang
                        </a>
                    )}

                    {!isQr && !isUrl && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Nomor/Kode Pembayaran:</p>
                            <div className="flex items-center justify-between rounded-lg border border-muted bg-muted/30 p-3">
                                <span className="font-mono font-semibold">{payCode}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(payCode ?? "");
                                        toast.success("Disalin");
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                            {purchase.payment_data?.account_name && (
                                <p className="text-xs text-muted-foreground">a.n. {purchase.payment_data.account_name}</p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Status pembayaran diperiksa otomatis setiap 5 detik
                    </div>
                </div>
            )}

            {isPaid && (
                <Button onClick={() => router.push("/upgrade-roles")} className="w-full">
                    Selesai
                </Button>
            )}

            {isPending && (
                <Button onClick={() => router.push("/upgrade-roles")} variant="outline" className="w-full">
                    Kembali
                </Button>
            )}
        </div>
    );
}
