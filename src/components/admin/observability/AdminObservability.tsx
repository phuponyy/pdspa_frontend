"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import LineChart from "@/components/admin/charts/LineChart";
import { useObservabilityQueries } from "@/components/admin/observability/hooks/useObservabilityQueries";
import { formatDuration, formatPercent, getRumScore } from "@/components/admin/observability/utils";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

export default function AdminObservability() {
  const [rumRange, setRumRange] = useState<"7d" | "14d" | "30d">("7d");
  const [labRange, setLabRange] = useState<"7d" | "30d" | "90d">("30d");
  const { summary, isLoading, topSlow, rum, lighthouse } = useObservabilityQueries(
    rumRange,
    labRange
  );
  const healthBadge = summary?.health?.database === "ok" ? "success" : "warning";

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
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Uptime</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <p className="text-2xl font-semibold text-white">
              {summary ? formatDuration(summary.uptimeSec) : "--"}
            </p>
            <p className="mt-2 text-xs text-white/50">Realtime · auto refresh 15s</p>
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Total requests</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <p className="text-2xl font-semibold text-white">
              {summary?.totalRequests?.toLocaleString() ?? 0}
            </p>
            <p className="mt-2 text-xs text-white/50">
              Total errors: {summary?.totalErrors?.toLocaleString() ?? 0}
            </p>
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Error rate</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <p className="text-2xl font-semibold text-white">
              {summary ? formatPercent(summary.errorRate) : "--"}
            </p>
            <p className="mt-2 text-xs text-white/50">
              {summary?.totalErrors ?? 0} / {summary?.totalRequests ?? 0}
            </p>
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Database</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="flex items-center gap-2">
            <AdminBadge variant={healthBadge}>
              {summary?.health?.database === "ok" ? "Healthy" : "Degraded"}
            </AdminBadge>
            <span className="text-xs text-white/50">
              {summary?.health?.status ?? "unknown"}
            </span>
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard className="border-white/5">
        <AdminCardHeader className="flex flex-row items-center justify-between">
          <AdminCardTitle>Top slow endpoints</AdminCardTitle>
          <AdminBadge variant="default">p95 latency</AdminBadge>
        </AdminCardHeader>
        <AdminCardContent>
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
                      <AdminBadge variant="default">{item.method}</AdminBadge>
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
        </AdminCardContent>
      </AdminCard>

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
            const status = getRumScore(value, metric);
            return (
              <AdminCard key={metric} className="border-white/5">
                <AdminCardHeader>
                  <AdminCardTitle className="text-sm text-white/70">{metric} P75</AdminCardTitle>
                </AdminCardHeader>
                <AdminCardContent className="flex items-center justify-between">
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
                </AdminCardContent>
              </AdminCard>
            );
          })}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <AdminCard className="border-white/5">
            <AdminCardHeader className="flex flex-row items-center justify-between">
              <AdminCardTitle>Trend P75 (LCP/INP/CLS)</AdminCardTitle>
              <AdminBadge variant="default">RUM</AdminBadge>
            </AdminCardHeader>
            <AdminCardContent>
              <LineChart
                labels={rum?.timeseries?.labels || []}
                data={rum?.timeseries?.series?.LCP || []}
                label="LCP (ms)"
                color="#38bdf8"
              />
            </AdminCardContent>
            <AdminCardContent>
              <LineChart
                labels={rum?.timeseries?.labels || []}
                data={rum?.timeseries?.series?.INP || []}
                label="INP (ms)"
                color="#f97316"
              />
            </AdminCardContent>
            <AdminCardContent>
              <LineChart
                labels={rum?.timeseries?.labels || []}
                data={rum?.timeseries?.series?.CLS || []}
                label="CLS"
                color="#22c55e"
              />
            </AdminCardContent>
          </AdminCard>
          <AdminCard className="border-white/5">
            <AdminCardHeader className="flex flex-row items-center justify-between">
              <AdminCardTitle>Top pages (samples)</AdminCardTitle>
              <AdminBadge variant="default">RUM</AdminBadge>
            </AdminCardHeader>
            <AdminCardContent className="space-y-3">
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
            </AdminCardContent>
          </AdminCard>
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
              <AdminCard key={report.id} className="border-white/5">
                <AdminCardHeader className="flex flex-row items-center justify-between">
                  <AdminCardTitle className="text-sm text-white/70">
                    {report.url}
                  </AdminCardTitle>
                  <AdminBadge variant="default">{report.device || "default"}</AdminBadge>
                </AdminCardHeader>
                <AdminCardContent className="space-y-2 text-xs text-white/70">
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
                </AdminCardContent>
              </AdminCard>
            ))
          ) : (
            <p className="text-sm text-white/60">Chưa có kết quả Lighthouse.</p>
          )}
        </div>
      </section>
    </div>
  );
}
