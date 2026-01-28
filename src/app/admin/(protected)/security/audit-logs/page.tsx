"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs } from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const formatDate = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [userId, setUserId] = useState("");
  const [ip, setIp] = useState("");

  const auditQuery = useQuery({
    queryKey: ["admin-audit-logs", page, pageSize, query, action, entity, userId, ip],
    queryFn: () =>
      getAdminAuditLogs(undefined, {
        page,
        pageSize,
        q: query.trim() || undefined,
        action: action.trim() || undefined,
        entity: entity.trim() || undefined,
        userId: userId ? Number(userId) : undefined,
        ip: ip.trim() || undefined,
      }),
  });

  const items = auditQuery.data?.data?.items || [];
  const totalPages = auditQuery.data?.data?.pagination?.totalPages || 1;
  const totalItems = auditQuery.data?.data?.pagination?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Security
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Audit Log</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Lịch sử thao tác: ai làm gì, khi nào, IP và payload hash.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="grid gap-3 md:grid-cols-5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm"
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
            <input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder="Action"
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
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

      <Card>
        <CardContent className="py-5">
          {auditQuery.isLoading ? (
            <Loading label="Loading audit logs" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
                <span>
                  Tổng <span className="text-white">{totalItems}</span> log
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
                    Trước
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
                    Sau
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/50">
                  <span>Action</span>
                  <span>Entity</span>
                  <span>User</span>
                  <span>IP</span>
                  <span>Thời gian</span>
                </div>
                <div className="divide-y divide-white/5">
                  {items.length ? (
                    items.map((log) => {
                      const hash = (log.metadata as { payloadHash?: string } | undefined)
                        ?.payloadHash;
                      return (
                        <div
                          key={log.id}
                          className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3 text-sm text-white/80"
                        >
                          <div>
                            <p className="text-white">{log.action}</p>
                            {hash ? (
                              <p className="text-xs text-white/40">hash: {hash.slice(0, 12)}…</p>
                            ) : null}
                          </div>
                          <div>
                            <p>{log.entity}</p>
                            <p className="text-xs text-white/40">#{log.entityId ?? "-"}</p>
                          </div>
                          <div>
                            <p>{log.name || log.email || "-"}</p>
                            <Badge variant="default">ID {log.userId ?? "-"}</Badge>
                          </div>
                          <p>{log.ip || "-"}</p>
                          <p>{formatDate(log.createdAt)}</p>
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
    </div>
  );
}
