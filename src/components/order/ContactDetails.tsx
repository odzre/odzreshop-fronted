"use client";

import { RefObject, useEffect } from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/ui/phone-input";

interface ContactDetailsProps {
    whatsappRef: RefObject<HTMLDivElement>;
    whatsapp: string;
    setWhatsapp: (raw: string, full: string) => void;
    email: string;
    setEmail: (email: string) => void;
    isLoggedIn: boolean;
    loggedInEmail?: string | null;
}

export default function ContactDetails({
    whatsappRef,
    whatsapp,
    setWhatsapp,
    email,
    setEmail,
    isLoggedIn,
    loggedInEmail
}: ContactDetailsProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (isLoggedIn && loggedInEmail) {
            setEmail(loggedInEmail);
        }
    }, [isLoggedIn, loggedInEmail, setEmail]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setEmail(value);
    };

    return (
        <section
            ref={whatsappRef}
            id="4"
            className="relative scroll-mt-20 rounded-xl bg-card/50 shadow-sm md:scroll-mt-[7.5rem]"
        >
            <div className="flex items-center rounded-t-xl bg-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-tl-xl bg-primary font-semibold text-white">
                    5
                </div>

                <h2 className="ml-3 text-sm font-semibold text-card-foreground">
                    {t("order.Detail Kontak")}
                </h2>
            </div>

            <div className="p-4 space-y-4">

                {/* Email */}
                <div className="space-y-1">
                    <label
                        htmlFor="email"
                        className="block text-xs font-medium text-foreground"
                    >
                        Email
                    </label>

                    <Input
                        id="email"
                        type="email"
                        placeholder={t("order.contoh_email_placeholder")}
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoggedIn}
                    />

                    {isLoggedIn && (
                        <p className="text-[11px] italic text-muted-foreground">
                            {t("order.Email otomatis diambil dari akun kamu")}
                        </p>
                    )}
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                    <label
                        htmlFor="whatsapp"
                        className="block text-xs font-medium text-foreground"
                    >
                        {t("order.No. WhatsApp")}
                    </label>

                    <PhoneInput
                        value={whatsapp}
                        onChange={(raw, full) => {
                            setWhatsapp(raw, full);
                        }}
                    />

                    <span className="text-[11px] italic text-muted-foreground">
                        {t("order.Nomor ini akan dihubungi jika terjadi masalah")}
                    </span>
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 w-fit rounded-lg bg-card px-4 py-2 text-xs text-card-foreground">
                    <Info className="h-4 w-4" />
                    <span>
                        {t(
                            "order.Bukti transaksi akan dikirim ke email dan WhatsApp di atas"
                        )}
                    </span>
                </div>

            </div>
        </section>
    );
}