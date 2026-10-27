"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from "@/components/ui/drawer";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { Crown, Gem, Rocket, Wallet, Check, Loader2, CreditCard, Info } from "lucide-react";

interface RolePrice {
    enabled: boolean;
    price: number;
}

interface Prices {
    gold?: RolePrice;
    platinum?: RolePrice;
    reseller?: RolePrice;
}

interface PaymentMethod {
    id: number;
    name: string;
    code: string;
    group: string;
    type: string;
    fee: number;
    fee_percent: number;
    images?: string | null;
    provider?: string;
}

const ROLE_CONFIG = [
    {
        slug: "gold" as const,
        label: "Gold",
        icon: Crown,
        badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        iconClass: "bg-amber-500/15 text-amber-500",
        chipClass: "border-amber-500/40"
    },
    {
        slug: "platinum" as const,
        label: "Platinum",
        icon: Gem,
        badgeClass: "bg-blue-800/20 text-blue-700 border-blue-800/30 dark:text-blue-400",
        iconClass: "bg-blue-800/20 text-blue-700 dark:text-blue-400",
        chipClass: "border-blue-800/50"
    },
    {
        slug: "reseller" as const,
        label: "Reseller",
        icon: Rocket,
        badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
        iconClass: "bg-red-500/15 text-red-500",
        chipClass: "border-red-500/40"
    }
];

const HIERARCHY: Record<string, number> = {
    basic: 1,
    gold: 2,
    platinum: 3,
    reseller: 4,
    admin: 5
};

export default function UpgradeRoles() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { format } = useCurrency();

    const [prices, setPrices] = useState<Prices | null>(null);
    const [pricesLoading, setPricesLoading] = useState(true);

    // role yang dipilih (kartu)
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    // mode pembayaran: saldo | gateway (radio cards seperti nominal deposit)
    const [payMode, setPayMode] = useState<"saldo" | "gateway" | null>(null);

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [methodsLoading, setMethodsLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const userRole = session?.user?.role ?? "basic";
    const userLevel = HIERARCHY[userRole] ?? 1;
    const userSaldo = Number(session?.user?.saldo ?? 0);
    const isAdmin = userRole === "admin";

    const fetchPrices = useCallback(async () => {
        try {
            const res = await fetch("/api/role-purchases", { cache: "no-store" });
            const data = await res.json();
            if (res.ok && data.success) {
                setPrices(data.data);
            }
        } catch {
            console.error("Failed to fetch prices");
        } finally {
            setPricesLoading(false);
        }
    }, []);

    const fetchMethods = useCallback(async () => {
        setMethodsLoading(true);
        try {
            let deviceId = localStorage.getItem("device_id");
            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            const res = await fetch("/api/deposit", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-Device-Id": deviceId ?? "" }
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMethods(data.data?.methods ?? []);
            }
        } catch {
            console.error("Failed to fetch methods");
        } finally {
            setMethodsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    // pilih role → fetch metode
    const handleSelectRole = (slug: string) => {
        setSelectedRole(slug);
        setPayMode(null);
        setSelectedMethod(null);
        fetchMethods();
    };

    const selectedPrice = selectedRole
        ? prices?.[selectedRole as keyof Prices]?.price ?? 0
        : 0;

    const totalToPay = selectedMethod
        ? selectedPrice +
          (Number(selectedMethod.fee) || 0) +
          Math.floor(((Number(selectedMethod.fee_percent) || 0) * selectedPrice) / 100)
        : selectedPrice;

    const saldoCukup = userSaldo >= selectedPrice;

    const openConfirm = () => {
        if (!payMode) {
            toast.error("Pilih metode pembayaran terlebih dahulu");
            return;
        }
        if (payMode === "gateway" && !selectedMethod) {
            toast.error("Pilih metode pembayaran terlebih dahulu");
            return;
        }
        setConfirmOpen(true);
    };

    const handleSubmit = async () => {
        if (!selectedRole || !payMode) return;

        setSubmitting(true);

        try {
            let deviceId = localStorage.getItem("device_id");
            if (!deviceId) {
                await new Promise((r) => setTimeout(r, 300));
                deviceId = localStorage.getItem("device_id");
            }

            const res = await fetch("/api/role-purchases", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-Device-Id": deviceId ?? ""
                },
                body: JSON.stringify({
                    role: selectedRole,
                    payment_mode: payMode,
                    method_code: payMode === "gateway" ? selectedMethod?.code : undefined
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.message || data.error || "Gagal memproses pembelian");
                return;
            }

            if (payMode === "saldo") {
                toast.success(data.message || "Upgrade berhasil!");
                // 🔥 update session secara realtime dengan data dari response backend
                await update({
                    role: data.data?.role ?? selectedRole,
                    saldo: data.data?.saldo
                });
                setConfirmOpen(false);
                setSelectedRole(null);
                setPayMode(null);
                setSelectedMethod(null);
                router.refresh();
            } else {
                const invoice = data.data?.purchase?.invoice_number;
                setConfirmOpen(false);
                if (invoice) {
                    router.push(`/upgrade-roles/${invoice}`);
                }
            }
        } catch {
            toast.error("Terjadi kesalahan. Coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (status === "loading" || pricesLoading) {
        return (
            <div className="w-full space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-72 w-full rounded-xl" />
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        );
    }

    const selectedRoleConfig = ROLE_CONFIG.find((r) => r.slug === selectedRole);

    return (
        <div className="col-span-6 space-y-6">
            <h2 className="text-lg font-semibold">Upgrade Role</h2>

            {/* ================= PILIH ROLE ================= */}
            <section className="rounded-xl bg-background/90 shadow-sm ring-1 ring-border">
                <div className="flex items-center bg-muted rounded-t-xl">
                    <h2 className="ml-3 text-sm font-semibold py-2">Pilih Role</h2>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {ROLE_CONFIG.map((role) => {
                            const price = prices?.[role.slug as keyof Prices];
                            const roleLevel = HIERARCHY[role.slug] ?? 0;
                            const available = price?.enabled && price.price > 0;
                            const owned = roleLevel <= userLevel && roleLevel > HIERARCHY.basic;
                            const blocked = !available || owned || isAdmin || roleLevel <= userLevel;
                            const selected = selectedRole === role.slug;

                            return (
                                <label
                                    key={role.slug}
                                    className={cn(
                                        "relative flex cursor-pointer flex-col justify-between rounded-xl border border-transparent bg-muted p-4 shadow-sm",
                                        blocked
                                            ? "opacity-50 cursor-not-allowed"
                                            : selected
                                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                              : "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                                    )}
                                    onClick={(e) => {
                                        if (blocked) {
                                            e.preventDefault();
                                            return;
                                        }
                                        handleSelectRole(role.slug);
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        className="sr-only"
                                        checked={selected}
                                        disabled={blocked}
                                        readOnly
                                    />

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", role.iconClass)}>
                                                <role.icon className="h-4 w-4" />
                                            </span>
                                            <span className="font-semibold text-sm md:text-base">
                                                {role.label}
                                            </span>
                                        </div>

                                        <span className={cn("rounded-full border px-2 py-0.5 text-xxs font-semibold uppercase", role.badgeClass)}>
                                            {blocked
                                                ? owned
                                                    ? "Role Anda"
                                                    : isAdmin
                                                      ? "Admin"
                                                      : "N/A"
                                                : format(price?.price ?? 0)}
                                        </span>
                                    </div>

                                    <div className="mt-3 space-y-1">
                                        <p className="flex items-center gap-1.5 text-xxs text-muted-foreground">
                                            <Check className="h-3 w-3 text-green-500" />
                                            Sekali bayar, aktif permanen
                                        </p>
                                        <p className="flex items-center gap-1.5 text-xxs text-muted-foreground">
                                            <Check className="h-3 w-3 text-green-500" />
                                            Harga spesial semua transaksi
                                        </p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ================= METODE PEMBAYARAN ================= */}
            {selectedRole && (
                <section className="rounded-xl bg-background/90 shadow-sm ring-1 ring-border">
                    <div className="flex items-center bg-muted rounded-t-xl">
                        <h2 className="ml-3 text-sm font-semibold py-2">Pilih Pembayaran</h2>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* MODE: SALDO / GATEWAY */}
                        <div className="grid grid-cols-2 gap-3">
                            <label
                                className={cn(
                                    "relative flex cursor-pointer flex-col justify-center rounded-xl border border-transparent bg-muted p-3 shadow-sm",
                                    payMode === "saldo"
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="paymode"
                                    className="sr-only"
                                    checked={payMode === "saldo"}
                                    onChange={() => {
                                        setPayMode("saldo");
                                        setSelectedMethod(null);
                                    }}
                                />
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Wallet className="h-3.5 w-3.5" />
                                    Saldo
                                </span>
                                <span className="font-semibold text-sm md:text-base">
                                    {format(userSaldo)}
                                </span>
                            </label>

                            <label
                                className={cn(
                                    "relative flex cursor-pointer flex-col justify-center rounded-xl border border-transparent bg-muted p-3 shadow-sm",
                                    payMode === "gateway"
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="paymode"
                                    className="sr-only"
                                    checked={payMode === "gateway"}
                                    onChange={() => setPayMode("gateway")}
                                />
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Payment Gateway
                                </span>
                                <span className="font-semibold text-sm md:text-base">
                                    QRIS / VA / E-Wallet
                                </span>
                            </label>
                        </div>

                        {/* PERINGATAN SALDO KURANG */}
                        {payMode === "saldo" && !saldoCukup && (
                            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
                                <Info className="h-4 w-4 shrink-0" />
                                Saldo tidak cukup ({format(userSaldo)}). Silakan{" "}
                                <a href="/member/deposit" className="font-semibold underline">
                                    deposit
                                </a>{" "}
                                terlebih dahulu.
                            </div>
                        )}

                        {/* LIST METODE GATEWAY */}
                        {payMode === "gateway" && (
                            <div className="border-t pt-4">
                                {methodsLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : methods.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-4">
                                        Metode pembayaran tidak tersedia
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
                                        {methods.map((method) => {
                                            const selected = selectedMethod?.id === method.id;

                                            const flatFee = Number(method.fee) || 0;
                                            const percentFee = Number(method.fee_percent) || 0;

                                            const total =
                                                selectedPrice +
                                                flatFee +
                                                Math.floor((percentFee * selectedPrice) / 100);

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
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={method.images}
                                                                alt={method.name}
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
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* BUTTON */}
            {selectedRole && (
                <div className="pt-4 border-t flex justify-end">
                    <Button
                        onClick={openConfirm}
                        disabled={submitting || (payMode === "saldo" && !saldoCukup) || (payMode === "gateway" && !selectedMethod)}
                        className="w-full md:w-auto bg-my-color3 text-primary-foreground"
                    >
                        Lanjutkan Pembayaran
                    </Button>
                </div>
            )}

            {/* DRAWER KONFIRMASI */}
            <Drawer open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DrawerContent className="w-full lg:max-w-lg mx-auto rounded-t-2xl border-t shadow-lg">
                    <DrawerHeader>
                        <DrawerTitle className="text-lg font-semibold text-center">
                            Konfirmasi Upgrade Role
                        </DrawerTitle>
                        <DrawerDescription className="text-center text-sm text-muted-foreground">
                            Pastikan data pembelian kamu sudah benar sebelum melanjutkan.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-6 py-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span>Role</span>
                            <span className="font-medium uppercase">
                                {selectedRoleConfig?.label}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Harga Role</span>
                            <span className="font-medium">{format(selectedPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Metode Pembayaran</span>
                            <span className="font-medium">
                                {payMode === "saldo"
                                    ? "Saldo"
                                    : selectedMethod?.name || ""}
                            </span>
                        </div>
                        {payMode === "gateway" && selectedMethod && (
                            <div className="flex justify-between">
                                <span>Biaya Admin</span>
                                <span className="font-medium">
                                    {format(selectedMethod.fee || 0)}
                                    {(selectedMethod.fee_percent || 0) > 0 &&
                                        ` + ${selectedMethod.fee_percent}%`}
                                </span>
                            </div>
                        )}
                        <div className="border-t my-2" />
                        <div className="flex justify-between text-base font-semibold">
                            <span>Total Pembayaran</span>
                            <span className="text-primary">{format(totalToPay)}</span>
                        </div>
                    </div>

                    <DrawerFooter className="px-6 pb-6">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-my-color3 text-white hover:bg-my-color3/80"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> &nbsp;
                                    Memproses...
                                </>
                            ) : (
                                "Konfirmasi & Bayar"
                            )}
                        </Button>

                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full">
                                Batal
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
