"use client";

import {
    Home,
    ReceiptText,
    Newspaper,
    User,
    Globe,
    LucideIcon,
    BadgeDollarSign,
    Calculator,
    Trophy,
    Handshake,
    ArrowUpCircle
} from "lucide-react";

type Submenu = {
    href: string;
    label: string;
    title?: string;
    icon?: LucideIcon;
    active?: boolean;
};

type Menu = {
    href: string;
    label: string;
    icon: LucideIcon;
    active?: boolean;
    submenus?: Submenu[];
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};

/**
 * ✅ Fungsi pembuat menu utama (multi-bahasa, aman untuk Next.js)
 * - Tidak menggunakan React Hook
 * - `t` dikirim dari komponen pemanggil (misal: Navbar)
 */
export function getMenuList(
    pathname: string,
    isLoggedIn: boolean,
    isMobile = false,
    t: (key: string, opt?: any) => string
): Group[] {
    const menu: Group[] = [
        {
            groupLabel: t("menu.main", { defaultValue: "Menu" }),
            menus: [
                {
                    href: "/",
                    label: t("menu.home", { defaultValue: "Beranda" }),
                    icon: Home
                },
                {
                    href: "/invoices",
                    label: t("menu.invoice", { defaultValue: "Cek Invoice" }),
                    icon: ReceiptText
                },
                {
                    href: "/leaderboard",
                    label: t("menu.leaderboard", { defaultValue: "Leaderboard" }),
                    icon: Trophy
                },
                {
                    href: "/kalkulator",
                    label: t("menu.calculator", { defaultValue: "Kalkulator" }),
                    icon: Calculator,
                    submenus: [
                        {
                            href: "/kalkulator/winrate",
                            label: t("menu.calculator_winrate", { defaultValue: "Win Rate" }),
                            title: t("menu.calculator_winrate_desc", {
                                defaultValue:
                                    "Menghitung total match untuk mencapai target win rate yang diinginkan."
                            }),
                            icon: Calculator
                        },
                        {
                            href: "/kalkulator/magic-wheel",
                            label: t("menu.calculator_magicwheel", {
                                defaultValue: "Magic Wheel"
                            }),
                            title: t("menu.calculator_magicwheel_desc", {
                                defaultValue:
                                    "Menghitung total diamond untuk mendapatkan skin Magic Wheel (MLBB)."
                            }),
                            icon: Calculator
                        },
                        {
                            href: "/kalkulator/zodiac",
                            label: t("menu.calculator_zodiac", { defaultValue: "Zodiac" }),
                            title: t("menu.calculator_zodiac_desc", {
                                defaultValue:
                                    "Memperkirakan kapan skin Zodiac muncul dan menghitung kebutuhan Starlight Crystal."
                            }),
                            icon: Calculator
                        }
                    ]
                },
                {
                    href: "/artikel",
                    label: t("menu.article", { defaultValue: "Artikel" }),
                    icon: Newspaper
                },
                {
                    href: "/partnership",
                    label: t("menu.partnership", { defaultValue: "Partnership" }),
                    icon: Handshake
                },
                {
                    href: "/tools/region-mlbb",
                    label: t("menu.region_mlbb", { defaultValue: "Cek Region MLBB" }),
                    icon: Globe
                }
            ]
        }
    ];

    if (isLoggedIn) {
        const userMenus: Menu[] = [
            {
                href: "/dashboard",
                label: t("menu.profile", { defaultValue: "Profil" }),
                icon: User
            },
            {
                href: "/upgrade-roles",
                label: t("menu.upgrade_role", { defaultValue: "Upgrade Role" }),
                icon: ArrowUpCircle
            }
        ];

        if (isMobile) {
            userMenus.push(
                {
                    href: "/member/credits",
                    label: t("menu.credits", { defaultValue: "Saldo" }),
                    icon: BadgeDollarSign
                },
                {
                    href: "/transactions",
                    label: t("menu.transactions", { defaultValue: "Transaksi" }),
                    icon: ReceiptText
                }
            );
        }

        menu.push({
            groupLabel: t("menu.user", { defaultValue: "User" }),
            menus: userMenus
        });
    }

    return menu;
}
