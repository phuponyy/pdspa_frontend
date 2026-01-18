"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getLeads } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/authStore";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDefaultLang } from "@/lib/i18n";

const quickLinks = [
  { label: "Bài viết", href: "/admin/posts", stat: "12" },
  { label: "Trang", href: "/admin/pages", stat: "6" },
  { label: "Liên hệ", href: "/admin/leads", stat: "4 mới" },
];

export default function AdminDashboard() {
  const token = useAuthStore((state) => state.token);
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();
  const { data, isLoading } = useQuery({
    queryKey: ["leads-summary"],
    queryFn: () => getLeads(token || "", 1, 5),
    enabled: Boolean(token),
  });

  const payload = data?.data;
  const total = payload?.pagination?.total ?? payload?.items?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/80"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-white">Bảng điều khiển</h1>
        <Button size="icon">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((item) => (
            <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-3xl font-semibold text-white">{item.stat}</span>
              <Link
                href={`/${resolvedLang}${item.href}`}
                className="text-sm text-[#8fb6ff] hover:text-white"
              >
                Mở
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng quan leads</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          {isLoading ? (
            <Loading label="Đang tải" />
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Tổng số</p>
                <p className="text-2xl font-semibold text-white">{total}</p>
              </div>
              <Badge variant="success">Hoạt động ổn định</Badge>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
