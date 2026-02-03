"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/common/ToastProvider";
import { ApiError } from "@/lib/api/client";
import type { CmsCategory, CmsPost, CmsTag } from "@/types/api.types";
import {
  analyzeSeo,
  buildSchemaTemplate,
  type SchemaTemplateType,
} from "@/lib/seo/seoUtils";
import {
  createCmsCategory,
  createCmsTag,
  getCmsCategories,
  getCmsTags,
  getMediaLibrary,
  uploadMedia,
} from "@/lib/api/admin";
import { API_BASE_URL } from "@/lib/constants";
import type {
  CmsPostTranslationState,
  CmsPostTranslationsByLang,
  SeoAnalysis,
} from "@/components/admin/cms-post-form/types";
import CmsPostHeader from "@/components/admin/cms-post-form/sections/CmsPostHeader";
import PostContentSection from "@/components/admin/cms-post-form/sections/PostContentSection";
import TaxonomyPanel from "@/components/admin/cms-post-form/sections/TaxonomyPanel";
import ThumbnailPanel from "@/components/admin/cms-post-form/sections/ThumbnailPanel";
import SeoSchemaPanel from "@/components/admin/cms-post-form/sections/SeoSchemaPanel";
import MediaDialog from "@/components/admin/cms-post-form/sections/MediaDialog";
import CropDialog from "@/components/admin/cms-post-form/sections/CropDialog";
import CmsPostFloatingBar from "@/components/admin/cms-post-form/sections/CmsPostFloatingBar";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--ink-muted)]">
      Loading editor...
    </div>
  ),
});

export default function CmsPostForm({
  initial,
  langCode,
  onSave,
}: {
  initial?: CmsPost;
  langCode: string;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const languages = useMemo(() => ["vi", "en"] as const, []);
  const searchParams = useSearchParams();
  const queryLang = searchParams.get("lang");
  const initialLang = queryLang && languages.includes(queryLang as "vi" | "en") ? queryLang : langCode;
  const [activeLang, setActiveLang] = useState<string>(initialLang);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const [translations, setTranslations] = useState<CmsPostTranslationsByLang>(() => {
    const base: CmsPostTranslationsByLang = {};
    languages.forEach((code) => {
      base[code] = {
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
    });
    initial?.translations?.forEach((t) => {
      const rawCode = t.language?.code || langCode;
      const code = rawCode === "vn" ? "vi" : rawCode;
      if (!base[code]) return;
      base[code] = {
        title: t.title || "",
        slug: t.slug || "",
        excerpt: t.excerpt || "",
        content: typeof t.content === "string" ? t.content : JSON.stringify(t.content || ""),
        thumbnailUrl: t.thumbnailUrl ?? null,
        seoTitle: t.seoTitle || "",
        seoDescription: t.seoDescription || "",
        canonical: t.canonical || "",
        robots: t.robots || "index,follow",
        ogTitle: t.ogTitle || "",
        ogDescription: t.ogDescription || "",
        ogImage: t.ogImage || "",
        schemaJson: t.schemaJson ? JSON.stringify(t.schemaJson, null, 2) : "",
      };
    });
    return base;
  });

  const [slugEdited, setSlugEdited] = useState<Record<string, boolean>>(() => {
    const base: Record<string, boolean> = {};
    languages.forEach((code) => {
      const hasSlug =
        initial?.translations?.some((t) => {
          const rawCode = t.language?.code || langCode;
          const normalized = rawCode === "vn" ? "vi" : rawCode;
          return normalized === code && t.slug;
        }) ?? false;
      base[code] = hasSlug;
    });
    return base;
  });

  const existingLangs = useMemo(() => {
    const langs = new Set<string>();
    initial?.translations?.forEach((t) => {
      const raw = t.language?.code || langCode;
      langs.add(raw === "vn" ? "vi" : raw);
    });
    return langs;
  }, [initial, langCode]);

  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial?.status || "DRAFT");
  const [focusKeywordByLang, setFocusKeywordByLang] = useState<Record<string, string>>(() => ({
    vi: "",
    en: "",
  }));
  const [schemaTemplateByLang, setSchemaTemplateByLang] = useState<Record<string, SchemaTemplateType>>(() => ({
    vi: "Article",
    en: "Article",
  }));
  const [schemaOrgByLang, setSchemaOrgByLang] = useState<Record<string, string>>(() => ({
    vi: "Panda Spa",
    en: "Panda Spa",
  }));
  const [schemaFaqByLang, setSchemaFaqByLang] = useState<Record<string, { question: string; answer: string }[]>>(
    () => ({
      vi: [{ question: "", answer: "" }],
      en: [{ question: "", answer: "" }],
    })
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initial?.categories?.map((item) => item.id) || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initial?.tags?.map((item) => item.id) || []
  );
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");

  const normalizeMediaUrl = (url: string) =>
    url.startsWith(API_BASE_URL) ? url.replace(API_BASE_URL, "") : url;

  const [mediaQuery, setMediaQuery] = useState("");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"thumbnail" | "og">("thumbnail");

  const [thumbCropOpen, setThumbCropOpen] = useState(false);
  const [thumbCropSrc, setThumbCropSrc] = useState<string | null>(null);
  const [thumbCrop, setThumbCrop] = useState({ x: 0, y: 0 });
  const [thumbZoom, setThumbZoom] = useState(1);
  const thumbAreaRef = useRef<{ width: number; height: number; x: number; y: number } | null>(null);
  const thumbFileNameRef = useRef("thumbnail.jpg");

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  const storageKey = `cms-post-draft-${initial?.id ?? "new"}`;
  const toast = useToast();

  const categoriesQuery = useQuery({
    queryKey: ["cms-categories"],
    queryFn: () => getCmsCategories(undefined),
  });
  const tagsQuery = useQuery({
    queryKey: ["cms-tags"],
    queryFn: () => getCmsTags(undefined),
  });
  const mediaQueryResult = useQuery({
    queryKey: ["cms-media-library"],
    queryFn: () => getMediaLibrary(undefined, 1, 60),
  });

  const categories = (categoriesQuery.data?.data || []) as CmsCategory[];
  const tags = (tagsQuery.data?.data || []) as CmsTag[];
  const filteredCategories = useMemo(() => {
    const normalized = categoryQuery.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [categories, categoryQuery]);
  const filteredTags = useMemo(() => {
    const normalized = tagQuery.trim().toLowerCase();
    if (!normalized) return tags;
    return tags.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [tags, tagQuery]);

  const mediaItems = mediaQueryResult.data?.data?.items || [];
  const filteredMedia = useMemo(() => {
    const normalized = mediaQuery.trim().toLowerCase();
    if (!normalized) return mediaItems;
    return mediaItems.filter((item) => item.filename.toLowerCase().includes(normalized));
  }, [mediaItems, mediaQuery]);

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedBlob = useCallback(async (imageSrc: string) => {
    const area = thumbAreaRef.current;
    if (!area) return null;
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = area.width;
    canvas.height = area.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });
  }, []);

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

        const schemaJson = parseSchemaJson(translation.schemaJson);
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
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds,
        translations: payloadTranslations,
      });
      notify("Saved.", "success");
      setIsDirty(false);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(storageKey);
      }
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
    parseSchemaJson,
    selectedCategoryIds,
    selectedTagIds,
    status,
    storageKey,
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
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        translations: CmsPostTranslationsByLang;
        status: "DRAFT" | "PUBLISHED";
        activeLang: string;
      };
      if (parsed?.translations) {
        setTranslations(parsed.translations);
      }
      if (parsed?.status) {
        setStatus(parsed.status);
      }
      if (parsed?.activeLang && languages.includes(parsed.activeLang as "vi" | "en")) {
        setActiveLang(parsed.activeLang);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, languages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ translations, status, activeLang }));
  }, [translations, status, activeLang, isDirty, storageKey]);

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
  const siteBase = typeof window !== "undefined" ? window.location.origin : "";
  const serpUrl = current.canonical
    ? current.canonical
    : current.slug
    ? `${siteBase}/tin-tuc/${current.slug}`
    : siteBase || "https://example.com";

  const seoAnalysis = useMemo(
    () =>
      analyzeSeo({
        title: current.seoTitle || current.title,
        slug: current.slug,
        description: current.seoDescription || "",
        contentHtml: current.content,
        focusKeyword,
      }),
    [current.content, current.seoDescription, current.seoTitle, current.slug, current.title, focusKeyword]
  );

  const seoScore = Math.max(0, Math.min(100, seoAnalysis.score));
  const seoRadius = 26;
  const seoCircumference = 2 * Math.PI * seoRadius;
  const seoDashOffset = seoCircumference * (1 - seoScore / 100);

  const setCurrentTranslation = (patch: Partial<CmsPostTranslationState>) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], ...patch },
    }));
  };

  const seoAnalysisResult = seoAnalysis as SeoAnalysis;
  const handleSeoFieldChange = (patch: Partial<CmsPostTranslationState>) => {
    setIsDirty(true);
    setCurrentTranslation(patch);
  };
  const handleOpenMediaDialog = (target: "thumbnail" | "og") => {
    setMediaTarget(target);
    setMediaDialogOpen(true);
  };
  const handleSelectMedia = (url: string) => {
    const normalized = normalizeMediaUrl(url);
    if (mediaTarget === "thumbnail") {
      setCurrentTranslation({ thumbnailUrl: normalized });
    } else {
      setCurrentTranslation({ ogImage: normalized });
    }
    setMediaDialogOpen(false);
  };
  const handleThumbFileUpload = (file: File) => {
    thumbFileNameRef.current = file.name || "thumbnail.jpg";
    const reader = new FileReader();
    reader.onload = () => {
      setThumbCropSrc(reader.result as string);
      setThumbCrop({ x: 0, y: 0 });
      setThumbZoom(1);
      setThumbCropOpen(true);
    };
    reader.readAsDataURL(file);
  };
  const handleCreateCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const response = await createCmsCategory(undefined, { name });
      const id = response?.data?.id;
      if (id) {
        setSelectedCategoryIds((prev) => Array.from(new Set([...prev, id])));
        setNewCategory("");
        categoriesQuery.refetch();
      }
    } catch (err) {
      handleError(err);
    }
  };
  const handleCreateCategoryKey = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await handleCreateCategory();
  };
  const handleCreateTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    try {
      const response = await createCmsTag(undefined, { name });
      const id = response?.data?.id;
      if (id) {
        setSelectedTagIds((prev) => Array.from(new Set([...prev, id])));
        setNewTag("");
        tagsQuery.refetch();
      }
    } catch (err) {
      handleError(err);
    }
  };
  const handleCreateTagKey = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await handleCreateTag();
  };

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <CmsPostHeader
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
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <PostContentSection
          current={current}
          status={status}
          isSaving={isSaving}
          slugEdited={slugEdited[activeLang]}
          onTitleChange={(value) => {
            setIsDirty(true);
            setTranslations((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], title: value },
            }));
            if (!slugEdited[activeLang]) {
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], slug: slugify(value) },
              }));
            }
          }}
          onSlugChange={(value) => {
            setIsDirty(true);
            setSlugEdited((prev) => ({ ...prev, [activeLang]: true }));
            setTranslations((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], slug: value },
            }));
          }}
          onExcerptChange={(value) => {
            setIsDirty(true);
            setTranslations((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], excerpt: value },
            }));
          }}
          onContentChange={(value) => {
            setIsDirty(true);
            setTranslations((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], content: value },
            }));
          }}
          onStatusChange={(value) => {
            setIsDirty(true);
            setStatus(value);
          }}
          onSave={handleSave}
          editor={
            <RichTextEditor
              value={current.content}
              onChange={(value) => {
                setIsDirty(true);
                setTranslations((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], content: value },
                }));
              }}
            />
          }
        />
        <aside className="space-y-4">
          <TaxonomyPanel
            categories={categories}
            tags={tags}
            selectedCategoryIds={selectedCategoryIds}
            selectedTagIds={selectedTagIds}
            filteredCategories={filteredCategories}
            filteredTags={filteredTags}
            newCategory={newCategory}
            newTag={newTag}
            categoryQuery={categoryQuery}
            tagQuery={tagQuery}
            setCategoryQuery={setCategoryQuery}
            setTagQuery={setTagQuery}
            setNewCategory={setNewCategory}
            setNewTag={setNewTag}
            onToggleCategory={(id) => {
              setSelectedCategoryIds((prev) =>
                prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
              );
            }}
            onToggleTag={(id) => {
              setSelectedTagIds((prev) =>
                prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
              );
            }}
            onCreateCategory={handleCreateCategory}
            onCreateTag={handleCreateTag}
            onCreateCategoryKey={handleCreateCategoryKey}
            onCreateTagKey={handleCreateTagKey}
          />
          <ThumbnailPanel
            thumbnailUrl={current.thumbnailUrl}
            onOpenMediaDialog={() => handleOpenMediaDialog("thumbnail")}
            onUploadFile={handleThumbFileUpload}
            onClearThumbnail={() => setCurrentTranslation({ thumbnailUrl: null })}
          />
          <SeoSchemaPanel
            current={current}
            focusKeyword={focusKeyword}
            seoAnalysis={seoAnalysisResult}
            seoScore={seoScore}
            seoRadius={seoRadius}
            seoCircumference={seoCircumference}
            seoDashOffset={seoDashOffset}
            serpUrl={serpUrl}
            schemaTemplate={schemaTemplate}
            schemaOrg={schemaOrg}
            schemaFaqItems={schemaFaqItems}
            onFocusKeywordChange={(value) =>
              setFocusKeywordByLang((prev) => ({ ...prev, [activeLang]: value }))
            }
            onSeoFieldChange={handleSeoFieldChange}
            onOpenMediaPicker={() => handleOpenMediaDialog("og")}
            onClearOgImage={() => handleSeoFieldChange({ ogImage: "" })}
            onSchemaTemplateChange={(value) => {
              setIsDirty(true);
              setSchemaTemplateByLang((prev) => ({ ...prev, [activeLang]: value }));
            }}
            onSchemaOrgChange={(value) => {
              setIsDirty(true);
              setSchemaOrgByLang((prev) => ({ ...prev, [activeLang]: value }));
            }}
            onSchemaFaqItemsChange={(next) => {
              setIsDirty(true);
              setSchemaFaqByLang((prev) => ({ ...prev, [activeLang]: next }));
            }}
            onApplySchema={() => {
              const schema = buildSchemaTemplate({
                type: schemaTemplate,
                title: current.seoTitle || current.title,
                description: current.seoDescription || current.excerpt || "",
                url: serpUrl,
                image: current.ogImage || current.thumbnailUrl || "",
                organization: schemaOrg,
                faqItems: schemaFaqItems,
              });
              setIsDirty(true);
              setCurrentTranslation({ schemaJson: JSON.stringify(schema, null, 2) });
            }}
            onSchemaJsonChange={(value) => {
              setIsDirty(true);
              setCurrentTranslation({ schemaJson: value });
            }}
          />
        </aside>
      </div>
      <MediaDialog
        open={mediaDialogOpen}
        mediaQuery={mediaQuery}
        mediaItems={filteredMedia}
        onOpenChange={setMediaDialogOpen}
        onQueryChange={setMediaQuery}
        onSelect={handleSelectMedia}
      />
      <CmsPostFloatingBar
        show={showFloatingBar}
        activeLang={activeLang}
        status={status}
        isDirty={isDirty}
        currentTitle={current.title}
        languages={languages}
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
        isSaving={isSaving}
      />
      <CropDialog
        open={thumbCropOpen}
        imageSrc={thumbCropSrc}
        crop={thumbCrop}
        zoom={thumbZoom}
        onCropChange={setThumbCrop}
        onZoomChange={setThumbZoom}
        onCropComplete={(areaPixels) => {
          thumbAreaRef.current = areaPixels;
        }}
        onCancel={() => {
          setThumbCropOpen(false);
          setThumbCropSrc(null);
        }}
        onSave={async () => {
          if (!thumbCropSrc) return;
          try {
            const blob = await getCroppedBlob(thumbCropSrc);
            if (!blob) throw new Error("Crop failed");
            const mimeType = blob.type || "application/octet-stream";
            const response = await uploadMedia(
              new File([blob], thumbFileNameRef.current, { type: mimeType })
            );
            const url = response?.data?.url;
            if (url) {
              setCurrentTranslation({ thumbnailUrl: normalizeMediaUrl(url) });
            }
            setThumbCropOpen(false);
            setThumbCropSrc(null);
          } catch (err) {
            handleError(err);
            setThumbCropOpen(false);
            setThumbCropSrc(null);
          }
        }}
      />
    </div>
  );
}
