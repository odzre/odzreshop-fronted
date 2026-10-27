"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import Settings from "@/components/member/Settings";

export default function SettingsPage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <ContentLayout title="Pengaturan">
                <div className="w-full h-[80vh] flex items-center justify-center">
                    <p>Loading...</p>
                </div>
            </ContentLayout>
        );
    }

    if (!session) return redirect("/signin");

    return (
        <ContentLayout title="Pengaturan">
            <MemberLayout>
                <Settings />
            </MemberLayout>
        </ContentLayout>
    );
}
