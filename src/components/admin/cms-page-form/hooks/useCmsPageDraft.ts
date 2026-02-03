import { useCallback, useEffect, useState } from "react";
import type { CmsPageStatus, CmsPageTranslations } from "../types";

type DraftPayload = {
  translations: CmsPageTranslations;
  status: CmsPageStatus;
  activeLang: string;
};

export const useCmsPageDraft = (storageKey: string, languages: string[]) => {
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
  }, [storageKey]);

  const persistDraft = (
    translations: CmsPageTranslations,
    status: CmsPageStatus,
    activeLang: string
  ) => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ translations, status, activeLang })
    );
  };

  const applyDraft = useCallback(
    (setTranslations: (value: CmsPageTranslations) => void, setStatus: (value: CmsPageStatus) => void, setActiveLang: (value: string) => void) => {
      if (!loadedDraft) return;
      setTranslations(loadedDraft.translations);
      setStatus(loadedDraft.status);
      setActiveLang(loadedDraft.activeLang);
      setIsDirty(false);
    },
    [loadedDraft]
  );

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  return { isDirty, setIsDirty, persistDraft, clearDraft, loadedDraft, applyDraft };
};
