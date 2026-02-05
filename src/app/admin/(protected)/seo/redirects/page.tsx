"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createRedirect,
  deleteRedirect,
  getRedirects,
  updateRedirect,
} from "@/lib/api/admin";
import { useToast } from "@/components/common/ToastProvider";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import {
  AdminAlertDialog,
  AdminAlertDialogAction,
  AdminAlertDialogCancel,
  AdminAlertDialogContent,
  AdminAlertDialogDescription,
  AdminAlertDialogTitle,
  AdminAlertDialogTrigger,
  AdminDialog,
  AdminDialogContent,
  AdminDialogDescription,
  AdminDialogHeader,
  AdminDialogTitle,
  AdminDialogTrigger,
} from "@/components/admin/ui/AdminDialog";
import type { RedirectItem } from "@/types/api.types";

export default function RedirectsPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form, setForm] = useState({
    fromPath: "",
    toPath: "",
    status: 301,
    isActive: true,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["redirects", page, pageSize, query],
    queryFn: () => getRedirects(undefined, page, pageSize, query),
  });

  const redirects = data?.data?.items || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const notify = (message: string, type: "success" | "error" | "info" = "info") =>
    toast.push({ message, type });

  const canSubmit = form.fromPath.trim() && form.toPath.trim();

  const toggleActive = async (item: RedirectItem) => {
    try {
      await updateRedirect(undefined, item.id, { isActive: !item.isActive });
      notify("Updated redirect.", "success");
      refetch();
    } catch {
      notify("Failed to update redirect.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            SEO
          </p>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">
            Redirect Manager
          </h1>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-4 shadow-[var(--shadow)]">
        <div className="grid gap-3 lg:grid-cols-[2fr_2fr_1fr_auto] lg:items-end">
          <AdminInput
            label="From"
            placeholder="/old-url"
            value={form.fromPath}
            onChange={(event) => setForm((prev) => ({ ...prev, fromPath: event.target.value }))}
          />
          <AdminInput
            label="To"
            placeholder="/new-url"
            value={form.toPath}
            onChange={(event) => setForm((prev) => ({ ...prev, toPath: event.target.value }))}
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Status
            <select
              className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: Number(event.target.value) }))
              }
            >
              <option value={301}>301</option>
              <option value={302}>302</option>
            </select>
          </label>
          <AdminButton
            disabled={!canSubmit}
            onClick={async () => {
              try {
                await createRedirect(undefined, form);
                notify("Redirect created.", "success");
                setForm({ fromPath: "", toPath: "", status: 301, isActive: true });
                refetch();
              } catch {
                notify("Failed to create redirect.", "error");
              }
            }}
          >
            Add redirect
          </AdminButton>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AdminInput
            label="Search"
            placeholder="Find redirects..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Per page
            <select
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <div className="ml-auto flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            <AdminButton
              size="sm"
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Prev
            </AdminButton>
            <span>
              {page} / {totalPages}
            </span>
            <AdminButton
              size="sm"
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
            >
              Next
            </AdminButton>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-[var(--ink-muted)]">Loading redirects...</p>
        ) : redirects.length ? (
          redirects.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--line)] bg-white p-4 shadow-[var(--shadow)]"
            >
              <div className="min-w-[200px] flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  From
                </p>
                <p className="text-sm font-semibold text-[var(--ink)]">{item.fromPath}</p>
              </div>
              <div className="min-w-[200px] flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  To
                </p>
                <p className="text-sm font-semibold text-[var(--ink)]">{item.toPath}</p>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                {item.status}
              </div>
              <button
                type="button"
                onClick={() => toggleActive(item)}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  item.isActive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-rose-500/10 text-rose-600"
                }`}
              >
                {item.isActive ? "Active" : "Disabled"}
              </button>
              <div className="text-xs text-[var(--ink-muted)]">Hits: {item.hits || 0}</div>
              <div className="ml-auto flex items-center gap-2">
                <AdminDialog>
                  <AdminDialogTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]"
                    >
                      Edit
                    </button>
                  </AdminDialogTrigger>
                  <AdminDialogContent>
                    <AdminDialogHeader>
                      <AdminDialogTitle>Edit redirect</AdminDialogTitle>
                      <AdminDialogDescription>Update path and status.</AdminDialogDescription>
                    </AdminDialogHeader>
                    <div className="grid gap-3">
                      <AdminInput
                        label="From"
                        defaultValue={item.fromPath}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, fromPath: event.target.value }))
                        }
                      />
                      <AdminInput
                        label="To"
                        defaultValue={item.toPath}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, toPath: event.target.value }))
                        }
                      />
                      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
                        Status
                        <select
                          className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                          defaultValue={item.status}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              status: Number(event.target.value),
                            }))
                          }
                        >
                          <option value={301}>301</option>
                          <option value={302}>302</option>
                        </select>
                      </label>
                      <AdminButton
                        onClick={async () => {
                          try {
                            await updateRedirect(undefined, item.id, {
                              fromPath: form.fromPath || item.fromPath,
                              toPath: form.toPath || item.toPath,
                              status: form.status || item.status,
                            });
                            notify("Redirect updated.", "success");
                            refetch();
                          } catch {
                            notify("Failed to update redirect.", "error");
                          }
                        }}
                      >
                        Save
                      </AdminButton>
                    </div>
                  </AdminDialogContent>
                </AdminDialog>
                <AdminAlertDialog>
                  <AdminAlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-500"
                    >
                      Delete
                    </button>
                  </AdminAlertDialogTrigger>
                  <AdminAlertDialogContent>
                    <AdminAlertDialogTitle>Delete redirect?</AdminAlertDialogTitle>
                    <AdminAlertDialogDescription>
                      This action cannot be undone.
                    </AdminAlertDialogDescription>
                    <div className="mt-6 flex items-center justify-end gap-3">
                      <AdminAlertDialogCancel>Cancel</AdminAlertDialogCancel>
                      <AdminAlertDialogAction
                        onClick={async () => {
                          try {
                            await deleteRedirect(undefined, item.id);
                            notify("Redirect deleted.", "success");
                            refetch();
                          } catch {
                            notify("Failed to delete redirect.", "error");
                          }
                        }}
                      >
                        Delete
                      </AdminAlertDialogAction>
                    </div>
                  </AdminAlertDialogContent>
                </AdminAlertDialog>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">No redirects found.</p>
        )}
      </div>
    </div>
  );
}
