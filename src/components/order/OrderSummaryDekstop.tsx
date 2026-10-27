"use client";

import Image from "next/image";
import { OdometerNumber } from "@/components/ui/odometer-number";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button"; // ⬅ gunakan UI Button

interface OrderSummaryDekstopProps {
    selectedProductDetails: {
        title: string;
        paymentMethod?: string;
        images: string;
        logo: string;
    } | null;
    productPrice: number;
    fee: number;
    totalPrice: number;
    voucherDiscount?: number;
    isLoading: boolean;
    gameTitle?: string;
    category?: string;
    quantity?: number;
    paymentMethod?: string;
    games?: {
        title?: string;
        image?: string | null;
    } | null;
}

export default function OrderSummaryDekstop({
    selectedProductDetails,
    productPrice,
    fee,
    totalPrice,
    voucherDiscount = 0,
    isLoading,
    gameTitle,
    quantity = 1,
    category,
    paymentMethod,
    games
}: OrderSummaryDekstopProps) {
    const { t } = useTranslation();
    const { data } = useSettings();
    const currency = data?.region?.currency ?? "IDR";

    const hasFee = typeof fee === "number" && !isNaN(fee);
    const hasPrice = typeof productPrice === "number" && !isNaN(productPrice);
    const hasPayment = !!paymentMethod;
    const gameImage = games?.image;

    return (
        <section className="relative mt-6 hidden lg:block">
            {selectedProductDetails ? (
                <div className="rounded-xl bg-secondary shadow-sm p-4 text-sm flex flex-col gap-4 mb-4">

                    {/* === CARD CONTENT === */}
                    <div className="flex items-center gap-4">
                        {gameImage && (
                            <Image
                                src={gameImage}
                                alt={games?.title || "Game"}
                                width={50}
                                height={50}
                                className="aspect-square h-16 w-16 rounded-sm object-cover"
                                unoptimized
                            />
                        )}
                        <div className="flex flex-col items-start">
                            <p className="text-lg font-semibold">{category}</p>
                            <p className="text-md text-muted-foreground">
                                {gameTitle || selectedProductDetails?.title}
                            </p>
                            <p className="text-sm mt-1">{selectedProductDetails.title}</p>
                        </div>
                    </div>

                    {hasPayment && (
                        <div className="flex justify-between">
                            <span>{t("order.Metode")}</span>
                            <span>{paymentMethod}</span>
                        </div>
                    )}

                    {hasPrice && (
                        <div className="flex justify-between items-center">
                            <span>{t("order.Harga")}</span>
                            <OdometerNumber number={productPrice} />
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span>{t("order.Jumlah Pembelian")}</span>
                        <span>{quantity}</span>
                    </div>

                    {hasFee && (
                        <div className="flex justify-between items-center">
                            <span>{t("order.Payment Fee")}</span>
                            <OdometerNumber number={fee} />
                        </div>
                    )}

                    {voucherDiscount > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>{t("order.Voucher")}</span>
                            <span>- <OdometerNumber number={voucherDiscount} /></span>
                        </div>
                    )}

                    <hr />

                    <div className="flex justify-between font-semibold text-base items-center">
                        <span>{t("order.Total Bayar")}</span>
                        <OdometerNumber number={totalPrice} />
                    </div>
                </div>
            ) : (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed bg-muted/40 text-sm text-muted-foreground">
                    {t("order.Belum ada item produk yang dipilih")}
                </div>
            )}

            {/* === BUTTON DIPISAH DARI CARD === */}
            {selectedProductDetails && (
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg
                                className="animate-spin mr-2 h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="opacity-25"
                                ></circle>
                                <path
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                    className="opacity-75"
                                ></path>
                            </svg>
                            {t("order.Memproses")}
                        </>
                    ) : (
                        <>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 25 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M16.5209 6.87109H8.47891C5.67599 6.87109 3.91895 8.8558 3.91895 11.6636V16.206C3.91895 19.0148 5.66724 20.9985 8.47891 20.9985H16.5199C19.3316 20.9985 21.0818 19.0148 21.0818 16.206V11.6636C21.0818 8.8558 19.3316 6.87109 16.5209 6.87109Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                                <path
                                    opacity="0.4"
                                    d="M9.38477 11.1445C9.45871 11.8684 9.79338 12.5173 10.275 13.0096C10.8509 13.5748 11.639 13.928 12.5019 13.928C14.116 13.928 15.443 12.7119 15.6191 11.1445"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                                <path
                                    opacity="0.4"
                                    d="M16.3702 6.87115C16.3702 4.7337 14.6375 3 12.4991 3C10.3616 3 8.62891 4.7337 8.62891 6.87115"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                            {t("order.Pesan Sekarang")}
                        </>
                    )}
                </Button>
            )}
        </section>
    );
}
