"use client";

import dynamic from "next/dynamic";

const AdminObservability = dynamic(
  () => import("@/components/admin/observability/AdminObservability"),
  {
    ssr: false,
    loading: () => (
      <div className="admin-panel p-6 text-sm text-white/60">
        Loading observability...
      </div>
    ),
  }
);

export default function ObservabilityPage() {
  return <AdminObservability />;
}
