"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import Credits from "@/components/member/Credits";

export default function CreditsPage() {
    const { data: session, status } = useSession();


    if (!session) return redirect("/signin");

    return (
        <ContentLayout title="Credits">
            <MemberLayout>
                <Credits />
            </MemberLayout>
        </ContentLayout>
    );
}
