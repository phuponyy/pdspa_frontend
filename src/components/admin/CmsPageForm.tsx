"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import type { CmsPage } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import type { SchemaTemplateType } from "@/lib/seo/seoUtils";
import { PageHeader } from "./cms-page-form/sections/PageHeader";
import { ContentSection } from "./cms-page-form/sections/ContentSection";
import { SeoSchemaPanel } from "./cms-page-form/sections/SeoSchemaPanel";
import { PageActions } from "./cms-page-form/sections/PageActions";
import { FloatingBar } from "./cms-page-form/sections/FloatingBar";
import { useCmsPageTranslations } from "./cms-page-form/hooks/useCmsPageTranslations";
import { useCmsPageDraft } from "./cms-page-form/hooks/useCmsPageDraft";
import type { CmsPageStatus } from "./cms-page-form/types";

export default function CmsPageForm({
  initial,
  langCode,
  onSave,
}: {
  initial?: CmsPage;
  langCode: string;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const languages = useMemo(() => ["vi", "en"], []);
  const searchParams = useSearchParams();
  const initialLang =
    searchParams.get("lang") && languages.includes(searchParams.get("lang") || "")
      ? (searchParams.get("lang") as string)
      : langCode;
  const [activeLang, setActiveLang] = useState(initialLang);

  const { translations, setTranslations } = useCmsPageTranslations(initial, langCode, languages);

  const [status, setStatus] = useState<CmsPageStatus>(initial?.status || "DRAFT");
  const [slugEdited, setSlugEdited] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {};
    languages.forEach((code) => {
      const normalized = code === "vn" ? "vi" : code;
      const hasSlug = initial?.translations?.some((t) => {
        const raw = t.language?.code || langCode;
        const lang = raw === "vn" ? "vi" : raw;
        return lang === normalized && Boolean(t.slug);
      });
      next[code] = Boolean(hasSlug);
    });
    return next;
  });

  const existingLangs = useMemo(() => {
    const langs = new Set<string>();
    initial?.translations?.forEach((t) => {
      const raw = t.language?.code || langCode;
      langs.add(raw === "vn" ? "vi" : raw);
    });
    return langs;
  }, [initial, langCode]);

  const [focusKeywordByLang, setFocusKeywordByLang] = useState<Record<string, string>>(() => ({
    vi: "",
    en: "",
  }));
  const [schemaTemplateByLang, setSchemaTemplateByLang] = useState<Record<string, SchemaTemplateType>>(
    () => ({
      vi: "WebPage",
      en: "WebPage",
    })
  );
  const [schemaOrgByLang, setSchemaOrgByLang] = useState<Record<string, string>>(() => ({
    vi: "Panda Spa",
    en: "Panda Spa",
  }));
  const [schemaFaqByLang, setSchemaFaqByLang] = useState<
    Record<string, { question: string; answer: string }[]>
  >(() => ({
    vi: [{ question: "", answer: "" }],
    en: [{ question: "", answer: "" }],
  }));

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const storageKey = `cms-page-draft-${initial?.id ?? "new"}`;
  const draft = useCmsPageDraft(storageKey, languages);
  const toast = useToast();

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message: text, type });
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.", "error");
      return;
    }
    notify("Unable to reach the server. Please try again.", "error");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.get("lang")) {
      url.searchParams.set("lang", activeLang);
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeLang]);

  useEffect(() => {
    if (!draft.loadedDraft) return;
    draft.applyDraft(setTranslations, setStatus, setActiveLang);
  }, [draft, setTranslations]);

  useEffect(() => {
    draft.persistDraft(translations, status, activeLang);
  }, [translations, status, activeLang, draft]);

  useEffect(() => {
    const target = headerRef.current;
    if (!target || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingBar(!entry.isIntersecting);
      },
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const current = translations[activeLang] || {
    title: "",
    slug: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    canonical: "",
    robots: "index,follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    schemaJson: "",
  };

  const focusKeyword = focusKeywordByLang[activeLang] || "";
  const schemaTemplate = schemaTemplateByLang[activeLang] || "WebPage";
  const schemaOrg = schemaOrgByLang[activeLang] || "";
  const schemaFaqItems = schemaFaqByLang[activeLang] || [];
  const siteBase = typeof window !== "undefined" ? window.location.origin : "";

  const updateCurrent = (patch: Partial<typeof current>) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], ...patch },
    }));
  };

  const parseSchemaJson = (raw?: string) => {
    const trimmed = raw?.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("invalid");
      }
      return parsed as Record<string, unknown>;
    } catch {
      notify("Schema JSON không hợp lệ. Vui lòng kiểm tra lại.", "error");
      return null;
    }
  };

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const payloadTranslations: {
        langCode: string;
        title: string;
        slug: string;
        content: string;
        seoTitle?: string;
        seoDescription?: string;
        canonical?: string;
        robots?: string;
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
        schemaJson?: Record<string, unknown> | undefined;
      }[] = [];

      for (const code of languages) {
        const translation = translations[code];
        if (!translation) continue;
        const hasContent = [
          translation.title,
          translation.slug,
          translation.content,
          translation.seoTitle,
          translation.seoDescription,
          translation.canonical,
          translation.robots,
          translation.ogTitle,
          translation.ogDescription,
          translation.ogImage,
          translation.schemaJson,
        ].some((value) => String(value || "").trim().length > 0);
        if (!hasContent && !existingLangs.has(code)) continue;

        const schemaJson = parseSchemaJson(translation.schemaJson);
        if (schemaJson === null) return;

        payloadTranslations.push({
          langCode: code,
          title: translation.title,
          slug: translation.slug,
          content: translation.content,
          seoTitle: translation.seoTitle || undefined,
          seoDescription: translation.seoDescription || undefined,
          canonical: translation.canonical || undefined,
          robots: translation.robots || undefined,
          ogTitle: translation.ogTitle || undefined,
          ogDescription: translation.ogDescription || undefined,
          ogImage: translation.ogImage || undefined,
          schemaJson: schemaJson,
        });
      }

      await onSave({
        status,
        translations: payloadTranslations,
      });
      notify("Saved.", "success");
      setIsDirty(false);
      draft.clearDraft();
    } catch (err) {
      handleError(err);
    } finally {
      setIsSaving(false);
    }
  }, [existingLangs, handleError, isSaving, languages, notify, onSave, parseSchemaJson, status, storageKey, translations]);

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <PageHeader
          languages={languages}
          activeLang={activeLang}
          langCode={langCode}
          onChangeLang={(code) => {
            setActiveLang(code);
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("lang", code);
              window.history.replaceState(null, "", url.toString());
            }
          }}
          onCloneFromPrimary={() => {
            const primary = translations[langCode];
            setTranslations((prev) => ({
              ...prev,
              [activeLang]: { ...primary },
            }));
          }}
        />
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <ContentSection
          activeLang={activeLang}
          current={current}
          slugEdited={slugEdited}
          setSlugEdited={setSlugEdited}
          onChange={updateCurrent}
          setDirty={setIsDirty}
        />

        <SeoSchemaPanel
          activeLang={activeLang}
          current={current}
          focusKeyword={focusKeyword}
          setFocusKeyword={(value) =>
            setFocusKeywordByLang((prev) => ({ ...prev, [activeLang]: value }))
          }
          schemaTemplate={schemaTemplate}
          setSchemaTemplate={(value) =>
            setSchemaTemplateByLang((prev) => ({ ...prev, [activeLang]: value }))
          }
          schemaOrg={schemaOrg}
          setSchemaOrg={(value) =>
            setSchemaOrgByLang((prev) => ({ ...prev, [activeLang]: value }))
          }
          schemaFaqItems={schemaFaqItems}
          setSchemaFaqItems={(value) =>
            setSchemaFaqByLang((prev) => ({ ...prev, [activeLang]: value }))
          }
          siteBase={siteBase}
          setDirty={setIsDirty}
          onChange={updateCurrent}
        />

        <PageActions
          status={status}
          setStatus={setStatus}
          isSaving={isSaving}
          onSave={handleSave}
          setDirty={setIsDirty}
        />
      </div>

      <FloatingBar
        show={showFloatingBar}
        languages={languages}
        activeLang={activeLang}
        status={status}
        isDirty={isDirty}
        isSaving={isSaving}
        currentTitle={current.title}
        onChangeLang={(code) => {
          setActiveLang(code);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", code);
            window.history.replaceState(null, "", url.toString());
          }
        }}
        onSetStatus={(next) => {
          setIsDirty(true);
          setStatus(next);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
