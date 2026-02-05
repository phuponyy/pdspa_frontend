"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AdminDropdownMenu,
  AdminDropdownMenuContent,
  AdminDropdownMenuItem,
  AdminDropdownMenuTrigger,

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import { AdminDropdownMenu, AdminDropdownMenuTrigger, AdminDropdownMenuContent, AdminDropdownMenuItem } from "@/components/admin/ui/AdminDropdown";
  data: TData[];
  searchColumn?: string;
  emptyLabel?: string;
};

export default function DataTable<TData>({
  columns,
  data,
  searchColumn,
  emptyLabel = "No data found",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filterColumn = searchColumn ? table.getColumn(searchColumn) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-xs">
          {filterColumn ? (
            <AdminInput
              placeholder="Tìm kiếm..."
              value={(filterColumn.getFilterValue() as string) ?? ""}
              onChange={(event) => filterColumn.setFilterValue(event.target.value)}
            />
          ) : null}
        </div>
        <AdminDropdownMenu>
          <AdminDropdownMenuTrigger asChild>
            <AdminButton variant="outline" size="sm">
              Lọc
            </AdminButton>
          </AdminDropdownMenuTrigger>
          <AdminDropdownMenuContent align="end">
            {table.getAllLeafColumns().map((column) => (
              <AdminDropdownMenuItem
                key={column.id}
                onClick={() => column.toggleVisibility()}
              >
                <span className="mr-2 inline-flex h-3 w-3 rounded-full border border-white/30">
                  {column.getIsVisible() ? (
                    <span className="m-[2px] block h-2 w-2 rounded-full bg-[#2f7bff]" />
                  ) : null}
                </span>
                {column.id}
              </AdminDropdownMenuItem>
            ))}
          </AdminDropdownMenuContent>
        </AdminDropdownMenu>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111a25]">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-white/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-white/50">
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-white/60">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </AdminButton>
          <AdminButton
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
