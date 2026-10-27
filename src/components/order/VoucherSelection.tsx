"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

interface Voucher {
    id: number;
    code: string;
    type: string;
    amount: number | string;
    max_discount?: number;
    min_amount?: number;
    expires_at?: string;
    note?: string;
    game_id?: number | null;
    allowed_roles?: string[] | null;
    available: boolean;
}

interface VoucherSelectionProps {
    productPrice: number;
    selectedProduct: string | null;
    slug: string;
    currentGameId?: number | null;
    id_games?: string | null;
    server_games?: string | null;
    onApply: (code: string, discount?: number, finalPrice?: number) => void;
    inputs?: { id?: string; server?: string };
    gameConfig?: { required_inputs?: string[] };
}

const VoucherSelection: React.FC<VoucherSelectionProps> = ({
    productPrice,
    selectedProduct,
    slug,
    currentGameId,
    id_games,
    server_games,
    onApply,
    inputs,
    gameConfig
}) => {
    const { user } = useUser();
    const { data: session } = useSession();
    const { t } = useTranslation();
    const { format } = useCurrency();

    const token = user?.token ?? session?.user?.token ?? null;

    const [voucherCode, setVoucherCode] = useState<string | null>(null);
    const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
    const [voucherList, setVoucherList] = useState<Voucher[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(false);

    useEffect(() => {
        if (selectedProduct) {
            setVoucherCode(null);
            setVoucherMessage(null);
        }
    }, [selectedProduct]);

    const validateBeforeVoucher = (): boolean => {
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
                    "order.Silakan isi data akun terlebih dahulu sebelum menggunakan voucher."
                )
            );
            return false;
        }

        return true;
    };

    const handleCheckVoucher = async () => {
        if (!voucherCode) {
            toast.error(t("order.Masukkan kode voucher terlebih dahulu"));
            return;
        }

        if (!validateBeforeVoucher()) return;

        setLoading(true);

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json"
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch("/api/voucher/check", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    code: voucherCode.trim(),
                    product_id: selectedProduct,
                    game_slug: slug,
                    id_games,
                    server_games
                })
            });

            const data = await res.json();

            if (data.success) {
                setVoucherMessage(`Voucher valid! Diskon ${format(data.discount)}`);
                onApply(voucherCode.trim(), data.discount, data.finalPrice);
                toast.success(t("order.Voucher berhasil digunakan"));
            } else {
                setVoucherMessage(data.message);
            }
        } catch (err) {
            toast.error(t("order.Terjadi kesalahan saat cek voucher"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = async () => {
        if (!validateBeforeVoucher()) return;

        setLoadingList(true);
        try {
            const res = await fetch("/api/voucher/list");
            const data = await res.json();
            const now = new Date();

            const normalized = (data.vouchers || []).map((v: any) => ({
                ...v,
                title: v.note || v.code,
                available: !v.expires_at || new Date(v.expires_at) > now
            }));

            setVoucherList(normalized);
            setOpen(true);
        } catch (err) {
            console.error("❌ Error ambil voucher:", err);
            toast.error(t("order.Gagal mengambil daftar voucher."));
            setVoucherList([]);
        } finally {
            setLoadingList(false);
        }
    };

    return (
        <section
            id="voucher"
            className="relative scroll-mt-20 rounded-xl bg-card/50 shadow-2xl md:scroll-mt-[7.5rem]"
        >
            <div className="flex items-center overflow-hidden rounded-t-xl bg-card">
                <div className="flex h-10 w-10 items-center justify-center bg-primary font-semibold text-white">
                    4
                </div>
                <h2 className="px-4 py-2 text-sm font-semibold text-card-foreground">
                    {t("order.Kode Promo")}
                </h2>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Input Voucher */}
                <div className="flex gap-x-2">
                    <Input
                        placeholder={t("order.Ketik Kode Promo Kamu")}
                        value={voucherCode ?? ""}
                        onChange={(e) => setVoucherCode(e.target.value)}
                    />

                    <Button
                        type="button"
                        variant="default"
                        size="lg"
                        onClick={handleCheckVoucher}
                        disabled={loading}
                    >
                        {loading ? t("order.Cek...") : t("order.Gunakan")}
                    </Button>
                </div>

                {voucherMessage && (
                    <div
                        className={`p-2 text-xs text-center rounded-md border ${voucherMessage.includes("valid")
                            ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                            : "border-red-500 bg-red-100 text-red-800"
                            }`}
                    >
                        {voucherMessage}
                    </div>
                )}

                {/* Tombol buka daftar voucher */}
                <div>
                    <Button
                        type="button"
                        variant="default"
                        size="lg"
                        onClick={handleOpenModal}
                        disabled={loadingList}
                    >
                        {loadingList ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-ticket-percent"
                                >
                                    <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
                                    <path d="M9 9h.01"></path>
                                    <path d="m15 9-6 6"></path>
                                    <path d="M15 15h.01"></path>
                                </svg>

                                <span>{t("order.Pakai Promo Yang Tersedia")}</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-2xl rounded-xl p-6">
                    <DialogTitle className="text-center text-lg font-semibold">
                        {t("order.Promo yang tersedia")}
                    </DialogTitle>

                    <DialogDescription className="text-center mb-3">
                        {t("order.Pilih salah satu promo di bawah ini")}
                    </DialogDescription>

                    <div className="grid gap-3">
                        {voucherList.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-foreground bg-muted/30">
                                <p className="text-sm font-medium">
                                    {t("order.Tidak ada promo tersedia!")}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("order.Silakan periksa kembali nanti!")}
                                </p>
                            </div>
                        )}

                        {voucherList.map((v) => {
                            const isForThisGame =
                                !v.game_id || (currentGameId && v.game_id === currentGameId);
                            const canUse = isForThisGame && v.available;

                            return (
                                <div
                                    key={v.id}
                                    className={`relative flex flex-col rounded-lg border p-4 ${canUse
                                        ? "border-muted hover:ring-2 hover:ring-my-color3 cursor-pointer"
                                        : "border-muted opacity-50"
                                        }`}
                                    onClick={() => {
                                        if (canUse) {
                                            setVoucherCode(v.code);
                                            setVoucherMessage(
                                                `Voucher ${v.code} dipilih. Klik Gunakan untuk validasi.`
                                            );
                                            toast.info(
                                                `Voucher ${v.code} dipilih. Klik Gunakan untuk validasi.`
                                            );
                                            setOpen(false);
                                        }
                                    }}
                                >
                                    <span className="text-sm font-semibold text-primary">
                                        {v.note || v.code}
                                    </span>

                                    {v.expires_at && (
                                        <span className="mt-1 text-xs text-foreground">
                                            {t("order.Berlaku hingga")}{" "}
                                            {new Date(v.expires_at).toLocaleDateString("id-ID")}
                                        </span>
                                    )}

                                    <span className="mt-1 text-xs text-foreground">
                                        {t("order.Min. pembelian")} {format(v.min_amount ?? 0)}
                                    </span>

                                    <span className="mt-2 text-xs font-medium text-primary">
                                        Kode Promo: <span className="font-semibold">{v.code}</span>
                                    </span>

                                    <span
                                        className={`absolute bottom-2 right-2 rounded-md px-2 py-1 text-xs font-medium ${canUse
                                            ? "bg-emerald-200 text-emerald-900"
                                            : "bg-destructive text-white"
                                            }`}
                                    >
                                        {canUse
                                            ? t("order.Tersedia")
                                            : t("order.Tidak Berlaku")}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default VoucherSelection;