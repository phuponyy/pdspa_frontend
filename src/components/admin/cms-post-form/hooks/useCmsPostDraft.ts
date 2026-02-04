import { useCallback, useEffect, useState } from "react";
import type { CmsPostTranslationsByLang } from "@/components/admin/cms-post-form/types";

type DraftPayload = {
  translations: CmsPostTranslationsByLang;
  status: "DRAFT" | "PUBLISHED";
  activeLang: string;
};

export const useCmsPostDraft = (storageKey: string, languages: readonly string[]) => {
  const [isDirty, setIsDirty] = useState(false);
  const [loadedDraft, setLoadedDraft] = useState<DraftPayload | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as DraftPayload;
      if (!parsed?.translations) return;
      if (!parsed?.activeLang || !languages.includes(parsed.activeLang)) return;
      setLoadedDraft(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, languages]);

  const applyDraft = useCallback(
    (
      setTranslations: (value: CmsPostTranslationsByLang) => void,
      setStatus: (value: "DRAFT" | "PUBLISHED") => void,
      setActiveLang: (value: string) => void
    ) => {
      if (!loadedDraft) return;
      setTranslations(loadedDraft.translations);
      setStatus(loadedDraft.status);
      if (loadedDraft.activeLang && languages.includes(loadedDraft.activeLang)) {
        setActiveLang(loadedDraft.activeLang);
      }
      setIsDirty(false);
    },
    [loadedDraft, languages]
  );

  const persistDraft = (
    translations: CmsPostTranslationsByLang,
    status: "DRAFT" | "PUBLISHED",
    activeLang: string
  ) => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ translations, status, activeLang })
    );
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  return { isDirty, setIsDirty, loadedDraft, applyDraft, persistDraft, clearDraft };
};
