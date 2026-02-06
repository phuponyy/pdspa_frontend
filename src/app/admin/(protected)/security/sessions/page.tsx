"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/common/ToastProvider";
import Loading from "@/components/common/Loading";
import { getAdminSessions, revokeAdminSession, revokeAdminSessions } from "@/lib/api/admin";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import {
  AdminAlertDialog,
  AdminAlertDialogAction,
  AdminAlertDialogCancel,
  AdminAlertDialogContent,
  AdminAlertDialogDescription,
  AdminAlertDialogTitle,
  AdminAlertDialogTrigger,
} from "@/components/admin/ui/AdminDialog";
import { AdminCard, AdminCardContent } from "@/components/admin/ui/AdminCard";

const formatDate = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function AdminSessionsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "expired">("all");
  const [deviceType, setDeviceType] = useState<"all" | "desktop" | "mobile">("all");
  const [query, setQuery] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);
  const [confirmRevokeTarget, setConfirmRevokeTarget] = useState<{
    type: "ip" | "device";
    value: string;
  } | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["admin-sessions", page, pageSize, activeFilter, query, ipFilter, deviceFilter, userIdFilter],
    queryFn: () =>
      getAdminSessions(undefined, {
        page,
        pageSize,
        active:
          activeFilter === "active"
            ? true
            : activeFilter === "expired"
            ? false
            : undefined,
        q: query.trim() || undefined,
        ip: ipFilter.trim() || undefined,
        device: deviceFilter.trim() || undefined,
        userId: userIdFilter ? Number(userIdFilter) : undefined,
      }),
  });

  const items = sessionsQuery.data?.data?.items || [];
  const totalPages = sessionsQuery.data?.data?.pagination?.totalPages || 1;
  const totalItems = sessionsQuery.data?.data?.pagination?.total || 0;

  const canBulkRevoke = useMemo(
    () => Boolean(ipFilter.trim() || deviceFilter.trim() || userIdFilter.trim()),
    [ipFilter, deviceFilter, userIdFilter]
  );

  const filteredItems = useMemo(() => {
    if (deviceType === "all") return items;
    const isMobile = (value?: string | null) =>
      Boolean(value && /iphone|android|mobile|ipad|ios/i.test(value));
    return items.filter((item) => {
      const token = item.device || item.userAgent || "";
      const mobile = isMobile(token);
      return deviceType === "mobile" ? mobile : !mobile;
    });
  }, [items, deviceType]);

  const revokeByFilter = async () => {
    if (!canBulkRevoke) {
      toast.push({ message: "Vui lòng nhập IP, Device hoặc User ID.", type: "info" });
      return;
    }
    try {
      const payload = {
        ip: ipFilter.trim() || undefined,
        device: deviceFilter.trim() || undefined,
        userId: userIdFilter ? Number(userIdFilter) : undefined,
      };
      const result = await revokeAdminSessions(undefined, payload);
      toast.push({
        message: `Đã thu hồi ${result?.data?.revoked ?? 0} phiên.`,
        type: "success",
      });
      await sessionsQuery.refetch();
    } catch {
      toast.push({ message: "Không thể thu hồi phiên.", type: "error" });
    }
  };

  const revokeAll = async () => {
    try {
      const result = await revokeAdminSessions(undefined, { all: true });
      toast.push({
        message: `Đã thu hồi ${result?.data?.revoked ?? 0} phiên.`,
        type: "success",
      });
      await sessionsQuery.refetch();
    } catch {
      toast.push({ message: "Không thể thu hồi phiên.", type: "error" });
    }
  };

  const revokeSingle = async (id: number) => {
    try {
      await revokeAdminSession(undefined, id);
      toast.push({ message: "Đã thu hồi phiên.", type: "success" });
      await sessionsQuery.refetch();
    } catch {
      toast.push({ message: "Không thể thu hồi phiên.", type: "error" });
    }
  };

  const revokeByIp = async (ip: string | null | undefined) => {
    if (!ip) return;
    try {
      const result = await revokeAdminSessions(undefined, { ip });
      toast.push({
        message: `Đã thu hồi ${result?.data?.revoked ?? 0} phiên theo IP.`,
        type: "success",
      });
      await sessionsQuery.refetch();
    } catch {
      toast.push({ message: "Không thể thu hồi theo IP.", type: "error" });
    }
  };

  const revokeByDevice = async (device: string | null | undefined) => {
    if (!device) return;
    try {
      const result = await revokeAdminSessions(undefined, { device });
      toast.push({
        message: `Đã thu hồi ${result?.data?.revoked ?? 0} phiên theo thiết bị.`,
        type: "success",
      });
      await sessionsQuery.refetch();
    } catch {
      toast.push({ message: "Không thể thu hồi theo thiết bị.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Security
          </p>
          <h1 className="text-2xl font-semibold">Phiên đăng nhập</h1>
          <p className="mt-2 text-sm text-white/60">
            Theo dõi và thu hồi phiên đăng nhập theo IP hoặc thiết bị của người dùng.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
        <AdminCard className="border-white/10 bg-[#0f1623] text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <AdminCardContent className="space-y-4 py-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  🔍
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo email, tên, UA"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white"
                />
              </div>
              <input
                value={ipFilter}
                onChange={(event) => setIpFilter(event.target.value)}
                placeholder="IP Address"
                className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              />
              <input
                value={deviceFilter}
                onChange={(event) => setDeviceFilter(event.target.value)}
                placeholder="Device"
                className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              />
              <input
                value={userIdFilter}
                onChange={(event) => setUserIdFilter(event.target.value)}
                placeholder="User ID"
                className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "active", label: "Đang hoạt động" },
                  { key: "expired", label: "Hết hạn" },
                ].map((item) => (
                  <AdminButton
                    key={item.key}
                    variant={activeFilter === item.key ? "default" : "secondary"}
                    size="sm"
                    className={
                      activeFilter === item.key
                        ? "bg-[var(--accent-strong)] text-black hover:bg-[var(--accent-strong)]/90"
                        : ""
                    }
                    onClick={() => setActiveFilter(item.key as typeof activeFilter)}
                  >
                    {item.label}
                  </AdminButton>
                ))}
                {[
                  { key: "desktop", label: "Desktop" },
                  { key: "mobile", label: "Mobile" },
                ].map((item) => (
                  <AdminButton
                    key={item.key}
                    variant={deviceType === item.key ? "default" : "secondary"}
                    size="sm"
                    className={deviceType === item.key ? "bg-white/10 text-white" : ""}
                    onClick={() => setDeviceType(item.key as typeof deviceType)}
                  >
                    {item.label}
                  </AdminButton>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                <AdminButton
                  size="sm"
                  variant="outline"
                  onClick={revokeByFilter}
                  disabled={!canBulkRevoke}
                >
                  Thu hồi theo bộ lọc
                </AdminButton>
                <AdminAlertDialog open={confirmRevokeAll} onOpenChange={setConfirmRevokeAll}>
                  <AdminAlertDialogTrigger asChild>
                    <AdminButton className="bg-[var(--accent-strong)] text-black hover:bg-[var(--accent-strong)]/90">
                      Thu hồi tất cả
                    </AdminButton>
                  </AdminAlertDialogTrigger>
                  <AdminAlertDialogContent>
                    <AdminAlertDialogTitle>Thu hồi toàn bộ phiên?</AdminAlertDialogTitle>
                    <AdminAlertDialogDescription>
                      Hành động này sẽ đăng xuất tất cả thiết bị và không thể hoàn tác.
                    </AdminAlertDialogDescription>
                    <div className="mt-6 flex items-center justify-end gap-3">
                      <AdminAlertDialogCancel>Huỷ</AdminAlertDialogCancel>
                      <AdminAlertDialogAction
                        onClick={() => {
                          setConfirmRevokeAll(false);
                          void revokeAll();
                        }}
                      >
                        Thu hồi
                      </AdminAlertDialogAction>
                    </div>
                  </AdminAlertDialogContent>
                </AdminAlertDialog>
              </div>
            </div>
          </AdminCardContent>
        </AdminCard>

        <AdminCard className="border-white/10 bg-[#0f1623] text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <AdminCardContent className="flex h-full items-center justify-between gap-4 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                Tổng số phiên
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {totalItems}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-strong)]/15 text-[var(--accent-strong)]">
              #
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard className="border-white/10 bg-[#0f1623] text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <AdminCardContent className="py-5">
          {sessionsQuery.isLoading ? (
            <Loading label="Loading sessions" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
                <span>
                  Tổng <span className="text-white">{filteredItems.length}</span> phiên
                </span>
                <div className="flex items-center gap-2">
                  <AdminButton
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                  >
                    Trước
                  </AdminButton>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {page} / {totalPages}
                  </span>
                  <AdminButton
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                  >
                    Sau
                  </AdminButton>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_220px] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/50">
                  <span>Người dùng</span>
                  <span>IP / Device</span>
                  <span>Hoạt động gần nhất</span>
                  <span>Thao tác</span>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredItems.length ? (
                    filteredItems.map((session) => (
                      <div
                        key={session.id}
                        className="grid grid-cols-[1.4fr_1fr_1fr_220px] items-center gap-4 px-4 py-3 text-sm text-white/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                            {(session.name || session.email || "A").slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white">{session.name || session.email || "Unknown"}</p>
                            <p className="text-xs text-white/50">
                              #{session.userId} · {session.roleKey || "ROLE"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-white/50">
                          <p className="text-sm text-white">{session.ip || "-"}</p>
                          <p>{session.device || session.userAgent || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-white">{formatDate(session.lastUsedAt)}</p>
                          <AdminBadge variant={session.isActive ? "success" : "draft"}>
                            {session.isActive ? "Active" : "Expired"}
                          </AdminBadge>
                          <p className="text-xs text-white/40">
                            Hết hạn: {formatDate(session.expiresAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <AdminButton
                            size="sm"
                            variant="outline"
                            onClick={() => revokeSingle(session.id)}
                          >
                            Thu hồi
                          </AdminButton>
                          <AdminButton
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              session.ip
                                ? setConfirmRevokeTarget({ type: "ip", value: session.ip })
                                : undefined
                            }
                            disabled={!session.ip}
                          >
                            Thu hồi IP
                          </AdminButton>
                          <AdminButton
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const device = session.device || session.userAgent;
                              if (device) {
                                setConfirmRevokeTarget({ type: "device", value: device });
                              }
                            }}
                            disabled={!session.device && !session.userAgent}
                          >
                            Thu hồi thiết bị
                          </AdminButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-white/50">Chưa có phiên.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </AdminCardContent>
      </AdminCard>

      <AdminAlertDialog
        open={Boolean(confirmRevokeTarget)}
        onOpenChange={(open) => {
          if (!open) setConfirmRevokeTarget(null);
        }}
      >
        <AdminAlertDialogContent>
          <AdminAlertDialogTitle>
            Thu hồi theo {confirmRevokeTarget?.type === "ip" ? "IP" : "thiết bị"}?
          </AdminAlertDialogTitle>
          <AdminAlertDialogDescription>
            {confirmRevokeTarget?.type === "ip"
              ? `Tất cả phiên dùng IP ${confirmRevokeTarget?.value} sẽ bị đăng xuất.`
              : `Tất cả phiên dùng thiết bị ${confirmRevokeTarget?.value} sẽ bị đăng xuất.`}
          </AdminAlertDialogDescription>
          <div className="mt-6 flex items-center justify-end gap-3">
            <AdminAlertDialogCancel>Huỷ</AdminAlertDialogCancel>
            <AdminAlertDialogAction
              onClick={() => {
                const target = confirmRevokeTarget;
                setConfirmRevokeTarget(null);
                if (!target) return;
                if (target.type === "ip") {
                  void revokeByIp(target.value);
                } else {
                  void revokeByDevice(target.value);
                }
              }}
            >
              Thu hồi
            </AdminAlertDialogAction>
          </div>
        </AdminAlertDialogContent>
      </AdminAlertDialog>
    </div>
  );
}
