import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import Transactions from "@/components/member/Transactions";

export default function TransactionsPage() {
  return (
    <ContentLayout title="Transaksi">
      <MemberLayout>
        <Transactions />
      </MemberLayout>
    </ContentLayout>
  );
}
