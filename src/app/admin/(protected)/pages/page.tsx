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
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-pages", page, pageSize],
    queryFn: () => getCmsPages(undefined, page, pageSize),
  });

  const pages = data?.data?.items || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const totalItems = data?.data?.pagination?.total || 0;
  const filteredPages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = showActiveOnly ? pages.filter((page) => page.status === "PUBLISHED") : pages;
    if (!normalized) return base;
    return base.filter((page) =>
      page.translations?.some((t) =>
        t.title?.toLowerCase().includes(normalized)
      )
    );
  }, [pages, query, showActiveOnly]);

  const getTranslation = (page: (typeof pages)[number]) => {
    const byLang = page.translations?.find(
      (t) => t.language?.code === resolvedLang || t.language?.code === (resolvedLang === "vi" ? "vn" : resolvedLang)
    );
    return byLang || page.translations?.[0];
  };

  const buildPreviewUrl = (slug?: string) => {
    if (!slug) return "";
    return resolvedLang === "vi" ? `/vi/${slug}` : `/${slug}`;
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

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
        <Button variant={showActiveOnly ? "default" : "secondary"} onClick={() => setShowActiveOnly(true)}>
          Đang hiển thị
        </Button>
        <Button variant={!showActiveOnly ? "default" : "secondary"} onClick={() => setShowActiveOnly(false)}>
          Tất cả
        </Button>
        <Button variant="secondary">
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Lọc
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#0f1722] px-4 py-3 text-sm text-white/70">
        <div>
          {totalItems ? (
            <span>
              Tổng <span className="text-white">{totalItems}</span> trang
            </span>
          ) : (
            <span>Chưa có trang</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
            Hiển thị
            <select
              className="rounded-full border border-white/10 bg-transparent px-3 py-1 text-xs text-white"
              value={pageSize}
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size} className="bg-[#0f1722] text-white">
                  {size}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
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
      </div>

      {isLoading ? (
        <Loading label="Loading pages" />
      ) : (
        <div className="space-y-4">
          {filteredPages.length ? (
            filteredPages.map((page) => {
              const translation = getTranslation(page);
              const isPublished = page.status === "PUBLISHED";
              const previewUrl = isPublished ? buildPreviewUrl(translation?.slug) : "";
              return (
                <Card key={page.id} className="group">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
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
                    <div className="flex items-center gap-3">
                      {previewUrl ? (
                        <Link
                          href={previewUrl}
                          target="_blank"
                          className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                        >
                          Xem site
                        </Link>
                      ) : null}
                      <Link
                        href={`${ADMIN_ROUTES.pages}/${page.id}?lang=${resolvedLang}`}
                        className="flex items-center gap-2 text-white/60 hover:text-white"
                      >
                        <span className="text-xs uppercase tracking-[0.2em]">Chỉnh sửa</span>
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
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




