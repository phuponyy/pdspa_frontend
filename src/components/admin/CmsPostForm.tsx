"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/common/ToastProvider";
import { ApiError } from "@/lib/api/client";
import type { CmsPost } from "@/types/api.types";
import { buildSchemaTemplate, type SchemaTemplateType } from "@/lib/seo/seoUtils";
import type {
  CmsPostTranslationState,
  CmsPostTranslationsByLang,
} from "@/components/admin/cms-post-form/types";
import CmsPostFormView from "@/components/admin/cms-post-form/CmsPostFormView";
import { slugify } from "@/components/admin/cms-post-form/utils/slug";
import {
  buildInitialTranslations,
  buildSlugEditedMap,
  getExistingLangs,
} from "@/components/admin/cms-post-form/utils/translation";
import { parseSchemaJson } from "@/components/admin/cms-post-form/utils/schema";
import { useCmsPostDraft } from "@/components/admin/cms-post-form/hooks/useCmsPostDraft";
import { useCmsPostTaxonomy } from "@/components/admin/cms-post-form/hooks/useCmsPostTaxonomy";
import { useCmsPostMedia } from "@/components/admin/cms-post-form/hooks/useCmsPostMedia";
import { useCmsPostSeo } from "@/components/admin/cms-post-form/hooks/useCmsPostSeo";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--ink-muted)]">
      Loading editor...
    </div>
  ),
});

const languages = ["vi", "en"] as const;

export default function CmsPostForm({
  initial,
  langCode,
  onSave,
}: {
  initial?: CmsPost;
  langCode: string;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const queryLang = searchParams.get("lang");
  const initialLang =
    queryLang && languages.includes(queryLang as "vi" | "en")
      ? (queryLang as "vi" | "en")
      : (langCode as "vi" | "en");
  const [activeLang, setActiveLang] = useState<"vi" | "en">(initialLang);
  const [translations, setTranslations] = useState<CmsPostTranslationsByLang>(() =>
    buildInitialTranslations(initial, langCode, languages)
  );
  const [slugEdited, setSlugEdited] = useState<Record<string, boolean>>(() =>
    buildSlugEditedMap(initial, langCode, languages)
  );
  const existingLangs = useMemo(() => getExistingLangs(initial, langCode), [initial, langCode]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial?.status || "DRAFT");
  const [focusKeywordByLang, setFocusKeywordByLang] = useState<Record<string, string>>(() => ({ vi: "", en: "" }));
  const [schemaTemplateByLang, setSchemaTemplateByLang] = useState<Record<string, SchemaTemplateType>>(() => ({ vi: "Article", en: "Article" }));
  const [schemaOrgByLang, setSchemaOrgByLang] = useState<Record<string, string>>(() => ({ vi: "Panda Spa", en: "Panda Spa" }));
  const [schemaFaqByLang, setSchemaFaqByLang] = useState<Record<string, { question: string; answer: string }[]>>(() => ({ vi: [{ question: "", answer: "" }], en: [{ question: "", answer: "" }] }));
  const storageKey = `cms-post-draft-${initial?.id ?? "new"}`;
  const [isSaving, setIsSaving] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const toast = useToast();
  const { isDirty, setIsDirty, loadedDraft, applyDraft, persistDraft, clearDraft } = useCmsPostDraft(
    storageKey,
    languages
  );
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
  const setCurrentTranslation = useCallback(
    (patch: Partial<CmsPostTranslationState>) => {
      setIsDirty(true);
      setTranslations((prev) => ({
        ...prev,
        [activeLang]: { ...prev[activeLang], ...patch },
      }));
    },
    [activeLang, setIsDirty]
  );
  const taxonomy = useCmsPostTaxonomy({
    initialCategoryIds: initial?.categories?.map((item) => item.id) || [],
    initialTagIds: initial?.tags?.map((item) => item.id) || [],
    handleError,
  });
  const media = useCmsPostMedia({ onUpdateTranslation: setCurrentTranslation });
  const handleChangeLang = useCallback(
    (code: string) => {
      if (!languages.includes(code as "vi" | "en")) return;
      const nextCode = code as "vi" | "en";
      setActiveLang(nextCode);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", nextCode);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [setActiveLang]
  );

  const handleCloneFromPrimary = useCallback(() => {
    const primary = translations[langCode];
    setIsDirty(true);
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: { ...primary },
    }));
  }, [activeLang, langCode, setIsDirty, translations]);

  const handleTitleChange = useCallback(
    (value: string) => {
      setIsDirty(true);
      setTranslations((prev) => {
        const next = { ...prev[activeLang], title: value };
        if (!slugEdited[activeLang]) {
          next.slug = slugify(value);
        }
        return { ...prev, [activeLang]: next };
      });
    },
    [activeLang, setIsDirty, slugEdited]
  );
  const handleSlugChange = useCallback(
    (value: string) => {
      setIsDirty(true);
      setSlugEdited((prev) => ({ ...prev, [activeLang]: true }));
      setTranslations((prev) => ({
        ...prev,
        [activeLang]: { ...prev[activeLang], slug: value },
      }));
    },
    [activeLang, setIsDirty]
  );
  const handleExcerptChange = useCallback(
    (value: string) => {
      setCurrentTranslation({ excerpt: value });
    },
    [setCurrentTranslation]
  );
  const handleContentChange = useCallback(
    (value: string) => {
      setCurrentTranslation({ content: value });
    },
    [setCurrentTranslation]
  );

  const handleStatusChange = useCallback(
    (value: "DRAFT" | "PUBLISHED") => {
      setIsDirty(true);
      setStatus(value);
    },
    [setIsDirty]
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const payloadTranslations: {
        langCode: string;
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        thumbnailUrl?: string | null;
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
          translation.excerpt,
          translation.content,
          translation.seoTitle,
          translation.seoDescription,
          translation.canonical,
          translation.robots,
          translation.ogTitle,
          translation.ogDescription,
          translation.ogImage,
          translation.schemaJson,
          translation.thumbnailUrl ?? "",
        ].some((value) => String(value || "").trim().length > 0);
        if (!hasContent && !existingLangs.has(code)) continue;

        const schemaJson = parseSchemaJson(translation.schemaJson, notify);
        if (schemaJson === null) return;

        payloadTranslations.push({
          langCode: code,
          title: translation.title,
          slug: translation.slug,
          excerpt: translation.excerpt,
          content: translation.content,
          thumbnailUrl: translation.thumbnailUrl,
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
        categoryIds: taxonomy.selectedCategoryIds,
        tagIds: taxonomy.selectedTagIds,
        translations: payloadTranslations,
      });
      notify("Saved.", "success");
      setIsDirty(false);
      clearDraft();
    } catch (err) {
      handleError(err);
    } finally {
      setIsSaving(false);
    }
  }, [
    existingLangs,
    handleError,
    isSaving,
    languages,
    notify,
    onSave,
    clearDraft,
    taxonomy.selectedCategoryIds,
    taxonomy.selectedTagIds,
    status,
    translations,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.get("lang")) {
      url.searchParams.set("lang", activeLang);
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeLang]);

  useEffect(() => {
    if (!loadedDraft) return;
    applyDraft(setTranslations, setStatus, (value) => {
      if (languages.includes(value as "vi" | "en")) {
        setActiveLang(value as "vi" | "en");
      }
    });
  }, [loadedDraft, applyDraft]);

  useEffect(() => {
    persistDraft(translations, status, activeLang);
  }, [translations, status, activeLang, isDirty, persistDraft]);

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
    excerpt: "",
    content: "",
    thumbnailUrl: null,
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
  const schemaTemplate = schemaTemplateByLang[activeLang] || "Article";
  const schemaOrg = schemaOrgByLang[activeLang] || "";
  const schemaFaqItems = schemaFaqByLang[activeLang] || [];

  const seoMetrics = useCmsPostSeo({ current, focusKeyword });
  const handleApplySchema = () => {
    const schema = buildSchemaTemplate({
      type: schemaTemplate,
      title: current.seoTitle || current.title,
      description: current.seoDescription || current.excerpt || "",
      url: seoMetrics.serpUrl,
      image: current.ogImage || current.thumbnailUrl || "",
      organization: schemaOrg,
      faqItems: schemaFaqItems,
    });
    setCurrentTranslation({ schemaJson: JSON.stringify(schema, null, 2) });
  };

  return (
    <CmsPostFormView
      headerRef={headerRef}
      header={{
        languages,
        activeLang,
        langCode,
        onChangeLang: handleChangeLang,
        onCloneFromPrimary: handleCloneFromPrimary,
      }}
      content={{
        current,
        status,
        isSaving,
        slugEdited: slugEdited[activeLang],
        onTitleChange: handleTitleChange,
        onSlugChange: handleSlugChange,
        onExcerptChange: handleExcerptChange,
        onContentChange: handleContentChange,
        onStatusChange: handleStatusChange,
        onSave: handleSave,
        editor: (
          <RichTextEditor
            value={current.content}
            onChange={(value) => handleContentChange(value)}
          />
        ),
      }}
      taxonomy={taxonomy}
      thumbnail={{
        thumbnailUrl: current.thumbnailUrl,
        onOpenMediaDialog: () => media.openMediaDialog("thumbnail"),
        onClearThumbnail: () => setCurrentTranslation({ thumbnailUrl: null }),
      }}
      seo={{
        current,
        focusKeyword,
        metrics: seoMetrics,
        schemaTemplate,
        schemaOrg,
        schemaFaqItems,
        onFocusKeywordChange: (value) =>
          setFocusKeywordByLang((prev) => ({ ...prev, [activeLang]: value })),
        onSeoFieldChange: setCurrentTranslation,
        onOpenMediaPicker: () => media.openMediaDialog("og"),
        onClearOgImage: () => setCurrentTranslation({ ogImage: "" }),
        onSchemaTemplateChange: (value) => {
          setIsDirty(true);
          setSchemaTemplateByLang((prev) => ({ ...prev, [activeLang]: value }));
        },
        onSchemaOrgChange: (value) => {
          setIsDirty(true);
          setSchemaOrgByLang((prev) => ({ ...prev, [activeLang]: value }));
        },
        onSchemaFaqItemsChange: (next) => {
          setIsDirty(true);
          setSchemaFaqByLang((prev) => ({ ...prev, [activeLang]: next }));
        },
        onApplySchema: handleApplySchema,
        onSchemaJsonChange: (value) => setCurrentTranslation({ schemaJson: value }),
      }}
      media={media}
      floatingBar={{
        show: showFloatingBar,
        activeLang,
        status,
        isDirty,
        currentTitle: current.title,
        languages,
        onChangeLang: handleChangeLang,
        onSetStatus: handleStatusChange,
        onSave: handleSave,
        isSaving,
      }}
    />
  );
}
