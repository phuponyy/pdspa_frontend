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
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8fb6ff]">
          Homepage
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-white">Content editor</h1>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-300">
            Edit hero, SEO, publish status
          </span>
        </div>
      </div>
      <PageEditor token={token} lang={resolvedLang} />
    </div>
  );
}
