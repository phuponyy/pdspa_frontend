"use client";

import { useRouter } from "next/navigation";
import CmsPageForm from "@/components/admin/CmsPageForm";
import { createCmsPage } from "@/lib/api/admin";
import { DEFAULT_LANG } from "@/lib/constants";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { useTranslation } from "react-i18next";

export default function NewPagePage() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const resolvedLang = i18n.language?.split("-")[0] || DEFAULT_LANG;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Pages
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          New page
        </h1>
      </div>
      <CmsPageForm
        langCode={resolvedLang}
        onSave={async (payload) => {
          const response = await createCmsPage(undefined, payload);
          const id = response?.data?.id;
          if (id) {
            router.replace(`${ADMIN_ROUTES.pages}/${id}?lang=${resolvedLang}`);
          }
        }}
      />
    </div>
  );
}

