"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { exportCustomers, getCustomers } from "@/lib/api/admin";
import DataTable from "@/components/admin/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types/admin-dashboard.types";

export default function AdminCustomers() {
  const { data } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => getCustomers(undefined, { page: 1, pageSize: 20 }),
  });

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "lastVisit", header: "Last visit" },
      { accessorKey: "totalSpend", header: "Total spend" },
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
      <Card className="border-white/5">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Customers</CardTitle>
            <p className="text-sm text-white/60">Search, filter, tag va ghi chu khach hang.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data?.items || []} searchColumn="name" />
        </CardContent>
      </Card>
    </div>
  );
}
