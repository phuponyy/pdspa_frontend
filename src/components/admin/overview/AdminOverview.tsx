"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/lib/api/admin";
import LineChart from "@/components/admin/charts/LineChart";
import BarChart from "@/components/admin/charts/BarChart";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { AdminTabs, AdminTabsList, AdminTabsTrigger } from "@/components/admin/ui/AdminTabs";
import {
  AdminDropdownMenu,
  AdminDropdownMenuTrigger,
  AdminDropdownMenuContent,
  AdminDropdownMenuItem,
} from "@/components/admin/ui/AdminDropdown";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

const filterOptions = {
  branch: ["All branches", "Da Nang", "Ha Noi"],
  staff: ["All staff", "An", "Minh"],
  source: ["All sources", "SEO", "Facebook", "Google", "Direct"],
  service: ["All services", "facial", "massage"],
};

type FilterOption = {
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  options: string[];
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
              Theo dõi KPI doanh thu, lịch hẹn và hành vi khách hàng theo thời gian thực.
            </p>
          </div>
          <AdminTabs value={range} onValueChange={setRange}>
            <AdminTabsList>
              <AdminTabsTrigger value="7d">7D</AdminTabsTrigger>
              <AdminTabsTrigger value="30d">30D</AdminTabsTrigger>
              <AdminTabsTrigger value="custom">Custom</AdminTabsTrigger>
            </AdminTabsList>
          </AdminTabs>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {[
            { label: "Branch", value: branch, setValue: setBranch, options: filterOptions.branch },
            { label: "Staff", value: staff, setValue: setStaff, options: filterOptions.staff },
            { label: "Source", value: source, setValue: setSource, options: filterOptions.source },
            { label: "Service", value: service, setValue: setService, options: filterOptions.service },
          ].map((filter: FilterOption) => (
            <AdminDropdownMenu key={filter.label}>
              <AdminDropdownMenuTrigger asChild>
                <AdminButton variant="outline" size="sm">
                  {filter.label}: {filter.value}
                </AdminButton>
              </AdminDropdownMenuTrigger>
              <AdminDropdownMenuContent>
                {filter.options.map((option) => (
                  <AdminDropdownMenuItem key={option} onClick={() => filter.setValue(option)}>
                    {option}
                  </AdminDropdownMenuItem>
                ))}
              </AdminDropdownMenuContent>
            </AdminDropdownMenu>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Doanh thu hôm nay</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <p className="text-2xl font-semibold text-white">
              {(data?.kpis.revenue.today || 0).toLocaleString()} d
            </p>
            <p className="mt-2 text-xs text-white/50">Tuần: {data?.kpis.revenue.week || 0} đ</p>
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Booking</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="space-y-2">
            <p className="text-2xl font-semibold text-white">{data?.kpis.bookings.total || 0}</p>
            <div className="flex flex-wrap gap-2 text-xs text-white/60">
              <span>Mới: {data?.kpis.bookings.new || 0}</span>
              <span>Xác nhận: {data?.kpis.bookings.confirmed || 0}</span>
              <span>Huỷ: {data?.kpis.bookings.canceled || 0}</span>
            </div>
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Khách hàng</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="space-y-2">
            <p className="text-2xl font-semibold text-white">{data?.kpis.customers.new || 0}</p>
            <p className="text-xs text-white/60">Quay lại: {data?.kpis.customers.returning || 0}</p>
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Top dịch vụ</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="space-y-2">
            {data?.kpis.topServices?.slice(0, 3).map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between text-xs text-white/70"
              >
                <span>{service.name}</span>
                <AdminBadge variant="default">{service.count}</AdminBadge>
              </div>
            ))}
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader>
            <AdminCardTitle className="text-sm text-white/70">Response time</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="space-y-2">
            <p className="text-2xl font-semibold text-white">
              {data?.kpis.performance?.avgMs || 0} ms
            </p>
            <p className="text-xs text-white/60">
              P95: {data?.kpis.performance?.p95Ms || 0} ms · Samples:{" "}
              {data?.kpis.performance?.samples || 0}
            </p>
          </AdminCardContent>
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard className="border-white/5 lg:col-span-2">
          <AdminCardHeader className="flex flex-row items-center justify-between">
            <AdminCardTitle>Doanh thu theo ngày</AdminCardTitle>
            <AdminBadge variant="default">Line</AdminBadge>
          </AdminCardHeader>
          <AdminCardContent>
            <LineChart
              labels={data?.charts.labels || []}
              data={data?.charts.revenue || []}
              label="Revenue"
            />
          </AdminCardContent>
        </AdminCard>
        <AdminCard className="border-white/5">
          <AdminCardHeader className="flex flex-row items-center justify-between">
            <AdminCardTitle>Bookings</AdminCardTitle>
            <AdminBadge variant="default">Bar</AdminBadge>
          </AdminCardHeader>
          <AdminCardContent>
            <BarChart
              labels={data?.charts.labels || []}
              data={data?.charts.bookings || []}
              label="Bookings"
              color="#8b5cf6"
            />
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard className="border-white/5">
        <AdminCardHeader className="flex flex-row items-center justify-between">
          <AdminCardTitle>Users theo ngày</AdminCardTitle>
          <AdminBadge variant="default">Line</AdminBadge>
        </AdminCardHeader>
        <AdminCardContent>
          <LineChart
            labels={data?.charts.labels || []}
            data={data?.charts.users || []}
            label="Users"
            color="#22c55e"
          />
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
