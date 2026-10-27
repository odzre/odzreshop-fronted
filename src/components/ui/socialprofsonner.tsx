"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export default function SocialProfSonner() {
    const { theme } = useTheme();

    const sonnerTheme =
        theme === "light" || theme === "dark" || theme === "system"
            ? theme
            : "system";

    return (
        <Toaster
            id="social-prof"
            theme={sonnerTheme}
            position="bottom-left"
            visibleToasts={2}
            expand={false}
            offset={{ bottom: 10, left: 10 }}
            toastOptions={{
                className:
                    "!w-fit !max-w-[280px] bg-neutral-900 text-neutral-200 border border-white/10 shadow-lg gap-3 items-start p-3 rounded-xl",
            }}
            className="z-[9999] pointer-events-none"
        />
    );
}