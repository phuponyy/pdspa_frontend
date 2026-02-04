"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/client";
import PublicHeartbeat from "@/components/common/PublicHeartbeat";

export default function I18nProvider({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  return (
    <I18nextProvider i18n={i18n}>
      <PublicHeartbeat />
      {children}
    </I18nextProvider>
  );
}
