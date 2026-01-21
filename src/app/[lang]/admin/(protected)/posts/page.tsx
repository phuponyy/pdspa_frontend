"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCmsPosts } from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { getDefaultLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function PostsListPage() {
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["cms-posts"],
    queryFn: () => getCmsPosts(undefined, 1, 20),
  });

  const posts = data?.data?.items || [];
  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesFilter = filter === "ALL" || post.status === filter;
      if (!matchesFilter) return false;
      if (!normalized) return true;
      return post.translations?.some((t) =>
        t.title?.toLowerCase().includes(normalized)
      );
    });
  }, [posts, query, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Quản lý Bài viết</h1>
        <Link href={`/${resolvedLang}/admin/posts/new?lang=${resolvedLang}`}>
          <Button size="icon">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </Link>
      </div>

      <div className="relative">
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

      {isLoading ? (
        <Loading label="Loading posts" />
      ) : (
        <div className="space-y-4">
          {filteredPosts.length ? (
            filteredPosts.map((post) => {
              const translation = post.translations?.[0];
              const isPublished = post.status === "PUBLISHED";
              const fallback = (translation?.title || `Bài viết #${post.id}`).slice(0, 1);
              return (
                <Card key={post.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-lg font-semibold text-white">
                        {fallback}
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
                    <Link
                      href={`/${resolvedLang}/admin/posts/${post.id}?lang=${resolvedLang}`}
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
            <p className="text-sm text-slate-400">Chưa có bài viết nào.</p>
          )}
        </div>
      )}
    </div>
  );
}
