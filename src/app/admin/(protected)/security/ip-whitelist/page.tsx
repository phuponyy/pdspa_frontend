"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminIpConfig, updateAdminIpConfig } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/common/ToastProvider";

export default function AdminWhitelistPage() {
  const toast = useToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-ip-config"],
    queryFn: () => getAdminIpConfig(),
  });
  const whitelist = data?.data?.whitelist || [];
  const blacklist = data?.data?.blacklist || [];
  const [value, setValue] = useState("");
  const [localList, setLocalList] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [newIp, setNewIp] = useState("");

  useEffect(() => {
    setValue(whitelist.join("\n"));
    setLocalList(whitelist);
  }, [whitelist]);

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localList;
    return localList.filter((ip) => ip.toLowerCase().includes(q));
  }, [localList, query]);

  const handleSave = async (nextWhitelist: string[]) => {
    try {
      await updateAdminIpConfig({
        whitelist: nextWhitelist,
        blacklist,
      });
      toast.push({ message: "Đã cập nhật whitelist.", type: "success" });
      await refetch();
    } catch {
      toast.push({ message: "Cập nhật thất bại.", type: "error" });
    }
  };

  const handleAddIp = async () => {
    const ip = newIp.trim();
    if (!ip) return;
    if (localList.includes(ip)) {
      toast.push({ message: "IP đã tồn tại.", type: "error" });
      return;
    }
    const next = [ip, ...localList];
    setLocalList(next);
    setNewIp("");
    await handleSave(next);
  };

  const handleRemoveIp = async (ip: string) => {
    const next = localList.filter((item) => item !== ip);
    setLocalList(next);
    await handleSave(next);
  };

  const handleBulkSave = async () => {
    const nextWhitelist = value
      .split("\n")
      .map((ip) => ip.trim())
      .filter(Boolean);
    setLocalList(nextWhitelist);
    await handleSave(nextWhitelist);
  };

  const handleExport = () => {
    const text = localList.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ip-whitelist-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Security
          </p>
          <h1 className="text-2xl font-semibold">IP Whitelist</h1>
          <p className="mt-2 text-sm text-white/60">
            Theo dõi và quản lý các IP được phép truy cập admin. Thay đổi áp dụng ngay.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={handleExport}
          >
            Xuất danh sách
          </Button>
          <Button
            variant="secondary"
            className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => handleSave([])}
            disabled={!localList.length}
          >
            Xoá tất cả
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-[#111827] text-white">
        <CardContent className="space-y-4 py-5">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                🔍
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo IP..."
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white"
              />
            </div>
            <input
              value={newIp}
              onChange={(event) => setNewIp(event.target.value)}
              placeholder="Thêm IP mới"
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
            <Button className="h-11" onClick={handleAddIp} disabled={!newIp.trim()}>
              Thêm IP
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#101826] text-white">
        <CardContent className="py-5">
          {isLoading ? (
            <Loading label="Loading whitelist" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
                <span>
                  Tổng <span className="text-white">{localList.length}</span> IP
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/50">
                  <span>IP Address</span>
                  <span>Loại</span>
                  <span>Thao tác</span>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredList.length ? (
                    filteredList.map((ip) => (
                      <div
                        key={ip}
                        className="grid grid-cols-[1.3fr_1fr_1fr] items-center gap-4 px-4 py-3 text-sm text-white/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                            {ip.includes(":") ? "6" : "4"}
                          </div>
                          <div>
                            <p className="text-white">{ip}</p>
                            <p className="text-xs text-white/40">Allowed</p>
                          </div>
                        </div>
                        <Badge variant="default">{ip.includes(":") ? "IPv6" : "IPv4"}</Badge>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => handleRemoveIp(ip)}
                          >
                            Thu hồi
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-white/50">Chưa có IP nào.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#111827] text-white">
        <CardContent className="space-y-3 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Cập nhật nhanh (bulk)
          </p>
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Mỗi dòng là một IP"
            rows={6}
          />
          <Button onClick={handleBulkSave}>Lưu whitelist</Button>
        </CardContent>
      </Card>
    </div>
  );
}
