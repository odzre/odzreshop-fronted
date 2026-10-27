"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wallet, CreditCard, Settings, LogOut, List, Star, ArrowUpCircle } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useSettings } from "@/context/settings-context";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { UserProvider } from "@/context/user-context";
import BottomNav from "@/components/member/BottomNav";

export function MemberLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const settings = useSettings();

    const coinImage =
        settings?.data?.["general.coin_image"] ||
        settings?.data?.general?.coin_image;

    useEffect(() => {
        if (session?.user && !session.user.phone_number) {
            toast.warning("Mohon lengkapi WhatsApp terlebih dahulu.");
        }
    }, [session, router, pathname]);

    const menu = [
        { label: "Credits", href: "/member/credits", icon: "custom" },
        { label: "Dashboard", href: "/dashboard", icon: Wallet },
        { label: "Upgrade Role", href: "/upgrade-roles", icon: ArrowUpCircle },
        { label: "Transaksi", href: "/transactions", icon: CreditCard },
        { label: "Mutasi", href: "/member/mutasi", icon: List },
        { label: "Poin", href: "/member/points", icon: Star },
        { label: "Pengaturan", href: "/settings", icon: Settings }
    ];

    return (
        // ✅ Bungkus semua konten dengan UserProvider
        <UserProvider>
            <div className="relative container w-full px-2">
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-8">
                    {/* === Sidebar === */}
                    <aside className="sticky top-[9.5rem] h-fit border border-muted rounded-2xl hidden lg:block p-4 md:col-span-2">
                        <ul className="space-y-4">
                            {menu.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
                                                ? "bg-gradient-to-l from-my-color3 to-transparent text-primary"
                                                : "text-muted-foreground hover:bg-gradient-to-l hover:from-my-color3 hover:to-transparent hover:text-foreground"
                                                }`}
                                        >
                                            {item.icon === "custom" && coinImage ? (
                                                <Image
                                                    src={coinImage}
                                                    alt="Coin"
                                                    width={22}
                                                    height={22}
                                                    className="w-5 h-5"
                                                />
                                            ) : (
                                                <item.icon size={18} />
                                            )}
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}

                            {/* === Logout === */}
                            <li className="mt-3 border-t border-dashed pt-3">
                                <button
                                    type="button"
                                    onClick={() => signOut({ callbackUrl: "/signin" })}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Keluar
                                </button>
                            </li>
                        </ul>
                    </aside>

                    {/* === Konten Halaman === */}
                    <div className="col-span-6">{children}</div>
                </section>
            </div>
            <BottomNav />

        </UserProvider>
    );
}
