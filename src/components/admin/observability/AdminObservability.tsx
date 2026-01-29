"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getObservabilitySummary } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatPercent = (value: number) =>
  `${Math.round(Math.min(Math.max(value * 100, 0), 10000)) / 100}%`;

export default function AdminObservability() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-observability"],
    queryFn: () => getObservabilitySummary(undefined),
    refetchInterval: 15000,
  });

  const summary = data?.data;
  const topSlow = useMemo(() => summary?.topSlow ?? [], [summary?.topSlow]);
  const healthBadge = summary?.health?.database === "ok" ? "success" : "destructive";

  return (
    <div className="space-y-8">
      <section className="admin-panel px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Observability</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Theo dõi sức khỏe hệ thống</h1>
          <p className="mt-2 text-sm text-slate-400">
            Snapshot thời gian thực về uptime, error rate và các endpoint chậm nhất.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">
              {summary ? formatDuration(summary.uptimeSec) : "--"}
            </p>
            <p className="mt-2 text-xs text-white/50">Realtime · auto refresh 15s</p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Total requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">
              {summary?.totalRequests?.toLocaleString() ?? 0}
            </p>
            <p className="mt-2 text-xs text-white/50">
              Total errors: {summary?.totalErrors?.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Error rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">
              {summary ? formatPercent(summary.errorRate) : "--"}
            </p>
            <p className="mt-2 text-xs text-white/50">
              {summary?.totalErrors ?? 0} / {summary?.totalRequests ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Database</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Badge variant={healthBadge}>
              {summary?.health?.database === "ok" ? "Healthy" : "Degraded"}
            </Badge>
            <span className="text-xs text-white/50">
              {summary?.health?.status ?? "unknown"}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top slow endpoints</CardTitle>
          <Badge variant="default">p95 latency</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-white/60">Loading...</p>
          ) : topSlow.length ? (
            <div className="space-y-3">
              {topSlow.map((item) => (
                <div
                  key={`${item.method}-${item.route}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.method}</Badge>
                      <span className="text-sm text-white/80">{item.route}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      Requests: {item.count} · Errors: {item.errors}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <div>
                      <p className="uppercase tracking-[0.2em] text-white/40">p95</p>
                      <p className="text-sm text-white">{Math.round(item.p95)} ms</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.2em] text-white/40">avg</p>
                      <p className="text-sm text-white">{Math.round(item.avg)} ms</p>
                    </div>
                    <div
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        item.errors > 0
                          ? "bg-red-500/15 text-red-200"
                          : "bg-emerald-500/15 text-emerald-200"
                      )}
                    >
                      {item.errors > 0 ? "Errors" : "Healthy"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">Chưa có dữ liệu.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
