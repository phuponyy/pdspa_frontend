"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import { useToast } from "@/components/common/ToastProvider";
import type { CmsCategory, CmsPost, CmsTag } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  analyzeSeo,
  buildSchemaTemplate,
  generateSeoFromContent,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/constants";
import Cropper from "react-easy-crop";
import FocusTrap from "@/components/common/FocusTrap";

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
  const languages = useMemo(() => ["vi", "en"], []);
  const searchParams = useSearchParams();
  const initialLang =
    searchParams.get("lang") && languages.includes(searchParams.get("lang") || "")
      ? (searchParams.get("lang") as string)
      : langCode;
  const [activeLang, setActiveLang] = useState(initialLang);
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const [translations, setTranslations] = useState<
    Record<
      string,
      {
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
        schemaJson?: string;
      }
    >
  >(() => {
    const base: Record<
      string,
      {
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
        schemaJson?: string;
      }
    > = {};
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
        content:
          typeof t.content === "string"
            ? t.content
            : JSON.stringify(t.content || ""),
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
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status || "DRAFT"
  );
  const [focusKeywordByLang, setFocusKeywordByLang] = useState<Record<string, string>>(
    () => ({
      vi: "",
      en: "",
    })
  );
  const [schemaTemplateByLang, setSchemaTemplateByLang] = useState<
    Record<string, SchemaTemplateType>
  >(() => ({
    vi: "Article",
    en: "Article",
  }));
  const [schemaOrgByLang, setSchemaOrgByLang] = useState<Record<string, string>>(
    () => ({
      vi: "Panda Spa",
      en: "Panda Spa",
    })
  );
  const [schemaFaqByLang, setSchemaFaqByLang] = useState<
    Record<string, { question: string; answer: string }[]>
  >(() => ({
    vi: [{ question: "", answer: "" }],
    en: [{ question: "", answer: "" }],
  }));
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
  const resolveMediaUrl = (url: string) =>
    url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const [mediaQuery, setMediaQuery] = useState("");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"thumbnail" | "og">("thumbnail");
  const [thumbCropOpen, setThumbCropOpen] = useState(false);
  const [thumbCropSrc, setThumbCropSrc] = useState<string | null>(null);
  const [thumbCrop, setThumbCrop] = useState({ x: 0, y: 0 });
  const [thumbZoom, setThumbZoom] = useState(1);
  const thumbAreaRef = useRef<{ width: number; height: number; x: number; y: number } | null>(
    null
  );
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
    return categories.filter((item) =>
      item.name.toLowerCase().includes(normalized)
    );
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
    return mediaItems.filter((item) =>
      item.filename.toLowerCase().includes(normalized)
    );
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
    ctx.drawImage(
      image,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      area.width,
      area.height
    );
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
        translations: typeof translations;
        status: "DRAFT" | "PUBLISHED";
        activeLang: string;
      };
      if (parsed?.translations) {
        setTranslations(parsed.translations);
      }
      if (parsed?.status) {
        setStatus(parsed.status);
      }
      if (parsed?.activeLang && languages.includes(parsed.activeLang)) {
        setActiveLang(parsed.activeLang);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, languages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ translations, status, activeLang })
    );
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
  const siteBase =
    typeof window !== "undefined" ? window.location.origin : "";
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
    [
      current.content,
      current.seoDescription,
      current.seoTitle,
      current.slug,
      current.title,
      focusKeyword,
    ]
  );
  const seoScore = Math.max(0, Math.min(100, seoAnalysis.score));
  const seoRadius = 26;
  const seoCircumference = 2 * Math.PI * seoRadius;
  const seoDashOffset = seoCircumference * (1 - seoScore / 100);

  const setCurrentTranslation = (patch: Partial<typeof current>) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], ...patch },
    }));
  };

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {languages.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setActiveLang(code);
                if (typeof window !== "undefined") {
                  const url = new URL(window.location.href);
                  url.searchParams.set("lang", code);
                  window.history.replaceState(null, "", url.toString());
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                activeLang === code
                  ? "bg-[var(--accent-strong)] text-white"
                  : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        {activeLang !== langCode ? (
          <Button
            variant="outline"
            onClick={() => {
              const primary = translations[langCode];
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...primary },
              }));
            }}
          >
            Clone from {langCode.toUpperCase()}
          </Button>
        ) : null}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="self-start rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <div className="grid gap-4">
          <Input
            label="Title"
            value={current.title}
            onChange={(event) => {
              setIsDirty(true);
              const nextTitle = event.target.value;
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], title: nextTitle },
              }));
              if (!slugEdited[activeLang]) {
                setTranslations((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], slug: slugify(nextTitle) },
                }));
              }
            }}
          />
          <Input
            label="Slug"
            value={current.slug}
            onChange={(event) => {
              setIsDirty(true);
              setSlugEdited((prev) => ({ ...prev, [activeLang]: true }));
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], slug: event.target.value },
              }));
            }}
          />
          <Textarea
            label="Excerpt"
            value={current.excerpt}
            onChange={(event) => {
              setIsDirty(true);
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], excerpt: event.target.value },
              }));
            }}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--ink)]">
              Content
            </p>
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
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
              value={status}
              onChange={(event) => {
                setIsDirty(true);
                setStatus(event.target.value as "DRAFT" | "PUBLISHED");
              }}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Danh mục
              </p>
              <span className="text-xs text-[var(--ink-muted)]">
                {selectedCategoryIds.length} đã chọn
              </span>
            </div>
            <div className="mt-2">
              <Input
                label="Tìm danh mục"
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
              />
            </div>
            <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-auto">
              {filteredCategories.length ? (
                filteredCategories.map((category) => {
                  const active = selectedCategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryIds((prev) =>
                          active
                            ? prev.filter((id) => id !== category.id)
                            : [...prev, category.id]
                        )
                      }
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                        active
                          ? "bg-[var(--accent-strong)] text-white"
                          : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-[var(--ink-muted)]">Không có danh mục phù hợp.</p>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                label="Thêm danh mục mới"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                onKeyDown={async (event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
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
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
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
                }}
              >
                Thêm
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Thẻ
              </p>
              <span className="text-xs text-[var(--ink-muted)]">
                {selectedTagIds.length} đã chọn
              </span>
            </div>
            <div className="mt-2">
              <Input
                label="Tìm thẻ"
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
              />
            </div>
            <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-auto">
              {filteredTags.length ? (
                filteredTags.map((tag) => {
                  const active = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTagIds((prev) =>
                          active
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                        active
                          ? "bg-[var(--accent-strong)] text-white"
                          : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-[var(--ink-muted)]">Không có thẻ phù hợp.</p>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                label="Thêm thẻ mới"
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={async (event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
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
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
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
                }}
              >
                Thêm
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Thumbnail
              </p>
              <span className="text-[10px] text-[var(--ink-muted)]">
                Ảnh đại diện
              </span>
            </div>
            <div
              className="mt-3 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--mist)]"
              style={{ aspectRatio: "1 / 1" }}
            >
              {current.thumbnailUrl ? (
                <img
                  src={
                    current.thumbnailUrl.startsWith("/")
                      ? `${API_BASE_URL}${current.thumbnailUrl}`
                      : current.thumbnailUrl
                  }
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--ink-muted)]">
                  Chưa có ảnh
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaTarget("thumbnail")}
                  >
                    Chọn từ Media
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Chọn ảnh</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      label="Tìm ảnh"
                      value={mediaQuery}
                      onChange={(event) => setMediaQuery(event.target.value)}
                    />
                    <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-auto md:grid-cols-3">
                      {filteredMedia.length ? (
                        filteredMedia.map((item) => {
                          const url = item.url;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                if (mediaTarget === "thumbnail") {
                                  setCurrentTranslation({
                                    thumbnailUrl: normalizeMediaUrl(url),
                                  });
                                } else {
                                  setCurrentTranslation({
                                    ogImage: normalizeMediaUrl(url),
                                  });
                                }
                                setMediaDialogOpen(false);
                              }}
                              className="group overflow-hidden rounded-xl border border-[var(--line)] bg-white"
                            >
                              <img
                                src={resolveMediaUrl(url)}
                                alt={item.filename}
                                className="h-28 w-full object-cover"
                              />
                              <div className="p-2 text-left text-[10px] text-[var(--ink-muted)]">
                                {item.filename}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-[var(--ink-muted)]">Không có ảnh phù hợp.</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <label className="inline-flex cursor-pointer items-center rounded-full border border-[var(--line)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Upload ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const inputEl = event.currentTarget;
                    const file = inputEl.files?.[0];
                    if (!file) return;
                    inputEl.value = "";
                    thumbFileNameRef.current = file.name || "thumbnail.jpg";
                    const reader = new FileReader();
                    reader.onload = () => {
                      setThumbCropSrc(reader.result as string);
                      setThumbCrop({ x: 0, y: 0 });
                      setThumbZoom(1);
                      setThumbCropOpen(true);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {current.thumbnailUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTranslation({ thumbnailUrl: null })}
                >
                  Xoá
                </Button>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                SEO & Schema
              </p>
              <span className="text-[10px] text-[var(--ink-muted)]">
                RankMath style
              </span>
            </div>
            <div className="mt-3 space-y-4">
              <div className="grid gap-3">
                <Input
                  label="Focus keyword"
                  value={focusKeyword}
                  onChange={(event) =>
                    setFocusKeywordByLang((prev) => ({
                      ...prev,
                      [activeLang]: event.target.value,
                    }))
                  }
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const generated = generateSeoFromContent({
                        title: current.title,
                        excerpt: current.excerpt,
                        contentHtml: current.content,
                      });
                      setIsDirty(true);
                      setCurrentTranslation({
                        seoTitle: generated.seoTitle,
                        seoDescription: generated.seoDescription,
                        ogTitle: generated.ogTitle,
                        ogDescription: generated.ogDescription,
                      });
                    }}
                  >
                    Auto generate SEO
                  </Button>
                  <span className="text-[10px] text-[var(--ink-muted)]">
                    Tự động lấy từ nội dung
                  </span>
                </div>
                <Input
                  label="SEO Title"
                  value={current.seoTitle}
                  onChange={(event) => {
                    setIsDirty(true);
                    setCurrentTranslation({ seoTitle: event.target.value });
                  }}
                />
                <Textarea
                  label="SEO Description"
                  value={current.seoDescription}
                  onChange={(event) => {
                    setIsDirty(true);
                    setCurrentTranslation({ seoDescription: event.target.value });
                  }}
                  className="min-h-[90px]"
                />
                <Input
                  label="Canonical URL"
                  value={current.canonical}
                  onChange={(event) => {
                    setIsDirty(true);
                    setCurrentTranslation({ canonical: event.target.value });
                  }}
                />
                <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
                  Robots
                  <select
                    className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                    value={current.robots || "index,follow"}
                    onChange={(event) => {
                      setIsDirty(true);
                      setCurrentTranslation({ robots: event.target.value });
                    }}
                  >
                    <option value="index,follow">index,follow</option>
                    <option value="noindex,follow">noindex,follow</option>
                    <option value="noindex,nofollow">noindex,nofollow</option>
                  </select>
                </label>
                <Input
                  label="OG Title"
                  value={current.ogTitle}
                  onChange={(event) => {
                    setIsDirty(true);
                    setCurrentTranslation({ ogTitle: event.target.value });
                  }}
                />
                <Textarea
                  label="OG Description"
                  value={current.ogDescription}
                  onChange={(event) => {
                    setIsDirty(true);
                    setCurrentTranslation({ ogDescription: event.target.value });
                  }}
                  className="min-h-[90px]"
                />
                <div className="space-y-2">
                  <Input
                    label="OG Image"
                    value={current.ogImage}
                    onChange={(event) => {
                      setIsDirty(true);
                      setCurrentTranslation({ ogImage: event.target.value });
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMediaTarget("og");
                        setMediaDialogOpen(true);
                      }}
                    >
                      Chọn từ Media
                    </Button>
                    {current.ogImage ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTranslation({ ogImage: "" })}
                      >
                        Xoá
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0f1722] p-4 text-white seo-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      SEO Score
                    </p>
                    <p className="text-sm text-white/70">Phân tích realtime</p>
                  </div>
                  <div className="seo-score-ring">
                    <svg width="64" height="64">
                      <circle
                        className="ring-track"
                        cx="32"
                        cy="32"
                        r={seoRadius}
                        fill="none"
                        strokeWidth="6"
                      />
                      <circle
                        className="ring-progress"
                        cx="32"
                        cy="32"
                        r={seoRadius}
                        fill="none"
                        strokeWidth="6"
                        strokeDasharray={seoCircumference}
                        strokeDashoffset={seoDashOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="seo-score-value">{seoScore}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {seoAnalysis.checks.map((check, index) => (
                    <div
                      key={check.label}
                      className="flex items-center gap-2 seo-checklist-item"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          check.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {check.ok ? "✓" : "!"}
                      </span>
                      <span className="text-white/80">{check.label}</span>
                      {check.hint ? (
                        <span className="ml-auto text-[10px] text-white/40">{check.hint}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                  SERP Preview
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-[#1a73e8]">
                    {current.seoTitle || current.title || "SEO title"}
                  </p>
                  <p className="text-xs text-emerald-700">
                    {serpUrl}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {current.seoDescription || "Meta description sẽ hiển thị ở đây."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white p-4 seo-panel">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                  Schema Builder
                </p>
                <div className="mt-3 grid gap-3">
                  <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
                    Template
                    <select
                      className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                      value={schemaTemplate}
                      onChange={(event) =>
                        setSchemaTemplateByLang((prev) => ({
                          ...prev,
                          [activeLang]: event.target.value as SchemaTemplateType,
                        }))
                      }
                    >
                      <option value="Article">Article</option>
                      <option value="FAQPage">FAQPage</option>
                      <option value="LocalBusiness">LocalBusiness</option>
                      <option value="Service">Service</option>
                      <option value="WebPage">WebPage</option>
                    </select>
                  </label>
                  <Input
                    label="Organization"
                    value={schemaOrg}
                    onChange={(event) =>
                      setSchemaOrgByLang((prev) => ({
                        ...prev,
                        [activeLang]: event.target.value,
                      }))
                    }
                  />
                  {schemaTemplate === "FAQPage" ? (
                    <div className="space-y-2">
                      {schemaFaqItems.map((item, index) => (
                        <div key={`faq-${index}`} className="grid gap-2 rounded-xl border border-[var(--line)] p-2">
                          <Input
                            label={`Question ${index + 1}`}
                            value={item.question}
                            onChange={(event) => {
                              const next = [...schemaFaqItems];
                              next[index] = { ...next[index], question: event.target.value };
                              setSchemaFaqByLang((prev) => ({
                                ...prev,
                                [activeLang]: next,
                              }));
                            }}
                          />
                          <Textarea
                            label="Answer"
                            value={item.answer}
                            onChange={(event) => {
                              const next = [...schemaFaqItems];
                              next[index] = { ...next[index], answer: event.target.value };
                              setSchemaFaqByLang((prev) => ({
                                ...prev,
                                [activeLang]: next,
                              }));
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSchemaFaqByLang((prev) => ({
                            ...prev,
                            [activeLang]: [...schemaFaqItems, { question: "", answer: "" }],
                          }))
                        }
                      >
                        Thêm câu hỏi
                      </Button>
                    </div>
                  ) : null}
                  <div className="rounded-xl border border-[var(--line)] bg-[#0f1722] p-3 text-xs text-white/80">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(
                        buildSchemaTemplate({
                          type: schemaTemplate,
                          title: current.seoTitle || current.title,
                          description: current.seoDescription || current.excerpt || "",
                          url: serpUrl,
                          image: current.ogImage || current.thumbnailUrl || "",
                          organization: schemaOrg,
                          faqItems: schemaFaqItems,
                        }),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
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
                      setCurrentTranslation({
                        schemaJson: JSON.stringify(schema, null, 2),
                      });
                    }}
                  >
                    Áp dụng schema
                  </Button>
                  <Textarea
                    label="Schema JSON (có thể chỉnh sửa)"
                    value={current.schemaJson || ""}
                    onChange={(event) => {
                      setIsDirty(true);
                      setCurrentTranslation({ schemaJson: event.target.value });
                    }}
                    className="min-h-[160px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div
        className={`fixed bottom-6 left-1/2 z-[120] w-[92vw] max-w-5xl -translate-x-1/2 transition-all duration-300 ${
          showFloatingBar
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[#0f1722]/95 px-5 py-3 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
              {activeLang.toUpperCase()} · {status === "PUBLISHED" ? "Published" : "Draft"}
            </p>
            <p className="truncate text-sm font-semibold text-white">
              {current.title || "Untitled post"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              {languages.map((code) => (
                <button
                  key={`float-lang-${code}`}
                  type="button"
                  onClick={() => {
                    setActiveLang(code);
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href);
                      url.searchParams.set("lang", code);
                      window.history.replaceState(null, "", url.toString());
                    }
                  }}
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    activeLang === code
                      ? "bg-[#ff9f40] text-[#1a1410]"
                      : "border border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
              <button
                type="button"
                onClick={() => {
                  setIsDirty(true);
                  setStatus("DRAFT");
                }}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  status === "DRAFT"
                    ? "bg-white text-[#0f1722]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDirty(true);
                  setStatus("PUBLISHED");
                }}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  status === "PUBLISHED"
                    ? "bg-[#ff9f40] text-[#1a1410]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Publish
              </button>
            </div>
            {isDirty ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                Unsaved
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                Saved
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
      {thumbCropOpen && thumbCropSrc ? (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 p-6">
          <FocusTrap active={thumbCropOpen}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Crop thumbnail"
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f1722] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            >
            <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Crop thumbnail (1:1)
            </div>
            <div className="relative h-[420px] w-full bg-black">
              <Cropper
                image={thumbCropSrc}
                crop={thumbCrop}
                zoom={thumbZoom}
                aspect={1}
                onCropChange={setThumbCrop}
                onZoomChange={setThumbZoom}
                onCropComplete={(_, croppedAreaPixels) => {
                  thumbAreaRef.current = croppedAreaPixels;
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <label className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={thumbZoom}
                  onChange={(event) => setThumbZoom(Number(event.target.value))}
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setThumbCropOpen(false);
                    setThumbCropSrc(null);
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
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
                        setCurrentTranslation({
                          thumbnailUrl: normalizeMediaUrl(url),
                        });
                      }
                      setThumbCropOpen(false);
                      setThumbCropSrc(null);
                    } catch (err) {
                      handleError(err);
                      setThumbCropOpen(false);
                      setThumbCropSrc(null);
                    }
                  }}
                  className="rounded-full bg-[#ff9f40] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1410]"
                >
                  Crop & save
                </button>
              </div>
            </div>
            </div>
          </FocusTrap>
        </div>
      ) : null}
    </div>
  );
}
