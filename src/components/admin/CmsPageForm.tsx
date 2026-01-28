"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Textarea from "@/components/common/Textarea";
import { useToast } from "@/components/common/ToastProvider";
import type { CmsPage } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";
import {
  analyzeSeo,
  buildSchemaTemplate,
  generateSeoFromContent,
  type SchemaTemplateType,
} from "@/lib/seo/seoUtils";

export default function CmsPageForm({
  initial,
  langCode,
  onSave,
}: {
  initial?: CmsPage;
  langCode: string;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  const languages = useMemo(() => ["vi", "en"], []);
  const searchParams = useSearchParams();
  const initialLang =
    searchParams.get("lang") && languages.includes(searchParams.get("lang") || "")
      ? (searchParams.get("lang") as string)
      : langCode;
  const [activeLang, setActiveLang] = useState(initialLang);
  const [translations, setTranslations] = useState<
    Record<
      string,
      {
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
        schemaJson?: string;
      }
    >
  >(() => {
    const base: Record<
      string,
      {
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
        schemaJson?: string;
      }
    > = {};
    languages.forEach((code) => {
      base[code] = {
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
    });
    initial?.translations?.forEach((t) => {
      const rawCode = t.language?.code || langCode;
      const code = rawCode === "vn" ? "vi" : rawCode;
      if (!base[code]) return;
      base[code] = {
        title: t.title || "",
        slug: t.slug || "",
        content:
          typeof t.content === "string"
            ? t.content
            : JSON.stringify(t.content || ""),
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
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status || "DRAFT"
  );
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
  const [focusKeywordByLang, setFocusKeywordByLang] = useState<Record<string, string>>(
    () => ({
      vi: "",
      en: "",
    })
  );
  const [schemaTemplateByLang, setSchemaTemplateByLang] = useState<
    Record<string, SchemaTemplateType>
  >(() => ({
    vi: "WebPage",
    en: "WebPage",
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
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const storageKey = `cms-page-draft-${initial?.id ?? "new"}`;
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
  const siteBase =
    typeof window !== "undefined" ? window.location.origin : "";
  const serpUrl = current.canonical
    ? current.canonical
    : current.slug
    ? `${siteBase}/${current.slug}`
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
    status,
    storageKey,
    translations,
  ]);

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
      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <div className="grid gap-4">
          <Input
            label="Title"
            value={current.title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setIsDirty(true);
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: {
                  ...prev[activeLang],
                  title: nextTitle,
                  slug: slugEdited[activeLang]
                    ? prev[activeLang].slug
                    : slugify(nextTitle),
                },
              }));
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
          <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                SEO & Schema
              </p>
              <span className="text-[10px] text-[var(--ink-muted)]">
                RankMath style
              </span>
            </div>
            <div className="mt-3 grid gap-3">
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
                  onClick={() => {
                    const generated = generateSeoFromContent({
                      title: current.title,
                      contentHtml: current.content,
                    });
                    setIsDirty(true);
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLang]: {
                        ...prev[activeLang],
                        seoTitle: generated.seoTitle,
                        seoDescription: generated.seoDescription,
                        ogTitle: generated.ogTitle,
                        ogDescription: generated.ogDescription,
                      },
                    }));
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
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], seoTitle: event.target.value },
                  }));
                }}
              />
              <Textarea
                label="SEO Description"
                value={current.seoDescription}
                onChange={(event) => {
                  setIsDirty(true);
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], seoDescription: event.target.value },
                  }));
                }}
                className="min-h-[90px]"
              />
              <Input
                label="Canonical URL"
                value={current.canonical}
                onChange={(event) => {
                  setIsDirty(true);
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], canonical: event.target.value },
                  }));
                }}
              />
              <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
                Robots
                <select
                  className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                  value={current.robots || "index,follow"}
                  onChange={(event) => {
                    setIsDirty(true);
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], robots: event.target.value },
                    }));
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
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], ogTitle: event.target.value },
                  }));
                }}
              />
              <Textarea
                label="OG Description"
                value={current.ogDescription}
                onChange={(event) => {
                  setIsDirty(true);
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], ogDescription: event.target.value },
                  }));
                }}
                className="min-h-[90px]"
              />
              <Input
                label="OG Image"
                value={current.ogImage}
                onChange={(event) => {
                  setIsDirty(true);
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], ogImage: event.target.value },
                  }));
                }}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f1722] p-4 text-white seo-panel">
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

            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                SERP Preview
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-[#1a73e8]">
                  {current.seoTitle || current.title || "SEO title"}
                </p>
                <p className="text-xs text-emerald-700">{serpUrl}</p>
                <p className="text-xs text-[var(--ink-muted)]">
                  {current.seoDescription || "Meta description sẽ hiển thị ở đây."}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4 seo-panel">
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
                    <option value="WebPage">WebPage</option>
                    <option value="Article">Article</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="LocalBusiness">LocalBusiness</option>
                    <option value="Service">Service</option>
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
                        description: current.seoDescription || "",
                        url: serpUrl,
                        image: current.ogImage || "",
                        organization: schemaOrg,
                        faqItems: schemaFaqItems,
                      }),
                      null,
                      2
                    )}
                  </pre>
                </div>
                <Button
                  onClick={() => {
                    const schema = buildSchemaTemplate({
                      type: schemaTemplate,
                      title: current.seoTitle || current.title,
                      description: current.seoDescription || "",
                      url: serpUrl,
                      image: current.ogImage || "",
                      organization: schemaOrg,
                      faqItems: schemaFaqItems,
                    });
                    setIsDirty(true);
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLang]: {
                        ...prev[activeLang],
                        schemaJson: JSON.stringify(schema, null, 2),
                      },
                    }));
                  }}
                >
                  Áp dụng schema
                </Button>
                <Textarea
                  label="Schema JSON (có thể chỉnh sửa)"
                  value={current.schemaJson || ""}
                  onChange={(event) => {
                    setIsDirty(true);
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], schemaJson: event.target.value },
                    }));
                  }}
                  className="min-h-[160px]"
                />
              </div>
            </div>
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
              {current.title || "Untitled page"}
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
    </div>
  );
}
