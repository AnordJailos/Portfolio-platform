import { AdminHeader } from "@/components/admin/admin-header";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <AdminHeader title="Analytics" description="Traffic, project interest, and assistant usage." />
      <div className="p-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
