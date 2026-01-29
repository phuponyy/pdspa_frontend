"use client";

import dynamic from "next/dynamic";

const AdminLive = dynamic(() => import("@/components/admin/live/AdminLive"), {
  ssr: false,
  loading: () => (
    <div className="admin-panel p-6 text-sm text-white/60">Loading live data...</div>
  ),
});

export default function LivePage() {
  return <AdminLive />;
}
