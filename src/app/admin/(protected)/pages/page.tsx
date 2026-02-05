"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { createCmsPage, getCmsPages } from "@/lib/api/admin";
import { getSiteConfig } from "@/lib/api/public";
import Loading from "@/components/common/Loading";
import { API_BASE_URL, DEFAULT_LANG } from "@/lib/constants";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { useToast } from "@/components/common/ToastProvider";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

export default function PagesListPage() {
  const { i18n } = useTranslation();
  const resolvedLang = i18n.language?.split("-")[0] || DEFAULT_LANG;
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cms-pages", page, pageSize],
    queryFn: () => getCmsPages(undefined, page, pageSize),
  });
  const { data: siteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => getSiteConfig(),
    staleTime: 60_000,
  });

  const pages = data?.data?.items || [];
  const navConfig = siteConfig?.data || {};
  const navRaw =
    navConfig[`navbar_${resolvedLang}`] ||
    navConfig.navbar_vi ||
    navConfig.navbar_vn ||
    navConfig.navbar_en ||
    undefined;
  const menuLinks = useMemo(() => {
    if (!navRaw) return [] as { label: string; href: string }[];
    try {
      const parsed = JSON.parse(navRaw) as { label?: string; href?: string }[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => ({
          label: String(item.label || "").trim(),
          href: String(item.href || "").trim(),
        }))
        .filter((item) => item.href);
    } catch {
      return [];
    }
  }, [navRaw]);
  const normalizeSlug = (href: string) => {
    const clean = href.split("?")[0]?.split("#")[0] || "";
    const noHost = clean.replace(/^https?:\/\/[^/]+/i, "");
    const stripped = noHost.replace(/^\/+/, "");
    if (!stripped) return "";
    const parts = stripped.split("/");
    if (parts[0] === "vi" || parts[0] === "en") {
      return parts.slice(1).join("/") || "";
    }
    return parts.join("/");
  };
  const detectLangFromHref = (href: string) => {
    const clean = href.split("?")[0]?.split("#")[0] || "";
    const noHost = clean.replace(/^https?:\/\/[^/]+/i, "");
    const stripped = noHost.replace(/^\/+/, "");
    const parts = stripped.split("/");
    if (parts[0] === "vi" || parts[0] === "en") return parts[0];
    return resolvedLang;
  };
  const menuPages = useMemo(() => {
    if (!menuLinks.length) return [];
    return menuLinks.map((link) => {
      const slug = normalizeSlug(link.href);
      const lang = detectLangFromHref(link.href);
      const matched = pages.find((page) =>
        page.translations?.some((t) => t.slug === slug)
      );
      return { ...link, slug, lang, page: matched };
    });
  }, [menuLinks, pages, resolvedLang]);
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
  const getTranslationByLang = (page: (typeof pages)[number], lang: string) => {
    const normalized = lang === "vn" ? "vi" : lang;
    const byLang = page.translations?.find(
      (t) => t.language?.code === normalized || t.language?.code === (normalized === "vi" ? "vn" : normalized)
    );
    return byLang || page.translations?.[0];
  };

  const buildPreviewUrl = (slug?: string) => {
    if (!slug) return "";
    return resolvedLang === "vi" ? `/vi/${slug}` : `/${slug}`;
  };

  const buildPreviewByLang = (slug?: string, lang?: string) => {
    if (!slug) return "";
    if (lang === "vi") return `/vi/${slug}`;
    return `/${slug}`;
  };

  const resolveThumb = (value?: string | null) => {
    if (!value) return "";
    return value.startsWith("http") ? value : `${API_BASE_URL}${value}`;
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleCreateFromMenu = async (item: {
    slug: string;
    label: string;
    lang: string;
  }) => {
    if (!item.slug) return;
    try {
      await createCmsPage(undefined, {
        status: "DRAFT",
        translations: [
          {
            langCode: item.lang,
            title: item.label || item.slug,
            slug: item.slug,
            content: "",
          },
        ],
      });
      await refetch();
      toast.push({ message: "Đã tạo trang từ menu.", type: "success" });
    } catch {
      toast.push({ message: "Không thể tạo trang.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Quản lý Trang</h1>
        <Link href={`${ADMIN_ROUTES.pages}/new?lang=${resolvedLang}`}>
          <AdminButton size="icon">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </AdminButton>
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
          <AdminInput
            placeholder="Tìm kiếm trang..."
            className="pl-12"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <AdminButton variant={showActiveOnly ? "default" : "secondary"} onClick={() => setShowActiveOnly(true)}>
          Đang hiển thị
        </AdminButton>
        <AdminButton variant={!showActiveOnly ? "default" : "secondary"} onClick={() => setShowActiveOnly(false)}>
          Tất cả
        </AdminButton>
        <AdminButton variant="secondary">
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Lọc
        </AdminButton>
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
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0f1722] p-5 text-white/80">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Trang trên menu</p>
            <p className="text-sm text-white/70">Chỉnh sửa metadata, SEO & schema từ đây.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
            <AdminCard className="border-white/10 bg-[#111a25]">
              <AdminCardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">Trang chủ</p>
                  <p className="text-xs text-white/50">/</p>
                  <AdminBadge variant="success">Xuất bản</AdminBadge>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={resolvedLang === "vi" ? "/vi" : "/"}
                    target="_blank"
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                  >
                    Xem site
                  </Link>
                  <Link
                    href={`${ADMIN_ROUTES.pages}/home?lang=${resolvedLang}`}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:text-white"
                  >
                    Chỉnh sửa
                  </Link>
                </div>
              </AdminCardContent>
            </AdminCard>
            {menuPages.length ? (
              menuPages.map((item) => {
                const translation = item.page
                  ? getTranslationByLang(item.page, resolvedLang)
                  : undefined;
                const activeSlug = translation?.slug || item.slug;
                const previewUrl =
                  item.page?.status === "PUBLISHED" && activeSlug
                    ? buildPreviewByLang(activeSlug, resolvedLang)
                    : "";
                const thumb = resolveThumb(
                  translation?.thumbnailUrl || translation?.ogImage
                );
                const editHref = item.page
                  ? `${ADMIN_ROUTES.pages}/${item.page.id}?lang=${resolvedLang}`
                  : "";
                return (
                  <AdminCard key={item.href} className="border-white/10 bg-[#111a25]">
                    <AdminCardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/5">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={translation?.title || item.label || "Page thumbnail"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/50">
                              {item.label?.slice(0, 1) || "P"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {item.label || translation?.title || item.slug || "Trang menu"}
                          </p>
                          <p className="text-xs text-white/50">{item.href}</p>
                          <AdminBadge variant={item.page?.status === "PUBLISHED" ? "success" : "draft"}>
                            {item.page?.status === "PUBLISHED" ? "Xuất bản" : "Bản nháp"}
                          </AdminBadge>
                          {item.page ? (
                            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
                              SEO: {translation?.seoTitle ? "ok" : "missing"} · Schema:{" "}
                              {translation?.schemaJson ? "ok" : "missing"}
                            </p>
                          ) : null}
                          {item.page ? (
                            <div className="mt-1 space-y-1 text-xs text-white/60">
                              <p className="truncate">
                                Meta title: {translation?.seoTitle || "Chưa có"}
                              </p>
                              <p className="truncate">
                                Meta description: {translation?.seoDescription || "Chưa có"}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {previewUrl ? (
                          <Link
                            href={previewUrl}
                            target="_blank"
                            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                          >
                            Xem site
                          </Link>
                        ) : null}
                        {item.page ? (
                          <Link
                            href={editHref}
                            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:text-white"
                          >
                            Chỉnh sửa
                          </Link>
                        ) : (
                          <AdminButton
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleCreateFromMenu({
                                slug: item.slug,
                                label: item.label || item.slug,
                                lang: item.lang || resolvedLang,
                              })
                            }
                          >
                            Tạo trang
                          </AdminButton>
                        )}
                      </div>
                    </AdminCardContent>
                  </AdminCard>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#0f1722] p-4 text-sm text-white/60">
                Chưa có trang menu. Bạn có thể cấu hình menu ở Site Config.
              </div>
            )}
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
                <AdminCard key={page.id} className="group">
                  <AdminCardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">
                        {translation?.title || `Trang #${page.id}`}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Tác giả: Admin | Cập nhật: {page.updatedAt || "-"}
                      </p>
                      <AdminBadge variant={isPublished ? "success" : "draft"}>
                        {isPublished ? "Xuất bản" : "Bản nháp"}
                      </AdminBadge>
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
                  </AdminCardContent>
                </AdminCard>
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