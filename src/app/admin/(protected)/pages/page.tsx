"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCmsPages } from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { DEFAULT_LANG } from "@/lib/constants";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function PagesListPage() {
  const { i18n } = useTranslation();
  const resolvedLang = i18n.language?.split("-")[0] || DEFAULT_LANG;
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cms-pages"],
    queryFn: () => getCmsPages(undefined, 1, 20),
  });

  const pages = data?.data?.items || [];
  const filteredPages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return pages;
    return pages.filter((page) =>
      page.translations?.some((t) =>
        t.title?.toLowerCase().includes(normalized)
      )
    );
  }, [pages, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Quản lý Trang</h1>
        <Link href={`${ADMIN_ROUTES.pages}/new?lang=${resolvedLang}`}>
          <Button size="icon">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </span>
          <Input
            placeholder="Tìm kiếm trang..."
            className="pl-12"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button variant="secondary">
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Lọc
        </Button>
      </div>

      {isLoading ? (
        <Loading label="Loading pages" />
      ) : (
        <div className="space-y-4">
          {filteredPages.length ? (
            filteredPages.map((page) => {
              const translation = page.translations?.[0];
              const isPublished = page.status === "PUBLISHED";
              return (
                <Card key={page.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-5">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">
                        {translation?.title || `Trang #${page.id}`}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Tác giả: Admin | Cập nhật: {page.updatedAt || "-"}
                      </p>
                      <Badge variant={isPublished ? "success" : "draft"}>
                        {isPublished ? "Xuất bản" : "Bản nháp"}
                      </Badge>
                    </div>
                    <Link
                      href={`${ADMIN_ROUTES.pages}/${page.id}?lang=${resolvedLang}`}
                      className="text-white/60 hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-sm text-slate-400">Chưa có trang nào.</p>
          )}
        </div>
      )}
    </div>
  );
}




