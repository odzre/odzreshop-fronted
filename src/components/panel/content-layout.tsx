"use client";

import { Navbar } from "@/components/panel/navbar";
import { usePathname } from "next/navigation";

interface ContentLayoutProps {
    title: string;
    children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
    const pathname = usePathname();

    // ✅ Halaman yang butuh layout full (tanpa padding di mobile)
    const isFullWidthPage =
        pathname?.includes("/transactions") ||
        pathname?.includes("/credits") ||
        pathname?.includes("/dashboard") ||
        pathname?.includes("/member/mutasi");

    return (
        <div>
            <Navbar />
            <div
                className={`w-full mx-auto relative pt-8 pb-8 ${isFullWidthPage ? "px-0 sm:px-4" : "px-4"
                    }`}
            >
                {children}
            </div>
        </div>
    );
}
