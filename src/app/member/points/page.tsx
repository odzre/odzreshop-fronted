"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import Points from "@/components/member/Points";

export default function PointsPage() {
  const { data: session } = useSession();

  if (!session) return redirect("/signin");

  return (
    <ContentLayout title="Tukar Point">
      <MemberLayout>
        <Points />
      </MemberLayout>
    </ContentLayout>
  );
}
