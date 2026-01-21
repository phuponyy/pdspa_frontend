"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAdminLive } from "@/lib/realtime/useAdminLive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DoughnutChart from "@/components/admin/charts/DoughnutChart";
import LineChart from "@/components/admin/charts/LineChart";
import BarChart from "@/components/admin/charts/BarChart";

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

  useEffect(() => {
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
    const labels = snapshot?.topPages.map((item) => item.path) || [];
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

  return (
    <div className="space-y-8">
      <section className="admin-panel px-6 py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Realtime</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Live Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">
              Theo doi nguoi dung online, hanh vi truy cap va nguon traffic trong 60s gan nhat.
            </p>
          </div>
          <Badge variant="success">Live</Badge>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Active sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{snapshot?.onlineUsers ?? 0}</p>
            <p className="mt-2 text-xs text-white/50">Cap nhat moi 1-3s</p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Traffic source</CardTitle>
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
            <CardTitle className="text-sm text-white/70">Top pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(snapshot?.topPages || []).map((page) => (
              <div key={page.path} className="flex items-center justify-between text-xs text-white/70">
                <span>{page.path}</span>
                <Badge variant="default">{page.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Top pages (last 60s)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart labels={topPages.labels} data={topPages.data} label="Views" color="#22c55e" />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Active sessions (last 12m)</CardTitle>
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
            <CardTitle>Heartbeats per minute</CardTitle>
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
            <CardTitle>Device</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart labels={deviceStats.labels} data={deviceStats.data} label="Device" color="#2f7bff" />
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
      </div>
    </div>
  );
}
