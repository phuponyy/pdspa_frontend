"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCmsPage, updateCmsPage } from "@/lib/api/admin";
import CmsPageForm from "@/components/admin/CmsPageForm";
import Loading from "@/components/common/Loading";
import { getDefaultLang } from "@/lib/i18n";

export default function EditPagePage() {
  const params = useParams<{ id?: string }>();
  const idParam = params?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const resolvedLang = getDefaultLang();

  const { data, isLoading } = useQuery({
    queryKey: ["cms-page", id],
    queryFn: () => getCmsPage(undefined, id),
    enabled: Number.isFinite(id),
  });

  const page = data?.data;

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
        onSave={(payload) => updateCmsPage(undefined, id, payload)}
      />
    </div>
  );
}
