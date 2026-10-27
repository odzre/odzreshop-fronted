"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { XCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfirmDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    gameConfig?: any;
    whatsappError?: string | null;
    nicknameError?: string | null;
    games?: any;
    productName?: string;
    productPrice?: number;
    totalPrice?: number;
    voucherDiscount?: number;
    voucherCode?: string | null;
    fee?: number;
    inputs: Record<string, string>;
    nickname?: string | null;
    loggedInEmail?: string | null;
    email?: string;
    whatsapp?: string;
    selectedPaymentDetails?: { images: string; name: string };
    isLoading: boolean;
    quantity?: number;
    submitOrder: () => void;
}

const ConfirmDrawer: React.FC<ConfirmDrawerProps> = (props) => {
    const { t } = useTranslation();
    const fired = useRef(false);

    useEffect(() => {
        if (
            props.isOpen &&
            !props.nicknameError &&
            !props.whatsappError &&
            !fired.current
        ) {
            const shots = [
                { x: 0.5, y: 0.6 }, // tengah
                { x: 0.2, y: 0.6 }, // kiri
                { x: 0.8, y: 0.6 }, // kanan
                { x: 0.3, y: 0.4 }, // kiri atas
                { x: 0.7, y: 0.4 }  // kanan atas
            ];

            shots.forEach((origin, index) => {
                setTimeout(() => {
                    confetti({
                        particleCount: 60,
                        spread: 65,
                        origin
                    });
                }, index * 150); // delay bertahap
            });

            fired.current = true;
        }

        if (!props.isOpen) {
            fired.current = false;
        }
    }, [props.isOpen, props.nicknameError, props.whatsappError]);

    return (
        <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
            <DialogContent className="max-w-lg rounded-lg">
                <DialogHeader>
                    {props.nicknameError ? (
                        <VisuallyHidden>
                            <DialogTitle>{t("order.Konfirmasi Pembelian")}</DialogTitle>
                        </VisuallyHidden>
                    ) : (
                        <>
                            <DialogTitle>{t("order.Konfirmasi Pembelian")}</DialogTitle>
                            <DialogDescription>
                                {t(
                                    "order.Pastikan semua data sudah benar sebelum melanjutkan."
                                )}
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>

                <Content {...props} />
            </DialogContent>
        </Dialog>
    );
};

const Content = ({
    gameConfig,
    nicknameError,
    whatsappError,
    games,
    productName,
    productPrice = 0,
    totalPrice = 0,
    voucherDiscount = 0,
    fee = 0,
    inputs,
    nickname,
    selectedPaymentDetails,
    isLoading,
    submitOrder,
    quantity = 1,
    onOpenChange
}: Omit<ConfirmDrawerProps, "isOpen">) => {
    const { t } = useTranslation();
    const { format } = useCurrency();

    const getInputDisplayValue = (name: string, value?: string) => {
        if (!value) return "-";

        const field = gameConfig?.input_fields?.find(
            (f: any) => f.name === name
        );

        if (!field) return value;

        let options = field.options;

        if (!options && name === "server") {
            options = gameConfig?.options;
        }

        if (field.type === "select" && options) {
            const option = options.find((o: any) => o.value === value);
            return option?.label ?? value;
        }

        return value;
    };

    return (
        <div className="pt-2 space-y-4 overflow-y-auto max-h-[75vh] md:max-h-[80vh]">
            {whatsappError ? (
                <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-red-50 dark:bg-red-100/10 shadow-sm">
                    <XCircle className="w-10 h-10 text-red-500" />
                    <h2 className="text-base font-semibold text-xl text-red-600 mt-2">
                        Transaksi Dibatalkan
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {whatsappError}
                    </p>
                </div>
            ) : nicknameError ? (
                <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-red-50 dark:bg-red-100/10 shadow-sm">
                    <XCircle className="w-10 h-10 text-red-500" />
                    <h2 className="text-base font-semibold text-xl text-red-600 mt-2">
                        Transaksi Dibatalkan
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {nicknameError || "Nickname tidak ditemukan."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="rounded-2xl border border-border/50 bg-muted/50 p-4 space-y-3 shadow-sm">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                            {t("order.Detail Produk")}
                        </h4>

                        {gameConfig?.status_validation_nickname === "yes" && (
                            <div className="flex justify-between text-xs lg:text-sm">
                                <span>Nickname</span>
                                <span>{nickname}</span>
                            </div>
                        )}

                        {gameConfig?.required_inputs.includes("id") && (
                            <div className="flex justify-between text-xs lg:text-sm">
                                <span>ID</span>
                                <span>{inputs.id}</span>
                            </div>
                        )}

                        {gameConfig?.required_inputs.includes("server") && (
                            <div className="flex justify-between text-xs lg:text-sm">
                                <span>Server</span>
                                <span>
                                    {getInputDisplayValue("server", inputs.server)}
                                </span>
                            </div>
                        )}

                        {gameConfig?.input_fields
                            ?.filter((f: any) => !["id", "server"].includes(f.name))
                            .map((f: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex justify-between text-xs lg:text-sm"
                                >
                                    <span>{f.label}</span>
                                    <span>
                                        {getInputDisplayValue(f.name, inputs[f.name])}
                                    </span>
                                </div>
                            ))}

                        <div className="flex justify-between text-xs lg:text-sm">
                            <span>Items</span>
                            <span>{productName}</span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-muted/50 p-4 space-y-3 shadow-sm">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                            {t("order.Detail Pembayaran")}
                        </h4>

                        <div className="flex justify-between text-xs lg:text-sm">
                            <span>{t("order.Metode")}</span>
                            <span>{selectedPaymentDetails?.name ?? "-"}</span>
                        </div>

                        <div className="flex justify-between text-xs lg:text-sm">
                            <span>{t("order.Harga")}</span>
                            <span>{format(productPrice)}</span>
                        </div>

                        <div className="flex justify-between text-xs lg:text-sm">
                            <span>{t("order.Jumlah")}</span>
                            <span>{quantity}x</span>
                        </div>

                        <div className="flex justify-between text-xs lg:text-sm">
                            <span>{t("order.Payment Fee")}</span>
                            <span>{format(fee)}</span>
                        </div>

                        {voucherDiscount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium text-xs lg:text-sm">
                                <span>{t("order.Diskon Voucher")}</span>
                                <span>- {format(voucherDiscount)}</span>
                            </div>
                        )}

                        <hr />

                        <div className="flex justify-between text-xs lg:text-sm font-semibold">
                            <span>{t("order.Total Bayar")}</span>
                            <span className="text-base text-card-foreground">
                                {format(totalPrice)}
                            </span>
                        </div>
                    </div>
                </>
            )}

            <div className="flex flex-col md:flex-row gap-2 pt-2">
                {!nicknameError && !whatsappError && (
                    <Button className="flex-1" onClick={submitOrder} disabled={isLoading}>
                        {isLoading
                            ? t("order.Memproses...")
                            : t("order.Konfirmasi Pembelian Tombol")}
                    </Button>
                )}

                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                >
                    {nicknameError ? t("order.Tutup") : t("order.Batal")}
                </Button>
            </div>
        </div>
    );
};

export default ConfirmDrawer;