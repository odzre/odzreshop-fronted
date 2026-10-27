"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/settings-context";
import Image from "next/image";

export default function LanguageDrawer() {
    const { t, i18n } = useTranslation();
    const { data } = useSettings();

    const region = data?.region || {};
    const activeRegion = region.active ?? "ID";
    const availableRegions = region.data || [];
    const availableLanguages: string[] = region.languages || ["id", "en"];
    const currency = region.currency ?? "IDR";
    const [selectedCurrency, setSelectedCurrency] = useState("IDR");

    const [open, setOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(activeRegion);
    const [selectedLang, setSelectedLang] = useState<"id" | "en">("en");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const savedLang =
            (localStorage.getItem("site-language") as "id" | "en" | null) ?? "en";
        const savedRegion = localStorage.getItem("site-region") ?? activeRegion;

        setSelectedLang(savedLang);
        setSelectedRegion(savedRegion);
        i18n.changeLanguage(savedLang);

        // Sync currency dari saved region
        const regionList = data?.region?.data || [];
        const found = regionList.find((r: any) => r.code === savedRegion);
        if (found) {
            setSelectedCurrency(found.currency || "IDR");
        } else {
            setSelectedCurrency(currency);
        }

        setIsMounted(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n, activeRegion]);

    const handleChangeLang = (lang: "id" | "en") => {
        setSelectedLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem("site-language", lang);
        setOpen(false);
    };

    const handleChangeRegion = (code: string) => {
        setSelectedRegion(code);
        localStorage.setItem("site-region", code);

        const found = availableRegions.find((r: any) => r.code === code);

        // 🔥 ambil language dari region
        const regionLang = found?.language?.[0];

        // ✅ VALIDASI biar sesuai type "id" | "en"
        const validLang: "id" | "en" =
            regionLang === "id" || regionLang === "en"
                ? regionLang
                : "en";

        setSelectedLang(validLang);
        i18n.changeLanguage(validLang);
        localStorage.setItem("site-language", validLang);

        // 🔥 Sync currency
        setSelectedCurrency(found?.currency || "IDR");

        setOpen(false);

        // 🔥 Reload halaman supaya settings-context baca ulang localStorage
        // dan apply currency/exchange_rate yang benar
        window.location.reload();
    };
    const LOCS =
        availableRegions.map((r: any) => {
            const cleanName = r.name.replace(/\s*\([A-Z]{3}\)/, "");

            return {
                code: r.code,
                label: `${cleanName} (${r.currency})`,
                flag: r.flag ?? r.code.toLowerCase(),
                currency: r.currency
            };
        });

    const LANGS = availableLanguages.map((lang) => ({
        code: lang,
        label: lang === "id" ? "Bahasa Indonesia" : "English",
        flag: lang === "en" ? "gb" : lang
    }));

    const getLangFlag = (lang: string) => {
        return lang === "en" ? "gb" : lang;
    };

    if (!isMounted) {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger */}
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center px-4 py-4 gap-2"
                >
                    <Image
                        src={`https://react-circle-flags.pages.dev/${getLangFlag(selectedLang)}.svg`}
                        alt={selectedLang}
                        width={20}
                        height={20}
                    />
                    <span className="uppercase">{selectedLang} / {selectedCurrency}</span>
                </Button>
            </DialogTrigger>

            {/* Dialog */}
            <DialogContent className="sm:max-w-xl rounded-xl p-6">
                <DialogTitle className="text-center text-lg font-semibold">
                    {t("choose_language_region", {
                        defaultValue: "Pilih Lokasi & Bahasa"
                    })}
                </DialogTitle>

                <DialogDescription className="text-center mb-6">
                    {t("select_language_region_desc", {
                        defaultValue: "Atur lokasi dan bahasa tampilan situs"
                    })}
                </DialogDescription>

                {/* Region */}
                <div className="flex flex-col gap-3 mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                        {t("region", { defaultValue: "Lokasi" })}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {LOCS.map((loc) => (
                            <Button
                                key={loc.code}
                                variant={selectedRegion === loc.code ? "default" : "outline"}
                                onClick={() => handleChangeRegion(loc.code)}
                                className="flex w-full items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={`https://react-circle-flags.pages.dev/${loc.flag}.svg`}
                                        alt={loc.label}
                                        width={20}
                                        height={20}
                                    />
                                    <span>{loc.label}</span>
                                </div>

                                {selectedRegion === loc.code && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="lucide lucide-check size-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Language */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                        {t("language", { defaultValue: "Bahasa" })}
                    </h3>

                    <div className="flex gap-3">
                        {LANGS.map((lang) => (
                            <Button
                                key={lang.code}
                                variant={selectedLang === lang.code ? "default" : "outline"}
                                onClick={() => handleChangeLang(lang.code as "id" | "en")}
                                className="flex w-full items-center justify-between gap-3 uppercase"
                            >
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={`https://react-circle-flags.pages.dev/${lang.flag}.svg`}
                                        alt={lang.label}
                                        width={20}
                                        height={20}
                                    />
                                    <span>{lang.code.toUpperCase()}</span>
                                </div>

                                {selectedLang === lang.code && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="lucide lucide-check size-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}