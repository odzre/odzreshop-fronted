"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, CreditCard, Settings, List, Home, Star, ArrowUpCircle } from "lucide-react";
import Image from "next/image";
import { useSettings } from "@/context/settings-context";
import type { ElementType } from "react"; // ⬅️ penting

export default function BottomNav() {
    const pathname = usePathname();
    const settings = useSettings();

    const coinImage =
        settings?.data?.["general.coin_image"] ||
        settings?.data?.general?.coin_image;

    const menu = [
        { label: "Credits", href: "/member/credits", icon: "custom", center: true },
        { label: "Dashboard", href: "/dashboard", icon: Home },
        { label: "Upgrade", href: "/upgrade-roles", icon: ArrowUpCircle },
        { label: "Transaksi", href: "/transactions", icon: CreditCard },

        { label: "Mutasi", href: "/member/mutasi", icon: List },
        { label: "Poin", href: "/member/points", icon: Star },
        { label: "Pengaturan", href: "/settings", icon: Settings },
    ];

    const activeIndex = menu.findIndex((i) => i.href === pathname);

    return (
        <>
            <section className="fixed bottom-0 left-0 w-full h-20 flex items-end justify-center bg-transparent z-50 lg:hidden overflow-hidden">
                {/* === FULL WIDTH BAR === */}
                <div className="absolute bottom-0 left-0 w-full h-[62px] rounded-t-2xl backdrop-blur-md shadow-[0_-4px_18px_rgba(0,0,0,0.12)] bg-my-color/20" />

                {/* === MENU WRAPPER === */}
                <ul className="relative w-full flex items-end justify-between px-6">
                    {menu.map((item) => {
                        const active = pathname === item.href;

                        // === Floating button (Credits) ===
                        if (item.center) {
                            return (
                                <li key={item.href} className="relative z-30 flex justify-center flex-1">
                                    <Link
                                        href={item.href}
                                        className={`absolute bottom-5 rounded-full flex items-center justify-center transition-all ${active
                                            ? "bg-my-color3 scale-110 shadow-2xl"
                                            : "backdrop-blur-md scale-100 shadow-lg"
                                            }`}
                                        style={{ width: "60px", height: "60px" }}
                                    >
                                        {item.icon === "custom" ? (
                                            <Image
                                                src={coinImage}
                                                alt="Credits"
                                                width={34}
                                                height={34}
                                                className={`transition-all ${active ? "scale-110" : "opacity-80"}`}
                                            />
                                        ) : null}
                                    </Link>
                                </li>
                            );
                        }

                        // === Normal buttons kiri-kanan
                        return (
                            <li key={item.href} className="flex-1 py-2 flex justify-center">
                                <Link
                                    href={item.href}
                                    className="flex flex-col items-center gap-1 transition-all"
                                >
                                    <span
                                        className={`transition-all ${active
                                            ? "text-primary -translate-y-1 scale-110"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        {(() => {
                                            const Icon = item.icon as ElementType; // ⬅️ fix garis merah
                                            return <Icon size={18} />;
                                        })()}
                                    </span>

                                    <span
                                        className={`text-[11px] font-medium transition-all ${active ? "text-primary" : "text-muted-foreground"
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
}
