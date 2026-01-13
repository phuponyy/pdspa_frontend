"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { getCmsPage, updateCmsPage } from "@/lib/api/admin";
import CmsPageForm from "@/components/admin/CmsPageForm";
import Loading from "@/components/common/Loading";
import { getDefaultLang } from "@/lib/i18n";

export default function EditPagePage() {
  const token = useAuthStore((state) => state.token);
  const params = useParams<{ id?: string; lang?: string }>();
  const idParam = params?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();

  const { data, isLoading } = useQuery({
    queryKey: ["cms-page", id],
    queryFn: () => getCmsPage(token || "", id),
    enabled: Boolean(token && id),
  });

  const page = data?.data;

  if (!token) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">Please sign in.</p>
    );
  }

  if (isLoading) {
    return <Loading label="Loading page" />;
  }

  if (!page) {
    return <p className="text-sm text-[var(--ink-muted)]">Page not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Pages
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Edit page
        </h1>
      </div>
      <CmsPageForm
        initial={page}
        langCode={resolvedLang}
        onSave={(payload) => updateCmsPage(token, id, payload)}
      />
    </div>
  );
}
