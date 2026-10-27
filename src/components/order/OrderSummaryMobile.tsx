"use client";

import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { OdometerNumber } from "@/components/ui/odometer-number";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface OrderSummaryMobileProps {
    selectedProductDetails: {
        title: string;
        logo?: string;
        images?: string;
        subtitle?: string;
        gameTitle?: string;
        paymentMethod?: string;
    } | null;
    productPrice: number;
    fee: number;
    totalPrice: number;
    voucherDiscount?: number;
    isLoading: boolean;
    quantity?: number;
    gameTitle?: string;
    category: string;
    paymentMethod?: string;
    gameImage?: string | null;
}

export default function OrderSummaryMobile({
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
    gameImage
}: OrderSummaryMobileProps) {
    const { t } = useTranslation();

    const hasFee = typeof fee === "number" && !isNaN(fee);
    const hasPrice = typeof productPrice === "number" && !isNaN(productPrice);
    const hasPayment = !!paymentMethod;

    const displayImage =
        selectedProductDetails?.images ||
        selectedProductDetails?.logo ||
        gameImage ||
        "/noimage.png";

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 block w-full max-w-full space-y-4 rounded-t-md p-4 lg:hidden bg-my-color2">

            {selectedProductDetails ? (
                <div className="relative rounded-lg border border-dashed border-gray-500 p-2 text-sm">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1" className="border-none">

                            <AccordionTrigger className="py-0 hover:no-underline">
                                <div className="flex items-center gap-4">

                                    {displayImage && (
                                        <div className="aspect-square h-12 w-12 flex-shrink-0">
                                            <Image
                                                src={displayImage}
                                                alt={selectedProductDetails?.title || gameTitle || "Game"}
                                                width={48}
                                                height={48}
                                                className="aspect-square h-12 w-12 rounded-sm object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col items-start justify-center">
                                        <div className="text-xs font-semibold">{category}</div>

                                        <div className="text-sm text-muted-foreground leading-tight">
                                            {gameTitle || selectedProductDetails.gameTitle || "-"}
                                        </div>

                                        <div className="mt-1 text-xs font-medium">
                                            {selectedProductDetails.title}
                                        </div>

                                        {selectedProductDetails.subtitle && (
                                            <div className="mt-0.5 text-[10px] text-muted-foreground">
                                                {selectedProductDetails.subtitle}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="pt-2 pb-0 text-xs font-medium space-y-2">

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
                                        <span>
                                            - <OdometerNumber number={voucherDiscount} />
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between border-t border-dashed border-gray-500 pt-1.5 text-base font-semibold">
                                    <span>{t("order.Total Bayar")}</span>
                                    <span className="flex items-center text-base font-semibold text-black dark:text-white">
                                        <OdometerNumber number={totalPrice} />
                                    </span>
                                </div>

                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-500 text-sm text-secondary-foreground">
                    <div className="flex h-[4em] items-center justify-center text-center text-xs">
                        {t("order.Belum ada item produk yang dipilih")}
                    </div>
                </div>
            )}

            {/* Button Order */}
            <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full gap-2"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5"
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

                        <span>{t("order.Memproses")}</span>
                    </>
                ) : (
                    <>
                        {/* ICON PATH TETAP SAMA */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 25 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1"
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

                        <span>{t("order.Pesan Sekarang")}</span>
                    </>
                )}
            </Button>
        </div>
    );
}