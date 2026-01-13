"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import CmsPostForm from "@/components/admin/CmsPostForm";
import { createCmsPost } from "@/lib/api/admin";
import { getDefaultLang } from "@/lib/i18n";

export default function NewPostPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();

  if (!token) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">Please sign in.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Posts
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          New post
        </h1>
      </div>
      <CmsPostForm
        langCode={resolvedLang}
        onSave={async (payload) => {
          const response = await createCmsPost(token, payload);
          const id = response?.data?.id;
          if (id) {
            router.replace(`/${resolvedLang}/admin/posts/${id}?lang=${resolvedLang}`);
          }
        }}
      />
    </div>
  );
}
