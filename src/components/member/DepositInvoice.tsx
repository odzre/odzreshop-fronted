"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import usePusher from "@/hooks/use-pusher";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSettings } from "@/context/settings-context";
import QRCode from "qrcode";
import { useCurrency } from "@/hooks/useCurrency";

interface Deposit {
    invoice_number: string;
    payment_name: string;
    payment_method: string;
    payment_code: string | null;
    payment_status: string;
    amount: number;
    fee: number;
    total_amount: number;
    expired_at: string;
    created_at: string;
    payment_instructions?: any[];
    payment?: Payment;
}

interface Payment {
    account_name?: string | null;
    account_number?: string | null;
    manual_qris?: string | null;
    pay_url?: string | null;
    payment_code?: string | null;
    payment_guide?: any[] | string | null;
}

export default function DepositInvoice() {
    const { invoice } = useParams();
    const router = useRouter();
    const { format } = useCurrency();
    const { data: settings } = useSettings() as any;
    const waNumber = settings?.["sosmed.wa"] ?? "6282277113307";
    const { deposits } = usePusher();

    const [deposit, setDeposit] = useState<Deposit | null>(null);
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [odzreQrisUrl, setOdzreQrisUrl] = useState<string | null>(null);
    const [odzreQrisString, setOdzreQrisString] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState("0 detik");
    const statusMessage: Record<string, string> = {
        PAID: "Saldo kamu telah ditambahkan ke akun.",
        UNPAID: "Deposit kamu menunggu pembayaran sebelum diproses.",
        FAILED: "Deposit kamu telah dibatalkan.",
        EXPIRED: "Deposit kamu telah kedaluwarsa. Silakan lakukan transaksi lagi.",
    };

    useEffect(() => {
        if (!deposit || !deposits?.length) return;

        const updated = deposits.find(
            (d: any) => d.invoice === deposit.invoice_number
        );

        if (!updated) return;

        if (updated.payment_status !== deposit.payment_status) {
            setDeposit((prev) =>
                prev
                    ? {
                        ...prev,
                        payment_status: updated.payment_status,
                    }
                    : prev
            );

            toast.success("Status pembayaran diperbarui!");
        }
    }, [deposits]);

    useEffect(() => {
        const fetchData = async () => {
            const session = await getSession();
            if (!session) return router.push("/signin");

            try {
                let deviceId = localStorage.getItem("device_id");

                if (!deviceId) {
                    await new Promise((r) => setTimeout(r, 300));
                    deviceId = localStorage.getItem("device_id");
                }

                if (!deviceId) {
                    toast.error("Device tidak valid");
                    return;
                }

                const res = await fetch(`/api/deposit/${invoice}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                        "X-Device-Id": deviceId,
                        Accept: "application/json",
                    },
                    cache: "no-store",
                });

                const data = await res.json();

                if (data.success) {
                    setDeposit(data.data.deposit);
                    setPayment(data.data.payment ?? null);
                } else {
                    toast.error(data.message || "Gagal memuat invoice");
                }
            } catch {
                toast.error("Terjadi kesalahan memuat invoice.");
            } finally {
                setLoading(false);
            }
        };

        if (invoice) fetchData();
    }, [invoice, router]);

    useEffect(() => {
        if (!deposit?.payment_code) return;

        const isQrString = deposit.payment_code.startsWith("000201");

        if (isQrString) {
            QRCode.toDataURL(deposit.payment_code)
                .then(setQrImage)
                .catch(() => setQrImage(null));
        }

        // Parse QRIS dari payment_instructions untuk Odzre
        const odzreMethods = ["GOPAY_MERCHANT", "ORDERKOUTA", "ODZREPAY"];
        if (odzreMethods.includes(deposit.payment_method?.toUpperCase()) && deposit.payment_instructions) {
            try {
                const instr = typeof deposit.payment_instructions === "string"
                    ? JSON.parse(deposit.payment_instructions)
                    : deposit.payment_instructions;
                const instrObj = Array.isArray(instr) ? instr[0] : instr;
                setOdzreQrisUrl(instrObj?.qris_url ?? null);
                setOdzreQrisString(instrObj?.qris_string ?? null);
            } catch {
                // ignore
            }
        }
    }, [deposit]);


    useEffect(() => {
        if (!deposit?.expired_at) return;

        const target = Math.floor(new Date(deposit.expired_at).getTime() / 1000);

        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(interval);
            } else {
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60);
                const s = diff % 60;
                setTimeLeft(`${h} jam, ${m} menit, ${s} detik`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [deposit]);

    const handleCancel = async () => {
        if (!deposit?.invoice_number) return;

        if (deposit.payment_status !== "UNPAID") {
            toast.error("Transaksi tidak bisa dibatalkan");
            return;
        }

        if (!confirm("Yakin ingin membatalkan deposit ini?")) return;

        try {
            const session = await getSession();

            let deviceId = localStorage.getItem("device_id");

            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            if (!deviceId) {
                toast.error("Device tidak valid");
                return;
            }

            const res = await fetch(`/api/deposit/${deposit.invoice_number}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                    "X-Device-Id": deviceId,
                    Accept: "application/json",
                },
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                toast.error(result.message || "Gagal membatalkan deposit");
                return;
            }

            toast.success("Deposit berhasil dibatalkan");

            // ✅ redirect ke halaman list deposit
            router.replace("/member/deposit");

        } catch {
            toast.error("Terjadi kesalahan saat membatalkan");
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <LoadingSpinner size={40} />
            </div>
        );

    if (!deposit)
        return (
            <div className="py-20 text-center text-muted-foreground">
                Deposit tidak ditemukan.
            </div>
        );

    const isImageQr =
        deposit.payment_code &&
        /\.(png|jpg|jpeg|webp)$/i.test(deposit.payment_code);

    const isQrString =
        deposit.payment_code?.startsWith("000201");

    const isManualPayment = !!payment?.account_number;

    const showPaymentCode =
        deposit.payment_code && !isManualPayment && !isImageQr && !isQrString;

    const CopyButton = ({
        value,
        label,
    }: {
        value: string;
        label?: string;
    }) => (
        <button
            type="button"
            className="border-murky-400 bg-murky-600 hover:bg-murky-700 flex items-center space-x-2 rounded-md border px-2.5 py-1"
            onClick={() => {
                navigator.clipboard.writeText(value);
                toast.success(`${label || "Data"} disalin!`);
            }}
        >
            <div className="max-w-[172px] truncate md:w-auto md:max-w-none">
                {value}
            </div>

            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-4"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                />
            </svg>
        </button>
    );

    return (
        <div className="py-12 md:py-8 print:py-8">
            <div className="max-w-3xl">
                <h1 className="text-base font-medium text-primary">Terima Kasih!</h1>
                <p className="mt-2 text-base text-foreground">
                    {statusMessage[deposit.payment_status] || "Status tidak diketahui."}
                </p>
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-8 md:flex-row">
                <dl className="text-sm font-medium">
                    <dt className="text-foreground">Nomor Invoice</dt>
                    <dd className="mt-2 flex items-center space-x-4">
                        <CopyButton
                            value={deposit.invoice_number}
                            label="Nomor invoice"
                        />
                    </dd>
                </dl>

                {deposit.payment_status === "UNPAID" && (
                    <dl className="w-full text-left text-sm font-medium md:w-auto md:text-right">
                        <dt className="text-foreground">Pesanan ini akan kedaluwarsa pada</dt>
                        <dd className="mt-2 text-primary">
                            <div className="rounded-md bg-destructive/90 px-4 py-2 text-center text-foreground">
                                {timeLeft}
                            </div>
                        </dd>
                    </dl>
                )}
            </div>

            {/* DETAIL PEMBAYARAN */}
            <div className="mt-10 border-t pt-8 text-sm text-foreground">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="font-medium">Metode Pembayaran</div>
                    <div className="col-span-3">{deposit.payment_name}</div>
                </div>
                {deposit.payment_status === "UNPAID" && (
                    <>
                        {/* NOMOR PEMBAYARAN */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="font-medium">Nomor Pembayaran</div>
                            <div className="col-span-3">
                                {/* QRIS untuk Odzre (GoPay Merchant / OrderKuota) */}
                                {["GOPAY_MERCHANT", "ORDERKOUTA", "ODZREPAY"].includes(deposit.payment_method?.toUpperCase()) ? (
                                    <div className="flex flex-col items-center justify-center mt-2">
                                        {odzreQrisUrl ? (
                                            <Image
                                                src={odzreQrisUrl}
                                                alt="QRIS Payment"
                                                width={240}
                                                height={240}
                                                className="rounded-lg border bg-white p-2"
                                            />
                                        ) : odzreQrisString ? (
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(odzreQrisString)}`}
                                                alt="QRIS Payment"
                                                width={240}
                                                height={240}
                                                className="rounded-lg border bg-white p-2"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Memuat QRIS...</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Scan QRIS ini untuk melakukan pembayaran.
                                        </p>
                                    </div>
                                ) : isQrString && qrImage ? (
                                    <div className="flex flex-col items-center justify-center mt-2">
                                        <Image
                                            src={qrImage}
                                            alt="QRIS Duitku"
                                            width={240}
                                            height={240}
                                            className="rounded-lg border bg-white p-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Scan QRIS ini untuk melakukan pembayaran.
                                        </p>
                                    </div>
                                ) : showPaymentCode ? (
                                    <button
                                        type="button"
                                        className="border border-muted bg-muted/40 hover:bg-muted/60 flex items-center space-x-2 rounded-md px-2.5 py-1"
                                        onClick={() => {
                                            navigator.clipboard.writeText(deposit.payment_code!);
                                            toast.success("Nomor pembayaran disalin!");
                                        }}
                                    >
                                        <div className="max-w-[172px] truncate">
                                            {deposit.payment_code}
                                        </div>
                                    </button>
                                ) : isImageQr ? (
                                    <div className="flex flex-col items-center justify-center mt-2">
                                        <Image
                                            src={deposit.payment_code!}
                                            alt="QRIS Otomatis"
                                            width={240}
                                            height={240}
                                            className="rounded-lg border bg-white p-2"
                                        />
                                    </div>
                                ) : isManualPayment ? (
                                    <>
                                        <div className="flex justify-between text-sm py-1">
                                            <span>Nama Rekening</span>
                                            <span className="font-medium">{payment?.account_name}</span>
                                        </div>

                                        <div className="flex justify-between text-sm py-1">
                                            <span>No. Rekening</span>
                                            <button
                                                type="button"
                                                className="border border-muted bg-muted/40 hover:bg-muted/60 flex items-center rounded-md px-2.5 py-1 text-primary font-medium"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(payment?.account_number ?? "");
                                                    toast.success("Nomor rekening disalin!");
                                                }}
                                            >
                                                {payment?.account_number}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <span>-</span>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* QRIS MANUAL */}
                {payment?.manual_qris && (
                    <div className="flex flex-col items-center justify-center mt-6">
                        <Image
                            src={payment.manual_qris}
                            alt="QRIS Manual"
                            width={240}
                            height={240}
                            className="rounded-lg border bg-white p-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Scan QRIS manual di atas.
                        </p>
                    </div>
                )}

                {/* STATUS PEMBAYARAN */}
                <div className="border-secondary-600 mt-8 grid w-full grid-cols-2 gap-4 border-t pt-8 text-left text-foreground">
                    <div>Status Pembayaran</div>
                    <div>
                        <button
                            type="button"
                            className={`inline-flex cursor-default rounded-sm px-2 text-xs font-semibold uppercase leading-5 print:p-0 ${deposit.payment_status === "PAID"
                                ? "bg-green-300 text-green-800"
                                : deposit.payment_status === "UNPAID"
                                    ? "bg-rose-300 text-rose-800"
                                    : deposit.payment_status === "FAILED" || deposit.payment_status === "EXPIRED"
                                        ? "bg-gray-300 text-gray-800"
                                        : "bg-muted text-foreground"
                                }`}
                        >
                            {deposit.payment_status}
                        </button>
                    </div>

                    <div>Pesan</div>
                    <div>
                        {statusMessage[deposit.payment_status] ||
                            "Silakan untuk melakukan pembayaran dengan metode yang kamu pilih."}
                    </div>
                </div>

                {/* SUMMARY */}
                <dl className="space-y-6 border-y py-8 mt-6">
                    <div className="flex justify-between">
                        <dt className="font-medium">Total Deposit</dt>
                        <dd>{format(deposit.amount)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="font-medium">Fee</dt>
                        <dd>{format(deposit.fee)}</dd>
                    </div>
                </dl>

                <dl className="space-y-6 py-6">
                    <div className="flex items-center justify-between">
                        <dt className="text-lg font-semibold">Total Pembayaran</dt>
                        <dd className="text-lg font-semibold text-primary">
                            <button
                                type="button"
                                className="border border-muted bg-muted/40 hover:bg-muted/60 flex items-center space-x-2 rounded-md px-2.5 py-1"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        deposit.total_amount.toString()
                                    );
                                    toast.success("Total disalin!");
                                }}
                            >
                                <div>{format(deposit.total_amount)}</div>
                            </button>
                        </dd>
                    </div>
                </dl>

                {/* INSTRUKSI PEMBAYARAN */}
                {Array.isArray(deposit.payment_instructions) && (
                    <div className="mt-8 border-t border-border pt-6">
                        {/* <h3 className="font-semibold mb-3 text-lg text-foreground">
                            Instruksi Pembayaran
                        </h3> */}

                        {deposit.payment_instructions.map((guide, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg border bg-muted/30 p-4 mb-4 shadow-sm"
                            >
                                {guide.title && (
                                    <h4 className="text-sm font-semibold mb-2 text-primary">
                                        {guide.title}
                                    </h4>
                                )}

                                {Array.isArray(guide.steps) ? (
                                    <div
                                        className="prose prose-sm max-w-none text-muted-foreground"
                                        dangerouslySetInnerHTML={{
                                            __html: guide.steps
                                                .join(" ")
                                                .replace(/&lt;/g, "<")
                                                .replace(/&gt;/g, ">"),
                                        }}
                                    />
                                ) : typeof guide.steps === "string" ? (
                                    <div
                                        className="prose prose-sm max-w-none text-muted-foreground"
                                        dangerouslySetInnerHTML={{
                                            __html: guide.steps
                                                .replace(/&lt;/g, "<")
                                                .replace(/&gt;/g, ">"),
                                        }}
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        Tidak ada langkah pembayaran tersedia.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {deposit.payment_status === "UNPAID" && timeLeft !== "Expired" && (
                    <div className="pt-6 flex flex-col md:flex-row gap-3">
                        {/* KONFIRMASI ADMIN */}
                        <Button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => {
                                const msg = `Halo Admin 👋, saya ingin konfirmasi pembayaran deposit:\n\n• Invoice: ${deposit.invoice_number}\n• Metode: ${deposit.payment_name}\n• Total: ${format(deposit.total_amount)}`;
                                const url = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(
                                    msg
                                )}`;
                                window.open(url, "_blank");
                            }}
                        >
                            Konfirmasi Admin
                        </Button>

                        {/* 🔥 BUTTON BATAL */}
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                        >
                            Batalkan Transaksi
                        </Button>
                    </div>
                )}
            </div>
        </div >
    );
}
