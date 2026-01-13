"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { getCmsPost, updateCmsPost } from "@/lib/api/admin";
import CmsPostForm from "@/components/admin/CmsPostForm";
import Loading from "@/components/common/Loading";
import { getDefaultLang } from "@/lib/i18n";

export default function EditPostPage() {
  const token = useAuthStore((state) => state.token);
  const params = useParams<{ id?: string; lang?: string }>();
  const idParam = params?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();

  const { data, isLoading } = useQuery({
    queryKey: ["cms-post", id],
    queryFn: () => getCmsPost(token || "", id),
    enabled: Boolean(token && id),
  });

  const post = data?.data;

  if (!token) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">Please sign in.</p>
    );
  }

  if (isLoading) {
    return <Loading label="Loading post" />;
  }

  if (!post) {
    return <p className="text-sm text-[var(--ink-muted)]">Post not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Posts
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Edit post
        </h1>
      </div>
      <CmsPostForm
        initial={post}
        langCode={resolvedLang}
        onSave={(payload) => updateCmsPost(token, id, payload)}
      />
    </div>
  );
}
