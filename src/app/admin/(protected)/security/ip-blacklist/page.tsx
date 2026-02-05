"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminIpConfig, updateAdminIpConfig } from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { useEffect, useState } from "react";
import { useToast } from "@/components/common/ToastProvider";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export default function AdminBlacklistPage() {
  const toast = useToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-ip-config"],
    queryFn: () => getAdminIpConfig(),
  });
  const blacklist = data?.data?.blacklist || [];
  const whitelist = data?.data?.whitelist || [];
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(blacklist.join("\n"));
  }, [blacklist]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Security
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">BlackList IP</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Danh sách IP bị chặn truy cập admin. Thay đổi trong backend .env và
          restart server để áp dụng.
        </p>
      </div>

      <AdminCard>
        <AdminCardContent className="space-y-3 py-5">
          {isLoading ? (
            <Loading label="Loading blacklist" />
          ) : (
            <>
              {blacklist.length ? (
                <div className="flex flex-wrap gap-2">
                  {blacklist.map((ip: string) => (
                    <AdminBadge key={ip} variant="destructive">
                      {ip}
                    </AdminBadge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Chưa có IP nào trong blacklist.</p>
              )}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Cập nhật blacklist</p>
                <AdminTextarea
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Mỗi dòng là một IP"
                  rows={6}
                />
                <AdminButton
                  onClick={async () => {
                    const nextBlacklist = value
                      .split("\n")
                      .map((ip) => ip.trim())
                      .filter(Boolean);
                    try {
                      await updateAdminIpConfig({
                        whitelist,
                        blacklist: nextBlacklist,
                      });
                      toast.push({ message: "Đã cập nhật blacklist.", type: "success" });
                      await refetch();
                    } catch {
                      toast.push({ message: "Cập nhật thất bại.", type: "error" });
                    }
                  }}
                >
                  Lưu blacklist
                </AdminButton>
              </div>
            </>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
