"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LineChart from "@/components/admin/charts/LineChart";
import BarChart from "@/components/admin/charts/BarChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const filterOptions = {
  branch: ["All branches", "Da Nang", "Ha Noi"],
  staff: ["All staff", "An", "Minh"],
  source: ["All sources", "SEO", "Facebook", "Google", "Direct"],
  service: ["All services", "facial", "massage"],
};

export default function AdminOverview() {
  const [range, setRange] = useState("7d");
  const [branch, setBranch] = useState(filterOptions.branch[0]);
  const [staff, setStaff] = useState(filterOptions.staff[0]);
  const [source, setSource] = useState(filterOptions.source[0]);
  const [service, setService] = useState(filterOptions.service[0]);

  const queryFilters = useMemo(
    () => ({
      range,
      branchId: branch === "Da Nang" ? "1" : undefined,
      staffId: staff === "An" ? "1" : undefined,
      source: source.startsWith("All") ? undefined : source,
      serviceId: service === "facial" ? "1" : service === "massage" ? "2" : undefined,
    }),
    [branch, range, service, source, staff]
  );

  const { data } = useQuery({
    queryKey: ["admin-overview", queryFilters],
    queryFn: () => getAdminOverview(undefined, queryFilters),
  });

  return (
    <div className="space-y-8">
      <section className="admin-panel px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Overview</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Tong quan hoat dong SPA</h1>
            <p className="mt-2 text-sm text-slate-400">
              Theo doi KPI doanh thu, lich hen va hanh vi khach hang theo thoi gian thuc.
            </p>
          </div>
          <Tabs value={range} onValueChange={setRange}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Doanh thu hom nay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-white">
              {(data?.kpis.revenue.today || 0).toLocaleString()} d
            </p>
            <p className="mt-2 text-xs text-white/50">Tuan: {data?.kpis.revenue.week || 0} d</p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold text-white">{data?.kpis.bookings.total || 0}</p>
            <div className="flex flex-wrap gap-2 text-xs text-white/60">
              <span>Moi: {data?.kpis.bookings.new || 0}</span>
              <span>Xac nhan: {data?.kpis.bookings.confirmed || 0}</span>
              <span>Huy: {data?.kpis.bookings.canceled || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Khach hang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold text-white">{data?.kpis.customers.new || 0}</p>
            <p className="text-xs text-white/60">Quay lai: {data?.kpis.customers.returning || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader>
            <CardTitle className="text-sm text-white/70">Top dich vu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.kpis.topServices?.slice(0, 3).map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between text-xs text-white/70"
              >
                <span>{service.name}</span>
                <Badge variant="default">{service.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/5 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue theo ngay</CardTitle>
            <Badge variant="default">Line</Badge>
          </CardHeader>
          <CardContent>
            <LineChart
              labels={data?.charts.labels || []}
              data={data?.charts.revenue || []}
              label="Revenue"
            />
          </CardContent>
        </Card>
        <Card className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bookings</CardTitle>
            <Badge variant="default">Bar</Badge>
          </CardHeader>
          <CardContent>
            <BarChart
              labels={data?.charts.labels || []}
              data={data?.charts.bookings || []}
              label="Bookings"
              color="#8b5cf6"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users theo ngay</CardTitle>
          <Badge variant="default">Line</Badge>
        </CardHeader>
        <CardContent>
          <LineChart
            labels={data?.charts.labels || []}
            data={data?.charts.users || []}
            label="Users"
            color="#22c55e"
          />
        </CardContent>
      </Card>
    </div>
  );
}
