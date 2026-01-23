"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAnalytics } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LineChart from "@/components/admin/charts/LineChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const filterOptions = {
  branch: ["Tất cả danh mục", "Đà Nẵng", "Hà Nội"],
  staff: ["Tất cà người dùng", "An", "Minh"],
  source: ["Tất cả nguồn", "SEO", "Facebook", "Google", "Direct"],
  service: ["Tất cả dịch vụ", "facial", "massage"],
};

export default function AdminAnalytics() {
  const [range, setRange] = useState("7d");
  const [interval, setInterval] = useState("day");
  const [branch, setBranch] = useState(filterOptions.branch[0]);
  const [staff, setStaff] = useState(filterOptions.staff[0]);
  const [source, setSource] = useState(filterOptions.source[0]);
  const [service, setService] = useState(filterOptions.service[0]);

  const queryFilters = useMemo(
    () => ({
      range,
      interval,
      branchId: branch === "Da Nang" ? "1" : undefined,
      staffId: staff === "An" ? "1" : undefined,
      source: source.startsWith("All") ? undefined : source,
      serviceId: service === "facial" ? "1" : service === "massage" ? "2" : undefined,
    }),
    [branch, interval, range, service, source, staff]
  );

  const { data } = useQuery({
    queryKey: ["admin-analytics", queryFilters],
    queryFn: () => getAdminAnalytics(undefined, queryFilters),
  });

  return (
    <div className="space-y-8">
      <section className="admin-panel px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Analytics</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Thống kê theo ngày</h1>
            <p className="mt-2 text-sm text-slate-400">
              So sanh hieu suat theo ky truoc va toi uu theo bo loc nang cao.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={range} onValueChange={setRange}>
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={interval} onValueChange={setInterval}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {[
            { label: "Branch", value: branch, setValue: setBranch, options: filterOptions.branch },
            { label: "Staff", value: staff, setValue: setStaff, options: filterOptions.staff },
            { label: "Source", value: source, setValue: setSource, options: filterOptions.source },
            { label: "Service", value: service, setValue: setService, options: filterOptions.service },
          ].map((filter) => (
            <DropdownMenu key={filter.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {filter.label}: {filter.value}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filter.options.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => filter.setValue(option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Doanh thu</CardTitle>
            <Badge variant="default">{data?.comparison.revenue.change ?? 0}%</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">
              {(data?.comparison.revenue.current || 0).toLocaleString()} đ
            </p>
            <p className="text-xs text-white/50">
              Kỳ trước: {(data?.comparison.revenue.previous || 0).toLocaleString()} đ
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đặt chỗ</CardTitle>
            <Badge variant="default">{data?.comparison.bookings.change ?? 0}%</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">{data?.comparison.bookings.current || 0}</p>
            <p className="text-xs text-white/50">Kỳ trước: {data?.comparison.bookings.previous || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Người dùng</CardTitle>
            <Badge variant="default">{data?.comparison.users.change ?? 0}%</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">{data?.comparison.users.current || 0}</p>
            <p className="text-xs text-white/50">Kỳ trước: {data?.comparison.users.previous || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart labels={data?.labels || []} data={data?.series.revenue || []} label="Doanh thu" />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle>Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              labels={data?.labels || []}
              data={data?.series.users || []}
              label="Users"
              color="#22c55e"
            />
          </CardContent>
        </Card>
      </div>
      <Card className="border-white/5">
        <CardHeader>
          <CardTitle>Khách Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            labels={data?.labels || []}
            data={data?.series.bookings || []}
            label="Bookings"
            color="#8b5cf6"
          />
        </CardContent>
      </Card>
    </div>
  );
}
