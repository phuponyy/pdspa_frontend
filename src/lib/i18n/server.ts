"use server";

import { createInstance } from "i18next";
import { DEFAULT_LANG } from "@/lib/constants";
import { isSupportedLang, resources } from "@/lib/i18n";

export async function getServerTranslator(lang: string) {
  const instance = createInstance();
  await instance.init({
    resources,
    lng: isSupportedLang(lang) ? lang : DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    interpolation: { escapeValue: false },
  });
  return instance;
}
