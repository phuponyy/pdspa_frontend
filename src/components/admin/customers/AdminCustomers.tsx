"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { exportCustomers, getCustomers } from "@/lib/api/admin";
import DataTable from "@/components/admin/DataTable";
import type { Customer } from "@/types/admin-dashboard.types";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

export default function AdminCustomers() {
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => getCustomers(undefined, { page: 1, pageSize: 20 }),
  });

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      { accessorKey: "name", header: "Tên" },
      { accessorKey: "phone", header: "Điện Thoại" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "lastVisit", header: "Last visit" },
      { accessorKey: "totalSpend", header: "Tổng chi tiêu" },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => (row.original.tags || []).join(", "),
      },
      { accessorKey: "source", header: "Source" },
    ],
    []
  );

  const handleExport = async (format: "csv" | "xlsx") => {
    const blob = await exportCustomers(format);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <AdminCard className="border-white/5">
        <AdminCardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="py-2">
            <AdminCardTitle>Customers</AdminCardTitle>
            <p className="text-sm text-white/60">Tìm kiếm, lọc, tags, và ghi chú của khách hàng</p>
          </div>
          <div className="flex gap-2">
            <AdminButton variant="outline" size="sm" onClick={() => handleExport("csv")}>
              Xuất CSV
            </AdminButton>
            <AdminButton variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
              Xuất Excel
            </AdminButton>
          </div>
        </AdminCardHeader>
        <AdminCardContent>
          <DataTable columns={columns} data={data?.items || []} searchColumn="name" />
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
