"use client";

import { useRouter } from "next/navigation";
import CmsPostForm from "@/components/admin/CmsPostForm";
import { createCmsPost } from "@/lib/api/admin";
import { getDefaultLang } from "@/lib/i18n";

export default function NewPostPage() {
  const router = useRouter();
  const resolvedLang = getDefaultLang();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Bài viết
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Thêm bài viết mới
        </h1>
      </div>
      <CmsPostForm
        langCode={resolvedLang}
        onSave={async (payload) => {
          const response = await createCmsPost(undefined, payload);
          const id = response?.data?.id;
          if (id) {
            router.replace(`/admin/posts/${id}?lang=${resolvedLang}`);
          }
        }}
      />
    </div>
  );
}
