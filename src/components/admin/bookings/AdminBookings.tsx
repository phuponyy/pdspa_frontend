"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { exportBookings, getBookings, updateBookingStatus } from "@/lib/api/admin";
import DataTable from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/types/admin-dashboard.types";

const statusColor: Record<Booking["status"], string> = {
  NEW: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  DONE: "bg-slate-500/15 text-slate-200 border-slate-500/30",
  CANCELED: "bg-rose-500/15 text-rose-200 border-rose-500/30",
};

export default function AdminBookings() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => getBookings(undefined, { page: 1, pageSize: 20 }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Booking["status"] }) =>
      updateBookingStatus(undefined, id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      { id: "customer", header: "Khách hàng", accessorFn: (row) => row.customer?.name || "" },
      { id: "service", header: "Dịch vụ", accessorFn: (row) => row.service?.key || "" },
      { id: "staff", header: "Nhân Viên", accessorFn: (row) => row.staff?.name || "" },
      { accessorKey: "scheduledAt", header: "Đã lên lịch" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
              statusColor[row.original.status]
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutation.mutate({ id: row.original.id, status: "CONFIRMED" })}
            >
              Xác nhận
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutation.mutate({ id: row.original.id, status: "DONE" })}
            >
              Hoàn tất
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutation.mutate({ id: row.original.id, status: "CANCELED" })}
            >
              Huỷ
            </Button>
          </div>
        ),
      },
    ],
    [mutation]
  );

  const handleExport = async (format: "csv" | "xlsx") => {
    const blob = await exportBookings(format);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <Card className="border-white/5">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="py-2">
            <CardTitle>Bookings</CardTitle>
            <p className="text-sm text-white/60">Quy trình: Mới &gt; Đã Xác Nhận &gt; Hoàn Tất / Huỷ</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              Xuất CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
              Xuất Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data?.items || []} searchColumn="customer" />
        </CardContent>
      </Card>
    </div>
  );
}
