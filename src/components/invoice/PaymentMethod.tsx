"use client";

import { Clipboard } from "lucide-react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { Transaction } from "@/types";

// ✅ Static method mapping (VA, QRIS, Ewallet, Retail)
const qrisMethods = [
    "QRIS",
    "QRISC",
    "QRIS2",
    "QRISREALTIME",
    "QRIS_CUSTOM",
    "QRISNB",
    "QRISCUSTOM",
    "QRISSPY",
    "QRIS3",
    "11",
    "17",
    "20",
    "mpm",
    "SP",
    "NQ",
    "DQ",
    "GQ",
    "SQ",
    // Odzre — GoPay Merchant & OrderKuota
    "GOPAY_MERCHANT",
    "ORDERKOUTA",
    // OdzrePay — pay.odzreshop.id
    "ODZREPAY",
];

const qrisStringMethods = ["SP", "NQ", "DQ", "GQ", "SQ"];

const ewalletMethods = [
    "OVO",
    "DANA",
    "LINKAJA",
    "SHOPEEPAY",
    "GOPAY",
    "VIRGO",
    "ASTRAPAY",
    "OVOPUSH",
    "DANA_REALTIME",
    "SHOPEEPAY_REALTIME",
    "12",
    "13",
    "14",
    "OV",
    "SA",
    "LF",
    "LA",
    "DA",
    "SL",
    "OL",
    "JP",
    "cc", // Debit Online / Direct Debit
    "ewallet-asia", // E-Wallet ASIA
    "akulaku" // Akulaku Paylater
];

// ✅ Virtual Account (Bank)
const vaMethods = [
    "BRIVA",
    "BCAVA",
    "MANDIRIVA",
    "BNIVA",
    "PERMATAVA",
    "PERMATAVAA",
    "CIMBVA",
    "MUAMALATVA",
    "DANAMONVA",
    "MAYBANKVA",
    "BSIVA",
    "BNCVA",
    "SINARMASVA",
    "SEAABVA",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "21",
    "22",
    "BC",
    "M2",
    "VA",
    "I1",
    "B1",
    "BT",
    "A1",
    "AG",
    "NC",
    "BR",
    "S1",
    "DM",
    "BV",
    // tambahan baru dari ipaymu:
    "permata",
    "mandiri",
    "bni",
    "bca",
    "bag",
    "danamon",
    "bmi",
    "bsi",
    "bri",
    "cimb",
    "btn"
];

// ✅ Retail & COD
const retailMethods = [
    "INDOMARET",
    "ALFAMART",
    "ALFAMIDI",
    "18",
    "19",
    "FT",
    "IR",
    "cod" // Cash on Delivery
];

const pulsaMethods = [
    "TELKOMSEL",
    "XL",
    "AXIS",
    "TRI",
    "SMARTFREN",
    "23",
    "24",
    "25",
    "26",
    "27"
];

const BUY_STATUS_LABEL: Record<string, string> = {
    Sukses: "SUCCESS",
    Proses: "PROCESS",
    Batal: "CANCELLED",
};

interface InvoicePaymentMethodProps {
    order: Transaction;
    handleCopyPayCode: () => void;
    handleCopyOrderId: () => void;
    handleCopySn: () => void;
    getBackgroundPayStatusColor: () => string;
    getBackgroundBuyStatusColor: () => string;
    getBuyStatusMessage: () => string;
}

export function InvoicePaymentMethod({
    order,
    handleCopyPayCode,
    handleCopyOrderId,
    handleCopySn,
    getBackgroundPayStatusColor,
    getBackgroundBuyStatusColor,
    getBuyStatusMessage
}: InvoicePaymentMethodProps) {
    const [qrString, setQrString] = useState<string | null>(null);
    const [odzreQrisUrl, setOdzreQrisUrl] = useState<string | null>(null);
    const [odzreQrisString, setOdzreQrisString] = useState<string | null>(null);

    useEffect(() => {
        if (
            qrisStringMethods.includes(order.payment_method) &&
            order.payment_code
        ) {
            setQrString(order.payment_code);
        }

        // Parse QRIS dari payment_instructions untuk Odzre (GoPay Merchant / OrderKuota)
        if (
            ["GOPAY_MERCHANT", "ORDERKOUTA", "ODZREPAY"].includes(order.payment_method) &&
            order.payment_instructions
        ) {
            try {
                const instr = typeof order.payment_instructions === "string"
                    ? JSON.parse(order.payment_instructions)
                    : order.payment_instructions;

                // payment_instructions bisa berupa array [{title, steps}] atau object langsung
                const instrObj = Array.isArray(instr) ? instr[0] : instr;

                setOdzreQrisUrl(instrObj?.qris_url ?? null);
                setOdzreQrisString(instrObj?.qris_string ?? null);
            } catch {
                // ignore parse error
            }
        }
    }, [order.payment_method, order.payment_code, order.payment_instructions]);


    return (
        <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-4">
            <div>
                <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                <p className="text-base font-semibold text-foreground">
                    {order.payment_name}
                </p>
            </div>

            <div className="space-y-4 text-sm">
                {/* Invoice ID */}
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="md:w-1/3 text-muted-foreground">Nomor Invoice</span>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-muted rounded-md font-semibold text-foreground text-sm">
                            {order.order_id}
                        </span>
                        <button
                            onClick={handleCopyOrderId}
                            className="p-2 bg-muted rounded-md"
                        >
                            <Clipboard className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Status Pembayaran */}
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="md:w-1/3 text-muted-foreground">
                        Status Pembayaran
                    </span>
                    <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-semibold uppercase w-fit ${getBackgroundPayStatusColor()}`}
                    >
                        {order.payment_status}
                    </span>
                </div>

                {/* Status Transaksi */}
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="md:w-1/3 text-muted-foreground">
                        Status Transaksi
                    </span>
                    <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-semibold uppercase w-fit ${getBackgroundBuyStatusColor()}`}
                    >
                        {BUY_STATUS_LABEL[order.buy_status] ?? order.buy_status}
                    </span>
                </div>

                {/* Waktu Order Dibuat */}
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="md:w-1/3 text-muted-foreground">
                        Waktu Order Dibuat
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                        {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            }) +
                            " " +
                            new Date(order.created_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })
                            : "-"}
                    </span>
                </div>

                {/* Waktu Selesai/Update */}
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="md:w-1/3 text-muted-foreground">
                        Waktu Selesai/Update
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                        {order.updated_at
                            ? new Date(order.updated_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            }) +
                            " " +
                            new Date(order.updated_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })
                            : "-"}
                    </span>
                </div>

                {/* Kecepatan Transaksi */}
                {order.buy_status === "Sukses" && order.created_at && order.updated_at && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <span className="md:w-1/3 text-muted-foreground">
                            Kecepatan Transaksi
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {(() => {
                                const created = new Date(order.created_at).getTime();
                                const updated = new Date(order.updated_at!).getTime();
                                const diffMs = updated - created;

                                if (diffMs <= 0) return "Instan";

                                const totalSeconds = Math.floor(diffMs / 1000);
                                const hours = Math.floor(totalSeconds / 3600);
                                const minutes = Math.floor((totalSeconds % 3600) / 60);
                                const seconds = totalSeconds % 60;

                                const parts: string[] = [];
                                if (hours > 0) parts.push(`${hours} jam`);
                                if (minutes > 0) parts.push(`${minutes} menit`);
                                if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`);

                                return parts.join(" ");
                            })()}
                        </span>
                    </div>
                )}

                {/* Serial Number */}
                {order.serial_number && (() => {
                    const snText = order.serial_number;
                    const hasMultiAccount = snText.includes("\n---\n");
                    const snParts = hasMultiAccount
                        ? snText.split("\n---\n").map((s: string) => s.trim()).filter(Boolean)
                        : snText.split("\n").map((s: string) => s.trim()).filter(Boolean);
                    const isMulti = snParts.length > 1;

                    return (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Serial Number {isMulti ? `(${snParts.length})` : ""}
                                </span>
                                {isMulti && (
                                    <button
                                        onClick={handleCopySn}
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-md hover:bg-muted/80 transition-colors"
                                    >
                                        <Clipboard className="h-3 w-3" />
                                        <span>Copy All</span>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {isMulti ? (
                                    snParts.map((sn: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex items-start justify-between gap-2 px-3 py-2 bg-muted rounded-md"
                                        >
                                            <div className="flex-1 min-w-0">
                                                {hasMultiAccount && (
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        #{idx + 1}
                                                    </p>
                                                )}
                                                <pre className="whitespace-pre-wrap break-all font-semibold text-foreground text-sm font-sans">
                                                    {sn}
                                                </pre>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(sn);
                                                }}
                                                className="shrink-0 p-1.5 bg-background/50 rounded-md hover:bg-background transition-colors"
                                                title={`Copy #${idx + 1}`}
                                            >
                                                <Clipboard className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-muted rounded-md font-semibold text-foreground text-sm">
                                            {order.serial_number}
                                        </span>
                                        <button
                                            onClick={handleCopySn}
                                            className="p-2 bg-muted rounded-md"
                                        >
                                            <Clipboard className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Pesan Jika Belum Dibayar */}
                {order.payment_status === "UNPAID" && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <span className="md:w-1/3 text-muted-foreground">Pesan</span>
                        <p className="text-sm font-medium text-foreground">
                            {getBuyStatusMessage()}
                        </p>
                    </div>
                )}

                {/* Kode Pembayaran */}
                {order.payment_status === "UNPAID" && (
                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                            Kode Pembayaran
                        </span>

                        {qrisMethods.includes(order.payment_method) ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-4 bg-white rounded-lg shadow">
                                    {/* Odzre: tampilkan QR dari qris_url atau render qris_string */}
                                    {["GOPAY_MERCHANT", "ORDERKOUTA", "ODZREPAY"].includes(order.payment_method) ? (
                                        odzreQrisUrl ? (
                                            <Image
                                                src={odzreQrisUrl}
                                                alt="QRIS Payment"
                                                width={200}
                                                height={200}
                                                className="rounded-md object-contain"
                                            />
                                        ) : odzreQrisString ? (
                                            <QRCode value={odzreQrisString} size={200} />
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center">
                                                Memuat QRIS...
                                            </p>
                                        )
                                    ) : order.payment_code?.startsWith("http") ? (
                                        <Image
                                            src={order.payment_code}
                                            alt="QRIS Payment"
                                            width={200}
                                            height={200}
                                            className="rounded-md object-contain"
                                        />
                                    ) : (
                                        <QRCode value={order.payment_code} size={200} />
                                    )}
                                </div>

                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Scan QR Code untuk melakukan pembayaran.
                                </p>
                            </div>
                        ) : ewalletMethods.includes(order.payment_method) ? (
                            <a
                                href={order.payment_code}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-fit px-4 py-2 bg-my-color3 dark:text-white rounded-lg hover:bg-gradient-to-b from-my-color3 to-white dark:to-black transition text-sm"
                            >
                                Bayar Sekarang
                            </a>
                        ) : vaMethods.includes(order.payment_method) ? (
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-muted rounded-md font-semibold text-foreground text-sm">
                                    {order.payment_code}
                                </span>
                                <button
                                    onClick={handleCopyPayCode}
                                    className="p-2 bg-muted rounded-md"
                                >
                                    <Clipboard className="h-4 w-4" />
                                </button>
                            </div>
                        ) : retailMethods.includes(order.payment_method) ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1.5 bg-muted rounded-md font-semibold text-foreground text-sm">
                                        {order.payment_code}
                                    </span>
                                    <button
                                        onClick={handleCopyPayCode}
                                        className="p-2 bg-muted rounded-md"
                                    >
                                        <Clipboard className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Gunakan kode ini untuk membayar di{" "}
                                    {order.payment_method === "INDOMARET"
                                        ? "Indomaret"
                                        : "Alfamart/Alfamidi"}
                                    .
                                </p>
                            </div>
                        ) : pulsaMethods.includes(order.payment_method) ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <a
                                        href={order.payment_code}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 w-fit px-4 py-2 bg-my-color3 dark:text-white rounded-lg hover:bg-gradient-to-b from-my-color3 to-white dark:to-black transition text-sm"
                                    >
                                        Buka Link Pembayaran
                                    </a>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Buka Link Pembayaran untuk mengisi pulsa ke nomor Anda melalui
                                    metode {order.payment_method}.
                                </p>
                            </div>
                        ) : (
                            <p className="text-red-500 font-semibold text-sm">
                                Metode pembayaran tidak dikenali
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
