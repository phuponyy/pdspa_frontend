"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCmsPosts } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/authStore";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import { getDefaultLang } from "@/lib/i18n";

export default function PostsListPage() {
  const token = useAuthStore((state) => state.token);
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();

  const { data, isLoading } = useQuery({
    queryKey: ["cms-posts"],
    queryFn: () => getCmsPosts(token || "", 1, 20),
    enabled: Boolean(token),
  });

  const posts = data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Posts
          </p>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">
            Manage posts
          </h1>
        </div>
        <Link href={`/${resolvedLang}/admin/posts/new?lang=${resolvedLang}`}>
          <Button>Create new</Button>
        </Link>
      </div>
      {isLoading ? (
        <Loading label="Loading posts" />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--mist)] text-left text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.length ? (
                posts.map((post) => {
                  const translation = post.translations?.[0];
                  return (
                    <tr
                      key={post.id}
                      className="border-t border-[var(--line)] text-[var(--ink-muted)]"
                    >
                      <td className="px-6 py-4 text-[var(--ink)]">
                        {translation?.title || `Post #${post.id}`}
                      </td>
                      <td className="px-6 py-4">{post.status}</td>
                      <td className="px-6 py-4">{post.updatedAt || "-"}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/${resolvedLang}/admin/posts/${post.id}?lang=${resolvedLang}`}
                          className="text-[var(--accent-strong)] hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-6 py-6 text-[var(--ink-muted)]" colSpan={4}>
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
