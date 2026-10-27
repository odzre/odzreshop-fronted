import { ContentLayout } from "@/components/panel/content-layout";
import { MemberLayout } from "@/components/member/MemberLayout";
import Dashboard from "@/components/member/Dashboard";

export default function DashboardPage() {
  return (
    <ContentLayout title="Dashboard">
      
        <MemberLayout>
          <Dashboard />
        </MemberLayout>
      
    </ContentLayout>
  );
}
