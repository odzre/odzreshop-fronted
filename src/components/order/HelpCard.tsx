"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface HelpCardProps {
    waNumber?: string;
}

export default function HelpCard({ waNumber }: HelpCardProps) {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    // 👉 Jangan render apapun jika waNumber kosong
    if (!waNumber) return null;

    const Trigger = (
        <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full inline-flex items-center justify-start gap-4 rounded-xl bg-my-color2/40 p-4 text-card-foreground shadow-2xl transition hover:bg-my-color2/90"
        >
            <svg
                width="32"
                height="32"
                viewBox="0 0 25 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.67151 19.7552C6.19123 20.657 7.34509 20.9653 8.24587 20.4446C9.14569 19.9239 9.45403 18.773 8.93431 17.8722L7.35188 15.1301C6.83216 14.2293 5.68121 13.92 4.77946 14.4397L4.55838 14.5667C3.99309 14.8935 3.70802 15.5645 3.90097 16.188C4.24422 17.2991 4.83278 18.4947 5.67151 19.7552Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.3415 19.7552C18.8217 20.657 17.6679 20.9653 16.7671 20.4446C15.8673 19.9239 15.559 18.773 16.0787 17.8722L17.6611 15.1301C18.1808 14.2293 19.3318 13.92 20.2335 14.4397L20.4546 14.5667C21.0199 14.8935 21.305 15.5645 21.112 16.188C20.7688 17.2991 20.1802 18.4947 19.3415 19.7552Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.10793 7.83938C5.62506 7.3565 5.595 6.56917 6.0643 6.07272C6.1186 6.01551 6.17387 5.9583 6.23107 5.90109C9.69555 2.43661 15.3116 2.43661 18.7761 5.90109C18.8323 5.95733 18.8866 6.01357 18.9409 6.07078C19.4112 6.5682 19.3812 7.35747 18.8973 7.84132C18.3844 8.35425 17.5612 8.3271 17.0589 7.8035C17.0288 7.77247 16.9988 7.74145 16.9678 7.71042C14.502 5.23496 10.5062 5.23496 8.0307 7.71042C8.00064 7.74048 7.97156 7.77053 7.9415 7.80156C7.4402 8.32322 6.61989 8.35134 6.10793 7.83938Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    opacity="0.4"
                    d="M19.1426 7.48242C20.6096 9.08425 21.5007 11.2077 21.5007 13.5474C21.5007 14.3939 21.3834 15.2133 21.1584 15.987"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    opacity="0.4"
                    d="M3.88688 16.1218C3.62605 15.3112 3.5 14.4385 3.5 13.5474C3.5 11.2077 4.39109 9.08425 5.85813 7.48242"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            <div className="flex flex-col items-start justify-center">
                <div className="text-sm font-bold">{t("order.Butuh Bantuan?")}</div>
                <div className="text-sm font-medium">
                    {t("order.Kamu bisa hubungi admin di sini.")}
                </div>
            </div>
        </button>
    );

    const Content = (
        <div className="space-y-4 px-4 pb-6">
            <div className="flex w-full flex-col gap-2">
                <a
                    href={`https://api.whatsapp.com/send?phone=${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
                >
                    <FaWhatsapp className="w-5 h-5" />
                    <span className="pl-2">{t("order.Chat WhatsApp")}</span>
                </a>
            </div>
        </div>
    );

    return isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-center">
                        {t("order.Butuh Bantuan?")}
                    </DrawerTitle>
                </DrawerHeader>
                {Content}
            </DrawerContent>
        </Drawer>
    ) : (
        <>
            {Trigger}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            {t("order.Butuh Bantuan?")}
                        </DialogTitle>
                    </DialogHeader>
                    {Content}
                </DialogContent>
            </Dialog>
        </>
    );
}
