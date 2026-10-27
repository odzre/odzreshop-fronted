import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import DepositInvoice from "@/components/member/DepositInvoice";

export default function DepositInvoicePage() {
  return (
    <ContentLayout title="Invoice Deposit">
      <MemberLayout>
        <DepositInvoice />
      </MemberLayout>
    </ContentLayout>
  );
}
