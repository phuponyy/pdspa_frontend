"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAdminLive } from "@/lib/realtime/useAdminLive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DoughnutChart from "@/components/admin/charts/DoughnutChart";
import LineChart from "@/components/admin/charts/LineChart";
import BarChart from "@/components/admin/charts/BarChart";
import { useToast } from "@/components/common/ToastProvider";

const getSessionId = () => {
  if (typeof window === "undefined") return uuidv4();
  const existing = sessionStorage.getItem("admin_live_session");
  if (existing) return existing;
  const id = uuidv4();
  sessionStorage.setItem("admin_live_session", id);
  return id;
};

export default function AdminLive() {
  const { snapshot, sendHeartbeat } = useAdminLive();
  const [sessionId] = useState(getSessionId);
  const toast = useToast();
  const lastSpikeRef = useRef<string>("normal");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const truncatePath = (value: string, max = 28) => {
    if (value.length <= max) return value;
    const head = Math.max(8, Math.floor(max * 0.6));
    const tail = Math.max(6, max - head - 1);
    return `${value.slice(0, head)}…${value.slice(-tail)}`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    const heartbeat = () => {
      sendHeartbeat({
        sessionId,
        page: window.location.pathname,
        source: "Direct",
        device: window.innerWidth > 768 ? "Desktop" : "Mobile",
        location: "Da Nang",
      });
    };
    heartbeat();
    const interval = setInterval(heartbeat, 10000);
    return () => clearInterval(interval);
  }, [sendHeartbeat, sessionId]);

  const traffic = useMemo(() => {
    const labels = snapshot?.trafficSources.map((item) => item.source) || [];
    const data = snapshot?.trafficSources.map((item) => item.count) || [];
    return { labels, data };
  }, [snapshot]);

  const topPages = useMemo(() => {
    const labels = snapshot?.topPages.map((item) => truncatePath(item.path)) || [];
    const data = snapshot?.topPages.map((item) => item.count) || [];
    return { labels, data };
  }, [snapshot]);

  const timeline = useMemo(() => {
    const labels = snapshot?.timeline?.map((item) => item.label) || [];
    const active = snapshot?.timeline?.map((item) => item.active) || [];
    const heartbeats = snapshot?.timeline?.map((item) => item.heartbeats) || [];
    return { labels, active, heartbeats };
  }, [snapshot]);

  const deviceStats = useMemo(() => {
    const labels = snapshot?.devices.map((item) => item.device) || [];
    const data = snapshot?.devices.map((item) => item.count) || [];
    return { labels, data };
  }, [snapshot]);

  const locationStats = useMemo(() => {
    const labels = snapshot?.locations.map((item) => item.location) || [];
    const data = snapshot?.locations.map((item) => item.count) || [];
    return { labels, data };
  }, [snapshot]);

  const activeNow = snapshot?.activeSessions || [];
  const funnel = snapshot?.funnel || [];
  const maxFunnel = Math.max(1, ...funnel.map((item) => item.count));
  const errorRate = snapshot?.errorRate;
  const spike = snapshot?.spike;
  const endpoints = snapshot?.endpoints || [];
  const spikeLabel =
    spike?.level === "critical"
      ? "Critical spike"
      : spike?.level === "warning"
      ? "Traffic spike"
      : "Normal";
  const spikeColor =
    spike?.level === "critical"
      ? "text-red-300"
      : spike?.level === "warning"
      ? "text-yellow-300"
      : "text-emerald-300";

  const sparkline = (values: number[], width = 120, height = 40) => {
    if (!values.length) return "";
    const max = Math.max(1, ...values);
    const min = Math.min(...values);
    const range = Math.max(1, max - min);
    const step = values.length > 1 ? width / (values.length - 1) : width;
    return values
      .map((value, index) => {
        const x = Math.round(index * step);
        const y = Math.round(height - ((value - min) / range) * height);
        return `${index === 0 ? "M" : "L"}${x} ${y}`;
      })
      .join(" ");
  };

  useEffect(() => {
    if (!spike?.level) return;
    if (spike.level !== lastSpikeRef.current && spike.level !== "normal") {
      toast.push({
        message:
          spike.level === "critical"
            ? "Traffic spike detected (critical)."
            : "Traffic spike detected.",
        type: spike.level === "critical" ? "error" : "info",
      });
    }
    lastSpikeRef.current = spike.level;
  }, [spike?.level, toast]);

  return (
    <div className="space-y-8">
      <section className="admin-panel px-6 py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Thống kê trực tiếp</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Giao diện trực tiếp</h1>
            <p className="mt-2 text-sm text-slate-400">
              Theo dõi người dùng đang online, hành vi truy cập và nguồn traffic trong 60s gần nhất.
            </p>
          </div>
          <Badge variant="success">Trực tiếp</Badge>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Phiên hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{snapshot?.onlineUsers ?? 0}</p>
            <p className="mt-2 text-xs text-white/50">Cập nhật mỗi 1-3s</p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Nguồn lưu lượng truy cập</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart
              labels={traffic.labels}
              data={traffic.data}
              colors={["#2f7bff", "#ff6a3d", "#22c55e", "#a855f7"]}
            />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Các trang hàng đầu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(snapshot?.topPages || []).map((page) => (
              <div key={page.path} className="flex items-center justify-between text-xs text-white/70">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left hover:text-white"
                  title={page.path}
                  onClick={() => setSelectedPage(page.path)}
                >
                  {page.path}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/60 hover:text-white"
                    onClick={() => {
                      navigator.clipboard?.writeText(page.path).catch(() => {});
                      toast.push({ message: "Copied URL.", type: "info" });
                    }}
                  >
                    Copy
                  </button>
                  <Badge variant="default">{page.count}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Các trang (last 60s)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart labels={topPages.labels} data={topPages.data} label="Views" color="#22c55e" />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Các phiên hoạt động (last 12m)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              labels={timeline.labels}
              data={timeline.active}
              label="Active sessions"
              color="#2f7bff"
            />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Heartbeats mỗi phút</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              labels={timeline.labels}
              data={timeline.heartbeats}
              label="Heartbeats"
              color="#ff6a3d"
            />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Thiết bị</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart labels={deviceStats.labels} data={deviceStats.data} label="Device" color="#2f7bff" />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Spike alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Trạng thái</span>
              <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${spikeColor}`}>
                {spikeLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Current (last min)</span>
              <span>{spike?.current ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Avg (prev mins)</span>
              <span>{spike?.average ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Delta</span>
              <span>{spike?.delta ? `${Math.round(spike.delta * 100)}%` : "0%"}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Error rate (60s)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-white/70">
            <div className="flex items-center justify-between">
              <span>Total requests</span>
              <span>{errorRate?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Errors (4xx + 5xx)</span>
              <span>{errorRate?.errors ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rate</span>
              <span>{errorRate ? `${Math.round(errorRate.rate * 100)}%` : "0%"}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/50">
              <span>4xx</span>
              <span>{errorRate?.byStatus?.["4xx"] ?? 0}</span>
              <span>5xx</span>
              <span>{errorRate?.byStatus?.["5xx"] ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/50">
              <span>Booking fails</span>
              <span>{errorRate?.bookingFails ?? 0}</span>
              <span>Payment fails</span>
              <span>{errorRate?.paymentFails ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Active now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeNow.length ? (
              activeNow.map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between gap-3 text-xs text-white/70">
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="truncate text-left text-white/80 hover:text-white"
                      title={session.page || "Unknown"}
                      onClick={() => session.page && setSelectedPage(session.page)}
                    >
                      {session.page || "Unknown"}
                    </button>
                    <div className="flex flex-wrap gap-2 text-[10px] text-white/40">
                      <span>{session.device || "Unknown"}</span>
                      {session.referrer ? <span>· {session.referrer}</span> : null}
                      {session.utmSource ? <span>· {session.utmSource}</span> : null}
                    </div>
                  </div>
                  <Badge variant="default">
                    {session.timeOnPageSec ? `${session.timeOnPageSec}s` : "Now"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/40">Chưa có phiên hoạt động.</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Funnel (last 60s)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((step) => (
              <div key={step.step} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>{step.step}</span>
                  <span>{step.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-[#ff9f40]"
                    style={{ width: `${Math.max(6, (step.count / maxFunnel) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Endpoints (60s)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-white/70">
            {endpoints.length ? (
              endpoints.map((endpoint) => (
                <div key={endpoint.path} className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left hover:text-white"
                    title={endpoint.path}
                    onClick={() => setSelectedPage(endpoint.path)}
                  >
                    {endpoint.path}
                  </button>
                  <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <span>{endpoint.total}</span>
                    <span>{Math.round(endpoint.errorRate * 100)}%</span>
                    <button
                      type="button"
                      className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/60 hover:text-white"
                      onClick={() => {
                        navigator.clipboard?.writeText(endpoint.path).catch(() => {});
                        toast.push({ message: "Copied endpoint.", type: "info" });
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/40">Chưa có dữ liệu.</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              labels={locationStats.labels}
              data={locationStats.data}
              label="Location"
              color="#a855f7"
            />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Heatmap (cities)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(snapshot?.locations || []).slice(0, 8).map((item) => {
              const percent = locationStats.data.length
                ? Math.max(6, (item.count / Math.max(...locationStats.data)) * 100)
                : 0;
              return (
                <div key={item.location} className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="truncate" title={item.location}>{item.location}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-[#2f7bff]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Activity sparkline</p>
              <svg viewBox="0 0 120 40" className="mt-2 h-10 w-full">
                <path
                  d={sparkline((snapshot?.timeline || []).map((item) => item.active))}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedPage ? (
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Drill‑down</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-white" title={selectedPage}>{selectedPage}</p>
                <p className="text-xs text-white/40">
                  Sessions on this page in last 90s
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/60 hover:text-white"
                onClick={() => {
                  navigator.clipboard?.writeText(selectedPage).catch(() => {});
                  toast.push({ message: "Copied URL.", type: "info" });
                }}
              >
                Copy URL
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {activeNow
                .filter((session) => session.page === selectedPage)
                .slice(0, 6)
                .map((session) => (
                  <div key={session.sessionId} className="flex items-center justify-between">
                    <span>{session.device || "Unknown"}</span>
                    <span className="text-white/50">
                      {session.timeOnPageSec ? `${session.timeOnPageSec}s` : "Now"}
                    </span>
                  </div>
                ))}
              {!activeNow.some((session) => session.page === selectedPage) ? (
                <p className="text-xs text-white/40">No active sessions.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
