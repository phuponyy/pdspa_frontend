"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  deleteCmsPost,
  getCmsCategories,
  getCmsPosts,
  getCmsTags,
  updateCmsPost,
} from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { API_BASE_URL, DEFAULT_LANG } from "@/lib/constants";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api/client";

export default function PostsListPage() {
  const { i18n } = useTranslation();
  const resolvedLang = i18n.language?.split("-")[0] || DEFAULT_LANG;
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const postsQuery = useQuery({
    queryKey: ["cms-posts", page, pageSize],
    queryFn: () => getCmsPosts(undefined, page, pageSize),
  });
  const categoriesQuery = useQuery({
    queryKey: ["cms-categories"],
    queryFn: () => getCmsCategories(undefined),
  });
  const tagsQuery = useQuery({
    queryKey: ["cms-tags"],
    queryFn: () => getCmsTags(undefined),
  });

  const posts = postsQuery.data?.data?.items || [];
  const totalPages = postsQuery.data?.data?.pagination?.totalPages || 1;
  const totalItems = postsQuery.data?.data?.pagination?.total || 0;
  const categories = categoriesQuery.data?.data || [];
  const tags = tagsQuery.data?.data || [];
  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesFilter = filter === "ALL" || post.status === filter;
      if (!matchesFilter) return false;
      if (selectedCategoryIds.length) {
        const matchCategory = post.categories?.some((item) =>
          selectedCategoryIds.includes(item.id)
        );
        if (!matchCategory) return false;
      }
      if (selectedTagIds.length) {
        const matchTag = post.tags?.some((item) => selectedTagIds.includes(item.id));
        if (!matchTag) return false;
      }
      if (!normalized) return true;
      return post.translations?.some((t) =>
        t.title?.toLowerCase().includes(normalized)
      );
    });
  }, [posts, query, filter, selectedCategoryIds, selectedTagIds]);

  const filteredCategories = useMemo(() => {
    const normalized = categoryQuery.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [categories, categoryQuery]);

  const filteredTags = useMemo(() => {
    const normalized = tagQuery.trim().toLowerCase();
    if (!normalized) return tags;
    return tags.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [tags, tagQuery]);

  const notify = (message: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message, type });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredPosts.map((post) => post.id));
  };

  const bulkUpdateStatus = async (status: "PUBLISHED" | "DRAFT") => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => updateCmsPost(undefined, id, { status })));
      notify("Đã cập nhật bài viết.", "success");
      setSelectedIds([]);
      await postsQuery.refetch();
    } catch {
      notify("Không thể cập nhật bài viết.", "error");
    }
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    const ok = window.confirm("Bạn chắc chắn muốn xoá các bài đã chọn?");
    if (!ok) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteCmsPost(undefined, id)));
      notify("Đã xoá bài viết.", "success");
      setSelectedIds([]);
      await postsQuery.refetch();
    } catch {
      notify("Không thể xoá bài viết.", "error");
    }
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const deleteSingle = async (id: number) => {
    try {
      await deleteCmsPost(undefined, id);
      notify("Đã xoá bài viết.", "success");
      setSelectedIds((prev) => prev.filter((value) => value !== id));
      await postsQuery.refetch();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể xoá bài viết. Kiểm tra quyền hoặc thử lại.";
      notify(message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Quản lý Bài viết</h1>
        <Link href={`${ADMIN_ROUTES.posts}/new?lang=${resolvedLang}`}>
          <Button size="icon">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </span>
          <Input
            placeholder="Tìm kiếm bài viết..."
            className="pl-12"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={() => setShowFilters((prev) => !prev)}>
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Bộ lọc nâng cao
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#0f1722] px-4 py-3 text-sm text-white/70">
        <div>
          {totalItems ? (
            <span>
              Tổng <span className="text-white">{totalItems}</span> bài viết
            </span>
          ) : (
            <span>Chưa có bài viết</span>
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

      {showFilters ? (
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-[#0f1722] p-4 text-sm text-white/70 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Danh mục</p>
            <Input
              placeholder="Tìm danh mục..."
              value={categoryQuery}
              onChange={(event) => setCategoryQuery(event.target.value)}
            />
            <div className="flex max-h-40 flex-wrap gap-2 overflow-auto">
              {filteredCategories.map((category) => {
                const active = selectedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryIds((prev) =>
                        active
                          ? prev.filter((id) => id !== category.id)
                          : [...prev, category.id]
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                      active
                        ? "bg-[#ff9f40] text-[#1a1410]"
                        : "border border-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Thẻ</p>
            <Input
              placeholder="Tìm thẻ..."
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
            />
            <div className="flex max-h-40 flex-wrap gap-2 overflow-auto">
              {filteredTags.map((tag) => {
                const active = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((prev) =>
                        active ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                      active
                        ? "bg-[#ff9f40] text-[#1a1410]"
                        : "border border-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {selectedIds.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-[#0f1722] p-4 text-xs uppercase tracking-[0.2em] text-white/70">
          <span>{selectedIds.length} đã chọn</span>
          <Button size="sm" variant="secondary" onClick={toggleSelectAll}>
            {selectedIds.length === filteredPosts.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
          <Button size="sm" onClick={() => bulkUpdateStatus("PUBLISHED")}>
            Xuất bản
          </Button>
          <Button size="sm" variant="secondary" onClick={() => bulkUpdateStatus("DRAFT")}>
            Chuyển nháp
          </Button>
          <Button size="sm" variant="outline" onClick={bulkDelete}>
            Xoá
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Tất cả", value: "ALL" as const },
          { label: "Đã xuất bản", value: "PUBLISHED" as const },
          { label: "Nháp", value: "DRAFT" as const },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "default" : "secondary"}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {postsQuery.isLoading ? (
        <Loading label="Loading posts" />
      ) : (
        <div className="space-y-4">
          {filteredPosts.length ? (
            filteredPosts.map((post) => {
              const translation =
                post.translations?.find(
                  (t) =>
                    t.language?.code === resolvedLang ||
                    t.language?.code === (resolvedLang === "vi" ? "vn" : resolvedLang)
                ) || post.translations?.[0];
              const isPublished = post.status === "PUBLISHED";
              const fallback = (translation?.title || `Bài viết #${post.id}`).slice(0, 1);
              const translationThumbnail =
                translation?.thumbnailUrl || post.translations?.[0]?.thumbnailUrl || "";
              const thumbnailSrc = translationThumbnail
                ? translationThumbnail.startsWith("http")
                  ? translationThumbnail
                  : `${API_BASE_URL}${translationThumbnail}`
                : "";
              const previewUrl = translation?.slug
                ? resolvedLang === "vi"
                  ? `/vi/tin-tuc/${translation.slug}`
                  : `/tin-tuc/${translation.slug}`
                : "";
              const previewLabel = isPublished ? "Xem site" : "Xem trước";
              return (
                <Card key={post.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-5">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedIds.includes(post.id)}
                        onChange={() => toggleSelect(post.id)}
                      />
                      <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/5">
                        {thumbnailSrc ? (
                          <img
                            src={thumbnailSrc}
                            alt={translation?.title || "Post thumbnail"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">
                            {fallback}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-white">
                          {translation?.title || `Bài viết #${post.id}`}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Tác giả: Admin · {post.updatedAt || "Chưa cập nhật"}
                        </p>
                        <Badge variant={isPublished ? "success" : "draft"}>
                          {isPublished ? "Đã xuất bản" : "Nháp"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {previewUrl ? (
                        <Link
                          href={previewUrl}
                          target="_blank"
                          className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                        >
                          {previewLabel}
                        </Link>
                      ) : null}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="rounded-full border border-red-400/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-200/80 hover:text-red-100"
                          >
                            Xoá
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Xoá bài viết?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Bạn chắc chắn muốn xoá bài viết
                            này?
                          </AlertDialogDescription>
                          <div className="mt-6 flex items-center justify-end gap-3">
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSingle(post.id)}>
                              Xoá ngay
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Link
                        href={`${ADMIN_ROUTES.posts}/${post.id}?lang=${resolvedLang}`}
                        className="text-white/60 hover:text-white"
                      >
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-sm text-slate-400">Chưa có bài viết nào.</p>
          )}
        </div>
      )}
    </div>
  );
}




