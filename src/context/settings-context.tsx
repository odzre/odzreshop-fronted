"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Settings } from "@/types";

const SettingsContext = createContext<Settings>({
    success: false,
    data: {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [settings, setSettings] = useState<Settings>({
        success: false,
        data: {},
    });

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/settings", {
                    cache: "no-store",
                });

                if (!res.ok) throw new Error("Gagal memuat settings");

                const result = await res.json();
                const raw = result.data || {};

                /*
                |--------------------------------------------------------------------------
                | NORMALIZE CONTACT
                |--------------------------------------------------------------------------
                */

                const contact = {
                    button_type:
                        raw["contact.button_type"] ??
                        raw.contact?.button_type ??
                        "image",

                    button_text:
                        raw["contact.button_text"] ??
                        raw.contact?.button_text ??
                        "Chat CS",

                    button_icon:
                        raw["contact.button_icon"] ??
                        raw.contact?.button_icon ??
                        "headset",

                    main_icon:
                        raw["contact.main_icon"] ??
                        raw.contact?.main_icon ??
                        null,

                    list: Array.isArray(
                        raw["contact.list"] ?? raw.contact?.list
                    )
                        ? raw["contact.list"] ?? raw.contact?.list
                        : [],
                };

                /*
                |--------------------------------------------------------------------------
                | NORMALIZE REGION
                |--------------------------------------------------------------------------
                */

                const regionData: any[] =
                    raw["region.data"] ??
                    raw.region?.data ??
                    [];

                const defaultActive =
                    raw["region.active"] ??
                    raw.region?.active ??
                    "ID";

                const defaultCurrency =
                    raw["region.currency"] ??
                    raw.region?.currency ??
                    "IDR";

                const defaultRate = Number(
                    raw["region.exchange_rate"] ??
                    raw.region?.exchange_rate ??
                    1
                );

                // 🔥 Cek localStorage — pakai region yang dipilih user
                const savedRegion =
                    typeof window !== "undefined"
                        ? localStorage.getItem("site-region")
                        : null;

                const userRegion: any = savedRegion
                    ? regionData.find((r: any) => r.code === savedRegion)
                    : null;

                const region = {
                    active: userRegion?.code ?? defaultActive,
                    currency: userRegion?.currency ?? defaultCurrency,
                    exchange_rate: Number(userRegion?.exchange_rate ?? defaultRate),
                    data: regionData,
                    languages: userRegion?.language ?? ["id", "en"],
                };

                /*
                |--------------------------------------------------------------------------
                | NORMALIZE THEME
                |--------------------------------------------------------------------------
                */

                const theme = {
                    root: {
                        background: raw["theme.root.background"],
                        foreground: raw["theme.root.foreground"],

                        card: raw["theme.root.card"],
                        card_foreground: raw["theme.root.card_foreground"],

                        popover: raw["theme.root.popover"],
                        popover_foreground:
                            raw["theme.root.popover_foreground"],

                        primary: raw["theme.root.primary"],
                        primary_foreground:
                            raw["theme.root.primary_foreground"],

                        secondary: raw["theme.root.secondary"],
                        secondary_foreground:
                            raw["theme.root.secondary_foreground"],

                        muted: raw["theme.root.muted"],
                        muted_foreground:
                            raw["theme.root.muted_foreground"],

                        accent: raw["theme.root.accent"],
                        accent_foreground:
                            raw["theme.root.accent_foreground"],

                        destructive: raw["theme.root.destructive"],
                        destructive_foreground:
                            raw["theme.root.destructive_foreground"],

                        border: raw["theme.root.border"],
                        input: raw["theme.root.input"],
                        ring: raw["theme.root.ring"],

                        radius: raw["theme.root.radius"],
                    },

                    dark: {
                        background: raw["theme.dark.background"],
                        foreground: raw["theme.dark.foreground"],

                        card: raw["theme.dark.card"],
                        card_foreground: raw["theme.dark.card_foreground"],

                        popover: raw["theme.dark.popover"],
                        popover_foreground:
                            raw["theme.dark.popover_foreground"],

                        primary: raw["theme.dark.primary"],
                        primary_foreground:
                            raw["theme.dark.primary_foreground"],

                        secondary: raw["theme.dark.secondary"],
                        secondary_foreground:
                            raw["theme.dark.secondary_foreground"],

                        muted: raw["theme.dark.muted"],
                        muted_foreground:
                            raw["theme.dark.muted_foreground"],

                        accent: raw["theme.dark.accent"],
                        accent_foreground:
                            raw["theme.dark.accent_foreground"],

                        destructive: raw["theme.dark.destructive"],
                        destructive_foreground:
                            raw["theme.dark.destructive_foreground"],

                        border: raw["theme.dark.border"],
                        input: raw["theme.dark.input"],
                        ring: raw["theme.dark.ring"],
                    },

                    gradient: {
                        active: raw["theme.gradient.active"],
                        dir: raw["theme.gradient.dir"],

                        from: {
                            color: raw["theme.gradient.from.color"],
                            stop: raw["theme.gradient.from.stop"],
                        },

                        via: {
                            color: raw["theme.gradient.via.color"],
                            stop: raw["theme.gradient.via.stop"],
                        },

                        to: {
                            color: raw["theme.gradient.to.color"],
                            stop: raw["theme.gradient.to.stop"],
                        },
                    },
                };

                const maintenance = {
                    isMaintenance:
                        raw["maintenance.isMaintenance"] ??
                        raw.maintenance?.isMaintenance ??
                        false,

                    message:
                        raw["maintenance.message"] ??
                        raw.maintenance?.message ??
                        "Website sedang maintenance",
                };

                setSettings({
                    success: result.success,
                    data: {
                        ...raw,
                        contact,
                        region,
                        theme,
                        maintenance,
                    },
                });
                /*
                     |--------------------------------------------------------------------------
                     | REDIRECT IF MAINTENANCE ACTIVE
                     |--------------------------------------------------------------------------
                     */

                if (
                    maintenance.isMaintenance &&
                    pathname !== "/maintenance"
                ) {
                    router.replace("/maintenance");
                }
            } catch (err) {
                console.error("Gagal memuat settings:", err);
            }
        })();
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
};