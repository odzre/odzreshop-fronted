"use client";

import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/panel/footer";
import { usePathname } from "next/navigation";
import FloatingContact from "@/components/FloatingContact";
import { useSettings } from "@/context/settings-context";

export default function PanelLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();

    const noFooterPages = [
        "/signin",
        "/sign-up",
        "/auth/loading",
        "/auth/google/callback",
        "/auth/error",
        "/maintenance",
    ];

    const settings = useSettings() as {
        data: {
            ["general.background_body_image"]?: string;
            ["theme.gradient.active"]?: boolean;
        };
    } | null;

    const backgroundImage = settings?.data?.["general.background_body_image"];

    const gradientActive = settings?.data?.["theme.gradient.active"];

    const backgroundClass = gradientActive ? "bg-gradient" : "bg-background";

    return (
        <SessionProvider>
            <div
                className={`relative flex flex-col w-full ${backgroundClass} ${backgroundImage
                    ? "bg-contain bg-[position:center_top] bg-repeat"
                    : ""
                    }`}
                style={
                    backgroundImage
                        ? {
                            backgroundImage: `url("${backgroundImage}")`,
                        }
                        : undefined
                }
            >
                <main>{children}</main>

                {!noFooterPages.includes(pathname) && (
                    <footer>
                        <Footer />
                    </footer>
                )}

                <FloatingContact />
            </div>
        </SessionProvider>
    );
}