"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import UpgradeRoles from "@/components/member/UpgradeRoles";

export default function UpgradeRolesPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <ContentLayout title="Upgrade Role">
        <MemberLayout>
          <div />
        </MemberLayout>
      </ContentLayout>
    );
  }

  if (!session) return redirect("/signin");

  return (
    <ContentLayout title="Upgrade Role">
      <MemberLayout>
        <UpgradeRoles />
      </MemberLayout>
    </ContentLayout>
  );
}
