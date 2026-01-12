"use client";

import { useParams } from "next/navigation";
import PageEditor from "@/components/admin/PageEditor";
import { useAuthStore } from "@/lib/stores/authStore";
import { getDefaultLang } from "@/lib/i18n";

export default function HomeEditorPage() {
  const token = useAuthStore((state) => state.token);
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();

  if (!token) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Please sign in to edit the homepage.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
          Homepage
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Content editor
        </h1>
      </div>
      <PageEditor token={token} lang={resolvedLang} />
    </div>
  );
}
