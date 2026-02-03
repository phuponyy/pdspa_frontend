"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs } from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminAuditLog } from "@/types/api.types";

const formatDate = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const formatDateOnly = (value?: string) => {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const ACTION_COLORS: Record<string, "success" | "warning" | "draft" | "default"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "draft",
};

const pickActionBadge = (action: string) => {
  if (action.includes("CREATE")) return ACTION_COLORS.CREATE;
  if (action.includes("UPDATE")) return ACTION_COLORS.UPDATE;
  if (action.includes("DELETE")) return ACTION_COLORS.DELETE;
  return "default";
};

const buildCsv = (items: AdminAuditLog[]) => {
  const rows = [
    [
      "id",
      "action",
      "scope",
      "entity",
      "entityId",
      "userId",
      "name",
      "email",
      "ip",
      "createdAt",
    ],
  ];
  items.forEach((log) => {
    rows.push([
      String(log.id ?? ""),
      log.action || "",
      log.scope || "",
      log.entity || "",
      String(log.entityId ?? ""),
      String(log.userId ?? ""),
      log.name || "",
      log.email || "",
      log.ip || "",
      log.createdAt || "",
    ]);
  });
  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [userId, setUserId] = useState("");
  const [ip, setIp] = useState("");
  const [scope, setScope] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const auditQuery = useQuery({
    queryKey: ["admin-audit-logs", page, pageSize, query, action, entity, userId, ip, scope],
    queryFn: () =>
      getAdminAuditLogs(undefined, {
        page,
        pageSize,
        q: query.trim() || undefined,
        action: action.trim() || undefined,
        entity: entity.trim() || undefined,
        userId: userId ? Number(userId) : undefined,
        ip: ip.trim() || undefined,
        scope: scope === "all" ? undefined : scope,
      }),
  });

  const items = auditQuery.data?.data?.items || [];
  const totalPages = auditQuery.data?.data?.pagination?.totalPages || 1;
  const totalItems = auditQuery.data?.data?.pagination?.total || 0;

  const actions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.action))).filter(
        (value): value is string => Boolean(value)
      ),
    [items]
  );
  const scopes = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.scope))).filter(
        (value): value is string => Boolean(value)
      ),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (!dateFilter) return items;
    return items.filter((item) => formatDateOnly(item.createdAt) === dateFilter);
  }, [items, dateFilter]);

  const last24hStats = useMemo(() => {
    const now = Date.now();
    const within24h = filteredItems.filter((item) => {
      if (!item.createdAt) return false;
      const created = Date.parse(item.createdAt);
      return !Number.isNaN(created) && now - created <= 24 * 60 * 60 * 1000;
    });
    const stats = { create: 0, update: 0, delete: 0 };
    within24h.forEach((item) => {
      if (item.action.includes("CREATE")) stats.create += 1;
      if (item.action.includes("UPDATE")) stats.update += 1;
      if (item.action.includes("DELETE")) stats.delete += 1;
    });
    return stats;
  }, [filteredItems]);

  const handleExport = () => {
    const csv = buildCsv(filteredItems);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Nhật ký hoạt động</h1>
          <p className="mt-1 text-sm text-white/60">
            Giám sát và quản lý các thay đổi hệ thống theo thời gian thực.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={handleExport}
          >
            Xuất báo cáo
          </Button>
          <Button onClick={() => auditQuery.refetch()}>Làm mới</Button>
        </div>
      </div>

      <Card className="border-white/10 bg-[#111827] text-white">
        <CardContent className="space-y-4 py-5">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1.2fr]">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                🔍
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm hành động, ID hoặc IP..."
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white"
              />
            </div>
            <select
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="">Tất cả hành động</option>
              {actions.map((value) => (
                <option key={value} value={value} className="bg-[#0f1722]">
                  {value}
                </option>
              ))}
            </select>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="all">Phạm vi (All Scope)</option>
              {scopes.map((value) => (
                <option key={value} value={value} className="bg-[#0f1722]">
                  {value}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={entity}
              onChange={(event) => setEntity(event.target.value)}
              placeholder="Entity"
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="User ID"
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
            <input
              value={ip}
              onChange={(event) => setIp(event.target.value)}
              placeholder="IP"
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#101826] text-white">
        <CardContent className="py-5">
          {auditQuery.isLoading ? (
            <Loading label="Loading audit logs" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
                <span>
                  Hiển thị{" "}
                  <span className="text-white">
                    {filteredItems.length ? (page - 1) * pageSize + 1 : 0}-
                    {Math.min(page * pageSize, totalItems)}
                  </span>{" "}
                  trong {totalItems} bản ghi
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
                    Hiển thị
                    <select
                      className="rounded-full border border-white/10 bg-transparent px-3 py-1 text-xs text-white"
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                    >
                      {[10, 20, 30, 50].map((size) => (
                        <option key={size} value={size} className="bg-[#0f1722] text-white">
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                  >
                    &lt;
                  </Button>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                  >
                    &gt;
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1.3fr_0.6fr_0.8fr_0.9fr_0.8fr] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/50">
                  <span>Hành động &amp; kỹ thuật</span>
                  <span>Phạm vi</span>
                  <span>Đối tượng</span>
                  <span>Người dùng</span>
                  <span>Thời gian &amp; IP</span>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredItems.length ? (
                    filteredItems.map((log) => {
                      const metadata = log.metadata as
                        | { payloadHash?: string; endpoint?: string; userAgent?: string }
                        | undefined;
                      const hash = metadata?.payloadHash;
                      const endpoint = metadata?.endpoint;
                      const userAgent = metadata?.userAgent;
                      return (
                        <div
                          key={log.id}
                          className="grid grid-cols-[1.3fr_0.6fr_0.8fr_0.9fr_0.8fr] items-center gap-4 px-4 py-4 text-sm text-white/80"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-white">{log.action}</p>
                              <Badge variant={pickActionBadge(log.action)}>
                                {log.action.split("_").slice(-1)[0]}
                              </Badge>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-[#0f1722] px-3 py-2 text-xs text-white/50">
                              {hash ? <p>hash: {hash.slice(0, 12)}…</p> : null}
                              {endpoint ? <p>endpoint: {endpoint}</p> : null}
                              {userAgent ? <p>ua: {userAgent}</p> : null}
                            </div>
                          </div>
                          <Badge variant="default">{log.scope || "-"}</Badge>
                          <div>
                            <p>{log.entity}</p>
                            <p className="text-xs text-white/40">ID: {log.entityId ?? "-"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                              {(log.name || log.email || "A").slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p>{log.name || log.email || "-"}</p>
                              <p className="text-xs text-white/40">UID: {log.userId ?? "-"}</p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-white/60">
                            <p className="text-sm text-white">{formatDate(log.createdAt)}</p>
                            <p>{log.ip || "-"}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-sm text-white/50">Chưa có log.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "TẠO MỚI (24H)", value: last24hStats.create, color: "border-emerald-500/40" },
          { label: "CẬP NHẬT (24H)", value: last24hStats.update, color: "border-amber-500/40" },
          { label: "XÓA (24H)", value: last24hStats.delete, color: "border-rose-500/40" },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border ${item.color} bg-[#111827] p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.25)]`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
