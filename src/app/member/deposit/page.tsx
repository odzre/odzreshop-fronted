"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import Deposit from "@/components/member/Deposit";

export default function DepositPage() {
  const { data: session, status } = useSession();

  // 🔒 Kalau belum login, langsung redirect ke /signin
  if (!session) return redirect("/signin");

  return (
    <ContentLayout title="Deposit Saldo">
      <MemberLayout>
        <Deposit />
      </MemberLayout>
    </ContentLayout>
  );
}
