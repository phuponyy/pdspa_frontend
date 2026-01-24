"use client";

import PageEditor from "@/components/admin/PageEditor";
import { DEFAULT_LANG } from "@/lib/constants";
import { useTranslation } from "react-i18next";
export default function HomeEditorPage() {
  const { i18n } = useTranslation();
  const resolvedLang = i18n.language?.split("-")[0] || DEFAULT_LANG;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8fb6ff]">
          TRANG CHỦ
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">Chỉnh Sửa Nội Dung</h1>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-300">
            Chỉnh sửa trang website là một đời an yên
          </span>
        </div>
      </div>
      <PageEditor lang={resolvedLang} />
    </div>
  );
}

