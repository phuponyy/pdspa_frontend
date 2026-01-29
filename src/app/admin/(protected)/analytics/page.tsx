"use client";

import dynamic from "next/dynamic";

const AdminAnalytics = dynamic(
  () => import("@/components/admin/analytics/AdminAnalytics"),
  {
    ssr: false,
    loading: () => (
      <div className="admin-panel p-6 text-sm text-white/60">Loading analytics...</div>
    ),
  }
);

export default function AnalyticsPage() {
  return <AdminAnalytics />;
}
