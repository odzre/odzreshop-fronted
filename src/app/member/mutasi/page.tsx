"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import Mutasi from "@/components/member/Mutasi";

export default function MutasiPage() {
  const { data: session, status } = useSession();

  // 🔒 Kalau belum login, redirect ke halaman signin
  if (!session) return redirect("/signin");

  return (
    <ContentLayout title="Mutasi Saldo">
      <MemberLayout>
        <Mutasi />
      </MemberLayout>
    </ContentLayout>
  );
}
