"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function GoogleCallbackPage() {
    const { status } = useSession();
    const router = useRouter();

    // Tunggu sampai session siap
    useEffect(() => {
        if (status === "authenticated") {
            // sedikit delay agar loading terlihat
            const timer = setTimeout(() => {
                router.replace("/dashboard");
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [status, router]);

    return <LoadingScreen />;
}
