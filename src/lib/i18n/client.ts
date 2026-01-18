"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANG } from "@/lib/constants";
import { resources } from "@/lib/i18n";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    interpolation: { escapeValue: false },
  });
}

export default i18n;
