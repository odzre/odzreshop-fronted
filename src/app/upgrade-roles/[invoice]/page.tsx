"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import RolePurchaseInvoice from "@/components/member/RolePurchaseInvoice";

export default function RolePurchaseInvoicePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <ContentLayout title="Invoice">
        <div />
      </ContentLayout>
    );
  }

  if (!session) return redirect("/signin");

  return (
    <ContentLayout title="Invoice Upgrade Role">
      <RolePurchaseInvoice />
    </ContentLayout>
  );
}
