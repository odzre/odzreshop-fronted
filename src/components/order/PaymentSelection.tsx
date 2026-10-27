"use client";

import Image from "@/components/ui/Image";
import { PaymentMethod } from "@/types";
import DiagonalBadge from "@/components/ui/DiagonalBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

interface PaymentSelectionProps {
    paymentRef: React.RefObject<HTMLDivElement>;
    products: { id: string; selling_price: number }[];
    selectedProduct: string | null;
    groupedPaymentMethods: Record<string, PaymentMethod[]>;
    selectedPayment: string | null;
    setSelectedPayment: (id: string) => void;
    setSelectedPaymentDetails?: (details: PaymentMethod) => void;
    productPrice: number;
    saldo?: number;
    isLoggedIn?: boolean;
    coinImage: string;
    quantity: number;
    whatsappRef?: React.RefObject<HTMLDivElement>;
    // ✅ Tambahan validasi input
    inputs?: { id?: string; server?: string };
    gameConfig?: { required_inputs?: string[] };
}

export default function PaymentSelection({
    paymentRef,
    groupedPaymentMethods,
    selectedProduct,
    selectedPayment,
    setSelectedPayment,
    productPrice,
    saldo,
    isLoggedIn,
    coinImage,
    quantity,
    whatsappRef,
    setSelectedPaymentDetails,
    inputs,
    gameConfig
}: PaymentSelectionProps) {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const { t } = useTranslation();
    const { format } = useCurrency();

    useEffect(() => {
        if (selectedPayment && whatsappRef?.current) {
            const timeout = setTimeout(() => {
                whatsappRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 150);
            return () => clearTimeout(timeout);
        }
    }, [selectedPayment, whatsappRef]);

    const entries = Object.entries(groupedPaymentMethods);
    const qrisGroup = entries.find(([group]) =>
        group.toLowerCase().includes("qris")
    );
    const otherGroups = entries.filter(
        ([group]) => !group.toLowerCase().includes("qris")
    );

    const calculateTotalPrice = (method: PaymentMethod) => {
        const flat = Number(method.fee) || 0;
        const percent = Number(method.fee_percent) || 0;
        const subtotal = productPrice * quantity;
        const fee = flat + Math.floor((percent / 100) * subtotal);
        return subtotal + fee;
    };

    // ✅ Fungsi validasi sebelum pilih metode pembayaran
    const validateBeforeSelect = (): boolean => {
        const required = gameConfig?.required_inputs || [];
        let hasMissing = false;

        if (required.includes("id") && !inputs?.id?.trim()) {
            hasMissing = true;
            document.getElementById("id")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        if (required.includes("server") && !inputs?.server?.trim()) {
            hasMissing = true;
            document.getElementById("server")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        if (hasMissing) {
            toast.error(
                t(
                    "order.Silakan isi data akun terlebih dahulu sebelum memilih pembayaran."
                )
            );
            return false;
        }

        return true;
    };

    return (
        <section
            ref={paymentRef}
            className="relative scroll-mt-20 rounded-xl bg-card/50 shadow-sm md:scroll-mt-[7.5rem]"
            id="3"
        >
            <div className="flex items-center rounded-t-xl bg-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-tl-xl bg-primary font-semibold text-white">
                    3
                </div>
                <h2 className="ml-3 text-sm font-semibold text-card-foreground">
                    {t("order.Pilih Pembayaran")}
                </h2>
            </div>

            <div className="p-4 space-y-6">
                {/* ✅ SALDO Credits ikut quantity */}
                <div className="space-y-2">
                    <label
                        className={cn(
                            "group/variant relative flex p-3 md:p-4 cursor-pointer method-list rounded-xl border border-transparent bg-muted shadow-sm outline-none",
                            selectedPayment === "saldo"
                                ? "ring-2 ring-primary"
                                : "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"

                        )}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="saldo"
                            className="sr-only"
                            checked={selectedPayment === "saldo"}
                            onChange={(e) => {
                                // 🔹 Cek validasi input dulu
                                if (!validateBeforeSelect()) {
                                    e.preventDefault();
                                    return;
                                }

                                const totalPembelian = productPrice * quantity;
                                if (!isLoggedIn) {
                                    e.preventDefault();
                                    toast.error(
                                        t("order.Ups! Kamu Belum Login. Silahkan login dulu.")
                                    );
                                    return;
                                }
                                if ((saldo ?? 0) < totalPembelian) {
                                    e.preventDefault();
                                    toast.error(
                                        t("order.Saldo kamu tidak mencukupi untuk pembelian ini.")
                                    );
                                    return;
                                }
                                setSelectedPayment("saldo");
                                setSelectedPaymentDetails?.({
                                    id: "saldo",
                                    name: "Credits",
                                    images: coinImage
                                } as PaymentMethod);
                            }}
                        />

                        <div className="flex w-full items-center justify-between">
                            <div className="w-full flex items-center gap-2">
                                <Image
                                    src={coinImage}
                                    alt="Credits"
                                    width={50}
                                    height={50}
                                    className="max-h-12"
                                />
                                <span className="block text-xs font-semibold sm:text-sm text-muted-foreground">
                                    Credits
                                </span>
                            </div>

                            <div className="relative mr-8 text-xs font-semibold sm:text-base text-nowrap">
                                {!selectedProduct ? (
                                    <span className="text-muted-foreground text-xs">
                                        Min {format(0)}
                                    </span>
                                ) : (saldo ?? 0) < productPrice * quantity ? (
                                    <span className="text-red-500 font-semibold">
                                        {format(productPrice * quantity)}
                                    </span>
                                ) : (
                                    <span className="font-semibold">
                                        {format(productPrice * quantity)}
                                    </span>
                                )}
                            </div>

                            <DiagonalBadge label="BEST PRICE" textSize="text-xxs" />
                        </div>
                    </label>
                </div>

                {/* ✅ Group QRIS */}
                {qrisGroup && (
                    <div key={qrisGroup[0]} className="space-y-4">
                        {qrisGroup[1]
                            .filter((method) => method.status)
                            .map((method) => {
                                const totalPrice = calculateTotalPrice(method);
                                const isDisabled =
                                    totalPrice < method.minimum_amount ||
                                    totalPrice > method.maximum_amount;
                                const isSelected = selectedPayment === method.id;

                                return (
                                    <label
                                        key={method.id}
                                        className={cn(
                                            "group/variant relative flex p-3 md:p-4 cursor-pointer method-list rounded-xl border border-transparent bg-muted p-3 shadow-sm outline-none md:p-4",
                                            !isDisabled
                                                ? "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                                                : "",
                                            isDisabled
                                                ? "opacity-50 cursor-not-allowed"
                                                : isSelected
                                                    ? "ring-2 ring-primary"
                                                    : ""
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            className="sr-only"
                                            disabled={isDisabled}
                                            checked={isSelected}
                                            onChange={(e) => {
                                                // 🔹 Validasi input dulu
                                                if (!validateBeforeSelect()) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                setSelectedPayment(method.id);
                                                setSelectedPaymentDetails?.(method);
                                            }}
                                        />
                                        <div className="flex w-full flex-col items-start justify-between py-1 md:flex-row md:items-center">
                                            <div className="w-full">
                                                <span className="block pb-2 text-xs font-semibold sm:text-sm text-muted-foreground">
                                                    {method.name}
                                                </span>
                                                {method.images && method.images !== "noimage.png" && (
                                                    <Image
                                                        src={method.images}
                                                        alt={method.name}
                                                        width={100}
                                                        height={100}
                                                        className="object-contain items-start max-h-6"
                                                    />
                                                )}
                                            </div>
                                            <div className="mt-3 w-full md:mt-0">
                                                <div
                                                    className={cn(
                                                        "relative mr-8 text-sm font-semibold sm:text-base w-full rounded-md border border-dashed border-gray-500 py-1 text-center text-xs md:text-md md:w-auto md:border-none md:text-right",
                                                        isDisabled
                                                            ? "text-red-500"
                                                            : isSelected
                                                                ? "text-muted-foreground"
                                                                : ""
                                                    )}
                                                >
                                                    {selectedProduct === null ? (
                                                        <span className="text-red-500 text-xs">
                                                            Min {format(method.minimum_amount ?? 0)}
                                                        </span>
                                                    ) : isDisabled && !isSelected ? (
                                                        <span className="text-red-500 text-xs">
                                                            {totalPrice > method.maximum_amount
                                                                ? `Max ${format(method.maximum_amount ?? 0)}`
                                                                : `Min ${format(method.minimum_amount ?? 0)}`}
                                                        </span>
                                                    ) : (
                                                        format(totalPrice)
                                                    )}
                                                </div>
                                            </div>
                                            <DiagonalBadge label="BEST PRICE" textSize="text-xxs" />
                                        </div>
                                    </label>
                                );
                            })}
                    </div>
                )}

                {/* ✅ Other Groups tetap sama */}
                {otherGroups.map(([group, methods]) => {
                    const isOpen = openAccordion === group;
                    const filteredMethods = methods.filter((m) => m.status);

                    return (
                        <div key={group} className="rounded-xl bg-background/50">
                            <button
                                type="button"
                                className="flex w-full items-center justify-between rounded-t-xl bg-card px-4 py-3 font-medium"
                                onClick={() => setOpenAccordion(isOpen ? null : group)}
                            >
                                <span>{group}</span>
                                <svg
                                    className={cn(
                                        "h-5 w-5 transition-transform duration-300",
                                        isOpen ? "rotate-180" : "rotate-0"
                                    )}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            <div
                                className={cn(
                                    "transition-all duration-300",
                                    isOpen
                                        ? "max-h-[90vh] overflow-y-auto py-4 opacity-100"
                                        : "max-h-0 overflow-hidden opacity-0"
                                )}
                            >
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 px-4">
                                    {filteredMethods.map((method) => {
                                        const totalPrice = calculateTotalPrice(method);
                                        const isDisabled =
                                            totalPrice < method.minimum_amount ||
                                            totalPrice > method.maximum_amount;
                                        const isSelected = selectedPayment === method.id;

                                        return (
                                            <label
                                                key={method.id}
                                                className={cn(
                                                    "group/variant relative flex min-h-[85px] cursor-pointer gap-4 rounded-xl border border-transparent bg-muted shadow-sm",
                                                    !isDisabled
                                                        ? "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                                                        : "",
                                                    isDisabled
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : isSelected
                                                            ? "ring-2 ring-primary"
                                                            : ""
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    className="sr-only"
                                                    disabled={isDisabled}
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        // 🔹 Validasi input dulu
                                                        if (!validateBeforeSelect()) {
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                        setSelectedPayment(method.id);
                                                        setSelectedPaymentDetails?.(method);
                                                    }}
                                                />
                                                <span className="w-full">
                                                    <span className="flex h-full flex-col justify-between divide-y divide-muted-foreground/10">
                                                        <div className="flex flex-col justify-start gap-1 p-3">
                                                            <span className="block text-xs font-semibold text-muted-foreground">
                                                                {method.name}
                                                            </span>
                                                            <div className="flex flex-col w-full">
                                                                <div className="flex aspect-square h-12 w-16 items-center">
                                                                    {method.images &&
                                                                        method.images !== "noimage.png" && (
                                                                            <Image
                                                                                alt={method.name}
                                                                                priority
                                                                                width={300}
                                                                                height={300}
                                                                                className="object-contain object-right"
                                                                                src={method.images}
                                                                            />
                                                                        )}
                                                                </div>
                                                                <div className="border-t border-dashed border-muted-foreground/20 px-2 py-1 md:px-3">
                                                                    {selectedProduct === null ? (
                                                                        <span className="flex items-center text-xs md:text-[13px] font-semibold text-muted-foreground">
                                                                            Min {format(method.minimum_amount ?? 0)}
                                                                        </span>
                                                                    ) : isDisabled && !isSelected ? (
                                                                        <span className="flex items-center text-xs md:text-[13px] font-semibold text-red-500">
                                                                            {totalPrice > method.maximum_amount
                                                                                ? `Max ${format(method.maximum_amount ?? 0)}`
                                                                                : `Min ${format(method.minimum_amount ?? 0)}`}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center text-xs md:text-[14px] font-semibold md:text-[16px] text-muted-foreground">
                                                                            {format(totalPrice)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {!isOpen && (
                                <button
                                    onClick={() => setOpenAccordion(group)}
                                    className="flex w-full items-center gap-2 overflow-x-auto px-2 py-1 bg-muted rounded-b-xl hide-scrollbar"
                                >
                                    {filteredMethods.map(
                                        (method) =>
                                            method.images &&
                                            method.images !== "noimage.png" && (
                                                <div
                                                    key={method.id}
                                                    className="relative aspect-[6/2] w-10 flex justify-end"
                                                >
                                                    <Image
                                                        alt={method.name}
                                                        src={method.images}
                                                        width={36}
                                                        height={36}
                                                        className="w-16 h-6 object-contain p-1 rounded-md"
                                                    />
                                                </div>
                                            )
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
