"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCmsPost, updateCmsPost } from "@/lib/api/admin";
import CmsPostForm from "@/components/admin/CmsPostForm";
import Loading from "@/components/common/Loading";
import { DEFAULT_LANG } from "@/lib/constants";
export default function EditPostPage() {
  const params = useParams<{ id?: string }>();
  const idParam = params?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const { i18n } = useTranslation();
  const resolvedLang = i18n.language?.split("-")[0] || DEFAULT_LANG;

  const { data, isLoading } = useQuery({
    queryKey: ["cms-post", id],
    queryFn: () => getCmsPost(undefined, id),
    enabled: Number.isFinite(id),
  });

  const post = data?.data;

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
        onSave={(payload) => updateCmsPost(undefined, id, payload)}
      />
    </div>
  );
}

