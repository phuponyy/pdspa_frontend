"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeads } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/authStore";
import StatCard from "@/components/admin/StatCard";
import Loading from "@/components/common/Loading";

export default function AdminDashboard() {
  const token = useAuthStore((state) => state.token);
  const { data, isLoading } = useQuery({
    queryKey: ["leads-summary"],
    queryFn: () => getLeads(token || "", 1, 5),
    enabled: Boolean(token),
  });

  const payload = data?.data;
  const total =
    payload?.pagination?.total ??
    payload?.items?.length ??
    0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Monitor recent lead activity and homepage updates.
        </p>
      </div>
      {isLoading ? (
        <Loading label="Loading dashboard" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total leads"
            value={String(total)}
            note="All inbound inquiries"
          />
          <StatCard
            label="New today"
            value="--"
            note="Connect your analytics for daily stats"
          />
          <StatCard label="Status" value="Healthy" note="No alerts" />
        </div>
      )}
    </div>
  );
}
