"use client";

import React from "react";
import {
    CheckCircle,
    CreditCard,
    Loader2,
    ShoppingCart,
} from "lucide-react";
import { Transaction } from "@/types";

interface ProgressBarProps {
    order: Transaction;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ order }) => {

    const isRefunded =
        order.buy_status === "Batal" &&
        order.payment_status === "REFUNDED";

    const steps = [
        {
            label: "Transaksi Dibuat",
            description: "Transaksi telah berhasil dibuat",
            icon: <ShoppingCart className="w-5 h-5 text-white" />,
        },
        {
            label: "Pembayaran",
            description: "Silakan melakukan pembayaran",
            icon: <CreditCard className="w-5 h-5 text-primary" />,
        },
        {
            label: isRefunded ? "Pengembalian Dana" : "Sedang Di Proses",
            description: isRefunded
                ? "Transaksi selesai. Dana telah dikembalikan"
                : "Pembelian sedang dalam proses.",
            icon: <Loader2 className="w-5 h-5 text-muted-foreground" />,
        },
        {
            label: "Transaksi Selesai",
            description: "Transaksi telah berhasil dilakukan.",
            icon: <CheckCircle className="w-5 h-5 text-muted-foreground" />,
        },
    ];

    const getStepProgress = () => {
        const { payment_status, buy_status } = order;

        if (payment_status === "UNPAID") return 1;
        if (payment_status === "PAID" && buy_status === "Pending") return 2;
        if (payment_status === "REFUNDED" && buy_status === "Batal") return 3;

        if (buy_status === "Proses") return 3;
        if (buy_status === "Sukses") return 4;

        return 1;
    };

    const currentStep = getStepProgress();

    // ===== logic lama (TIDAK DIUBAH) =====
    const fullWidth = 100;
    const stepCount = steps.length - 1;
    const stepWidthPercent = fullWidth / stepCount;

    const progressPercent =
        currentStep === 1
            ? stepWidthPercent / 2
            : (currentStep - 1) * stepWidthPercent;

    // =====================================

    return (
        <div className="w-full mx-auto flex flex-col items-start gap-4">
            <h3 className="font-semibold pt-4">Progress Transaksi</h3>

            <nav aria-label="Progress" className="w-full">
                <div className="relative w-full">

                    {/* background line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full z-0" />

                    {/* progress line */}
                    <div
                        className={`absolute top-5 left-0 h-1 rounded-full transition-all duration-300
                        ${order.payment_status === "REFUNDED"
                                ? "bg-sky-600"
                                : "bg-green-600"
                            }`}
                        style={{ width: `${progressPercent}%` }}
                    />

                    <ol
                        role="list"
                        className="relative z-10 flex w-full justify-between overflow-hidden"
                    >
                        {steps.map((step, index) => {
                            const isActive = index < currentStep;

                            const alignment =
                                index === 0
                                    ? "items-start text-left"
                                    : index === steps.length - 1
                                        ? "items-end text-right"
                                        : "items-center text-center";

                            return (
                                <li
                                    key={index}
                                    className={`pb-5 relative w-full flex flex-col ${alignment}`}
                                >
                                    {/* ICON */}
                                    <span className="flex h-9 items-center">
                                        <span
                                            className={`relative z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 group-hover:opacity-80
                                            ${index === 0
                                                    ? "bg-green-600 border-green-600"
                                                    : isActive
                                                        ? "border-2 border-green-600 bg-background"
                                                        : "border-2 border-muted bg-background"
                                                }`}
                                        >
                                            {step.icon}
                                        </span>
                                    </span>

                                    {/* TEXT */}
                                    <span className="ml-4 hidden w-full min-w-0 flex-col lg:ml-0 lg:mt-2 lg:flex">
                                        <span
                                            className={`text-base font-semibold ${isActive
                                                ? "text-green-700"
                                                : "text-foreground"
                                                }`}
                                        >
                                            {step.label}
                                        </span>

                                        <span className="text-xs text-foreground">
                                            {step.description}
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </nav>
        </div>
    );
};