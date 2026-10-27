"use client";

import { useSettings } from "@/context/settings-context";
import Image from "@/components/ui/Image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function FloatingContact() {
    const { data } = useSettings();

    const contact = data?.contact;
    const type = contact?.button_type ?? "image";
    const list = contact?.list ?? [];

    // tidak render jika tidak ada kontak
    if (!list.length) return null;

    // ✅ posisi berbeda tiap mode
    const positionClass =
        type === "icon"
            ? "bottom-8"
            : "bottom-0";

    return (
        <div
            className={`fixed right-6 z-[999] print:hidden ${positionClass}`}
        >
            <DropdownMenu>

                {/* ✅ SINGLE TRIGGER (WAJIB untuk radix) */}
                <DropdownMenuTrigger asChild>
                    <button className="transition hover:scale-105">

                        {type === "image" && contact?.main_icon ? (
                            <Image
                                src={contact.main_icon}
                                alt="Contact"
                                width={100}
                                height={100}
                                className="object-contain"
                            />
                        ) : (
                            <FloatingButton contact={contact} />
                        )}

                    </button>
                </DropdownMenuTrigger>

                <DropdownContent list={list} />

            </DropdownMenu>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| FLOATING BUTTON (ICON MODE)
|--------------------------------------------------------------------------
| ⚠️ BUKAN BUTTON (karena parent sudah button)
|--------------------------------------------------------------------------
*/

function FloatingButton({ contact }: any) {
    const text = contact?.button_text ?? "Chat CS";
    const icon = contact?.button_icon ?? "headset";

    return (
        <div
            className="
                inline-flex items-center space-x-2.5
                rounded-t-lg bg-primary
                pb-2 pl-3 pr-3 pt-3
                text-white
                duration-300 ease-in-out
            "
        >
            <Icon name={icon} />

            <span className="hidden text-xs font-medium md:inline">
                {text}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| ICON SWITCHER
|--------------------------------------------------------------------------
*/

function Icon({ name }: { name: string }) {
    switch (name) {
        case "chat":
            return (
                <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
            );

        case "message-circle":
            return (
                <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
            );

        default:
            return (
                <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" />
                    <path d="M3 11a9 9 0 1 1 18 0" />
                    <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
                </svg>
            );
    }
}

/*
|--------------------------------------------------------------------------
| DROPDOWN CONTENT
|--------------------------------------------------------------------------
*/

function DropdownContent({ list }: any) {
    return (
        <DropdownMenuContent
            align="end"
            side="top"
            className="w-48 z-[9999]"
        >
            <DropdownMenuLabel className="text-xs">
                Customer Service
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {list.map((item: any, index: number) => (
                <DropdownMenuItem
                    key={index}
                    className="cursor-pointer"
                    onSelect={(e) => {
                        e.preventDefault();

                        const url = item.url.startsWith("http")
                            ? item.url
                            : `https://${item.url}`;

                        window.open(url, "_blank");
                    }}
                >
                    {item.title}
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    );
}