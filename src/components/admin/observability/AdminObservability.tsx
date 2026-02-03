"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getLighthouseReports,
  getObservabilitySummary,
  getWebVitalsSummary,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import LineChart from "@/components/admin/charts/LineChart";

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
  const [rumRange, setRumRange] = useState<"7d" | "14d" | "30d">("7d");
  const [labRange, setLabRange] = useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-observability"],
    queryFn: () => getObservabilitySummary(undefined),
    refetchInterval: 15000,
  });
  const rumQuery = useQuery({
    queryKey: ["admin-web-vitals", rumRange],
    queryFn: () => getWebVitalsSummary(undefined, rumRange),
    refetchInterval: 60000,
  });
  const labQuery = useQuery({
    queryKey: ["admin-lighthouse", labRange],
    queryFn: () => getLighthouseReports(undefined, labRange),
    refetchInterval: 120000,
  });

  const summary = data?.data;
  const topSlow = useMemo(() => summary?.topSlow ?? [], [summary?.topSlow]);
  const healthBadge = summary?.health?.database === "ok" ? "success" : "warning";
  const rum = rumQuery.data?.data;
  const lighthouse = labQuery.data?.data || [];

  const rumScore = (value: number, name: string) => {
    if (name === "CLS") {
      if (value <= 0.1) return "good";
      if (value <= 0.25) return "needs";
      return "bad";
    }
    if (name === "LCP") {
      if (value <= 2500) return "good";
      if (value <= 4000) return "needs";
      return "bad";
    }
    if (name === "INP") {
      if (value <= 200) return "good";
      if (value <= 500) return "needs";
      return "bad";
    }
    return "neutral";
  };

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
                      <Badge variant="default">{item.method}</Badge>
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

      <section className="admin-panel px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Core Web Vitals</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Real-user metrics (RUM)</h2>
            <p className="mt-2 text-sm text-slate-400">
              P75 theo thời gian thực từ người dùng thật.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
            {(["7d", "14d", "30d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setRumRange(range)}
                className={cn(
                  "rounded-full border px-3 py-1 transition",
                  rumRange === range
                    ? "border-[#ff9f40] text-[#ff9f40]"
                    : "border-white/10 text-white/50 hover:text-white"
                )}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(["LCP", "INP", "CLS"] as const).map((metric) => {
            const value = rum?.summary?.[metric]?.p75 ?? 0;
            const status = rumScore(value, metric);
            return (
              <Card key={metric} className="border-white/5">
                <CardHeader>
                  <CardTitle className="text-sm text-white/70">{metric} P75</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-2xl font-semibold text-white">
                    {metric === "CLS" ? value.toFixed(2) : Math.round(value)}{" "}
                    {metric === "CLS" ? "" : "ms"}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      status === "good" && "bg-emerald-500/15 text-emerald-200",
                      status === "needs" && "bg-amber-500/15 text-amber-200",
                      status === "bad" && "bg-red-500/15 text-red-200",
                      status === "neutral" && "bg-white/10 text-white/60"
                    )}
                  >
                    {status === "needs" ? "Needs work" : status}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <Card className="border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trend P75 (LCP/INP/CLS)</CardTitle>
              <Badge variant="default">RUM</Badge>
            </CardHeader>
            <CardContent>
              <LineChart
                labels={rum?.timeseries?.labels || []}
                data={rum?.timeseries?.series?.LCP || []}
                label="LCP (ms)"
                color="#38bdf8"
              />
            </CardContent>
            <CardContent>
              <LineChart
                labels={rum?.timeseries?.labels || []}
                data={rum?.timeseries?.series?.INP || []}
                label="INP (ms)"
                color="#f97316"
              />
            </CardContent>
            <CardContent>
              <LineChart
                labels={rum?.timeseries?.labels || []}
                data={rum?.timeseries?.series?.CLS || []}
                label="CLS"
                color="#22c55e"
              />
            </CardContent>
          </Card>
          <Card className="border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top pages (samples)</CardTitle>
              <Badge variant="default">RUM</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {rum?.topPages?.length ? (
                rum.topPages.map((page) => (
                  <div key={page.page} className="rounded-2xl border border-white/10 px-4 py-3">
                    <p className="text-sm text-white">{page.page}</p>
                    <p className="mt-2 text-xs text-white/60">
                      Samples: {page.samples} · LCP P75 {Math.round(page.lcpP75)}ms · INP{" "}
                      {Math.round(page.inpP75)}ms · CLS {page.clsP75.toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/60">Chưa có dữ liệu.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="admin-panel px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Lighthouse Lab</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Kết quả Lighthouse định kỳ</h2>
            <p className="mt-2 text-sm text-slate-400">
              Tổng hợp từ job CI/CD hoặc cron server.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setLabRange(range)}
                className={cn(
                  "rounded-full border px-3 py-1 transition",
                  labRange === range
                    ? "border-[#ff9f40] text-[#ff9f40]"
                    : "border-white/10 text-white/50 hover:text-white"
                )}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {lighthouse.length ? (
            lighthouse.map((report) => (
              <Card key={report.id} className="border-white/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-white/70">
                    {report.url}
                  </CardTitle>
                  <Badge variant="default">{report.device || "default"}</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-white/70">
                  <div className="flex flex-wrap gap-3">
                    <span>Perf: {report.performance ?? "-"}</span>
                    <span>SEO: {report.seo ?? "-"}</span>
                    <span>A11y: {report.accessibility ?? "-"}</span>
                    <span>BP: {report.bestPractices ?? "-"}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span>LCP: {report.lcp ? Math.round(report.lcp) : "-"}</span>
                    <span>CLS: {report.cls ?? "-"}</span>
                    <span>FCP: {report.fcp ? Math.round(report.fcp) : "-"}</span>
                    <span>TBT: {report.tbt ? Math.round(report.tbt) : "-"}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-white/60">Chưa có kết quả Lighthouse.</p>
          )}
        </div>
      </section>
    </div>
  );
}
