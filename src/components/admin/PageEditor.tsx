"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import { useToast } from "@/components/common/ToastProvider";
import { Button as UiButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getHomeHero,
  getHomeIntro,
  getHomeRecovery,
  getHomeMeta,
  getHomeStatus,
  updateHomeHero,
  updateHomeIntro,
  updateHomeRecovery,
  updateHomeMeta,
  updateHomeStatus,
  uploadHeroImage,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/constants";
import type { HeroSlide } from "@/types/page.types";
import {
  analyzeSeo,
  buildSchemaTemplate,
  generateSeoFromContent,
  type SchemaTemplateType,
} from "@/lib/seo/seoUtils";

type MetaState = {
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  schemaJson: string;
};

type HeroState = {
  heading: string;
  subheading: string;
  slides: HeroSlide[];
};

type IntroState = {
  heading: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  providerName: string;
  listingName: string;
  rating: string;
  reviews: string;
  rankText: string;
  buttonLabel: string;
  buttonLink: string;
};

type RecoveryItem = {
  title: string;
  description: string;
  imageUrl: string;
};

type RecoveryState = {
  heading: string;
  items: RecoveryItem[];
};

export default function PageEditor({ lang }: { lang: string }) {
  const languages = useMemo(() => ["vi", "en"], []);
  const searchParams = useSearchParams();
  const initialLang =
    searchParams.get("lang") && languages.includes(searchParams.get("lang") || "")
      ? (searchParams.get("lang") as string)
      : lang;
  const [activeLang, setActiveLang] = useState(initialLang);
  const [metaByLang, setMetaByLang] = useState<Record<string, MetaState>>({
    vi: {
      metaTitle: "",
      metaDescription: "",
      canonical: "",
      robots: "index,follow",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      schemaJson: "",
    },
    en: {
      metaTitle: "",
      metaDescription: "",
      canonical: "",
      robots: "index,follow",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      schemaJson: "",
    },
  });
  const [heroByLang, setHeroByLang] = useState<Record<string, HeroState>>({
    vi: { heading: "", subheading: "", slides: [] },
    en: { heading: "", subheading: "", slides: [] },
  });
  const [introByLang, setIntroByLang] = useState<Record<string, IntroState>>({
    vi: {
      heading: "",
      description: "",
      imageUrl: "",
      videoUrl: "",
      providerName: "Tripadvisor",
      listingName: "Panda Spa",
      rating: "5",
      reviews: "",
      rankText: "",
      buttonLabel: "SPA DA NANG",
      buttonLink: "",
    },
    en: {
      heading: "",
      description: "",
      imageUrl: "",
      videoUrl: "",
      providerName: "Tripadvisor",
      listingName: "Panda Spa",
      rating: "5",
      reviews: "",
      rankText: "",
      buttonLabel: "SPA DA NANG",
      buttonLink: "",
    },
  });
  const [recoveryByLang, setRecoveryByLang] = useState<Record<string, RecoveryState>>({
    vi: {
      heading: "Recover your energy through relaxation",
      items: [
        { title: "Deep Massage Therapy", description: "", imageUrl: "" },
        { title: "Shuttle Service Spa", description: "", imageUrl: "" },
        { title: "Dedicated, Professional Service", description: "", imageUrl: "" },
      ],
    },
    en: {
      heading: "Recover your energy through relaxation",
      items: [
        { title: "Deep Massage Therapy", description: "", imageUrl: "" },
        { title: "Shuttle Service Spa", description: "", imageUrl: "" },
        { title: "Dedicated, Professional Service", description: "", imageUrl: "" },
      ],
    },
  });
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
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [loadedLangs, setLoadedLangs] = useState<Record<string, boolean>>({
    vi: false,
    en: false,
  });
  const [hasDraft, setHasDraft] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [mounted, setMounted] = useState(false);
  const storageKey = "home-editor-draft";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== activeLang) {
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
        metaByLang?: Record<string, MetaState>;
        heroByLang?: Record<string, HeroState>;
        introByLang?: Record<string, IntroState>;
        recoveryByLang?: Record<string, RecoveryState>;
        focusKeywordByLang?: Record<string, string>;
        schemaTemplateByLang?: Record<string, SchemaTemplateType>;
        schemaOrgByLang?: Record<string, string>;
        schemaFaqByLang?: Record<string, { question: string; answer: string }[]>;
        activeLang?: string;
        status?: "DRAFT" | "PUBLISHED";
      };
      if (parsed?.metaByLang) setMetaByLang(parsed.metaByLang);
      if (parsed?.heroByLang) setHeroByLang(parsed.heroByLang);
      if (parsed?.introByLang) setIntroByLang(parsed.introByLang);
      if (parsed?.recoveryByLang) setRecoveryByLang(parsed.recoveryByLang);
      if (parsed?.focusKeywordByLang) setFocusKeywordByLang(parsed.focusKeywordByLang);
      if (parsed?.schemaTemplateByLang) setSchemaTemplateByLang(parsed.schemaTemplateByLang);
      if (parsed?.schemaOrgByLang) setSchemaOrgByLang(parsed.schemaOrgByLang);
      if (parsed?.schemaFaqByLang) setSchemaFaqByLang(parsed.schemaFaqByLang);
      if (parsed?.status) setStatus(parsed.status);
      if (parsed?.activeLang && languages.includes(parsed.activeLang)) {
        setActiveLang(parsed.activeLang);
      }
      setHasDraft(true);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [languages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        metaByLang,
        heroByLang,
        introByLang,
        recoveryByLang,
        focusKeywordByLang,
        schemaTemplateByLang,
        schemaOrgByLang,
        schemaFaqByLang,
        activeLang,
        status,
      })
    );
  }, [
    metaByLang,
    heroByLang,
    introByLang,
    recoveryByLang,
    focusKeywordByLang,
    schemaTemplateByLang,
    schemaOrgByLang,
    schemaFaqByLang,
    activeLang,
    status,
    isDirty,
  ]);

  const currentMeta = metaByLang[activeLang] || {
    metaTitle: "",
    metaDescription: "",
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
  const serpUrl =
    currentMeta.canonical ||
    (siteBase ? `${siteBase}/` : "https://example.com");

  const seoContent = useMemo(() => {
    const hero = heroByLang[activeLang];
    const intro = introByLang[activeLang];
    const recovery = recoveryByLang[activeLang];
    return [
      hero?.heading,
      hero?.subheading,
      intro?.heading,
      intro?.description,
      recovery?.heading,
      ...(recovery?.items || []).map((item) => item.title || item.description),
    ]
      .filter(Boolean)
      .join(" ");
  }, [activeLang, heroByLang, introByLang, recoveryByLang]);

  const seoAnalysis = useMemo(
    () =>
      analyzeSeo({
        title: currentMeta.metaTitle,
        slug: "",
        description: currentMeta.metaDescription || "",
        contentHtml: seoContent,
        focusKeyword,
      }),
    [currentMeta.metaTitle, currentMeta.metaDescription, seoContent, focusKeyword]
  );
  const seoScore = Math.max(0, Math.min(100, seoAnalysis.score));
  const seoRadius = 26;
  const seoCircumference = 2 * Math.PI * seoRadius;
  const seoDashOffset = seoCircumference * (1 - seoScore / 100);
  const currentHero = heroByLang[activeLang] || {
    heading: "",
    subheading: "",
    slides: [],
  };
  const currentIntro = introByLang[activeLang] || {
    heading: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    providerName: "Tripadvisor",
    listingName: "Panda Spa",
    rating: "5",
    reviews: "",
    rankText: "",
    buttonLabel: "SPA DA NANG",
    buttonLink: "",
  };
  const currentRecovery = recoveryByLang[activeLang] || {
    heading: "",
    items: [],
  };

  useEffect(() => {
    if (loadedLangs[activeLang]) return;
    let cancelled = false;

    const isEmptyMeta = (meta: MetaState | undefined) =>
      !meta?.metaTitle &&
      !meta?.metaDescription &&
      !meta?.canonical &&
      !meta?.ogTitle &&
      !meta?.ogDescription &&
      !meta?.ogImage &&
      !meta?.schemaJson;
    const isEmptyHero = (hero: HeroState | undefined) =>
      !hero?.heading && !hero?.subheading && !(hero?.slides?.length ?? 0);
    const isEmptyIntro = (intro: IntroState | undefined) =>
      !intro?.heading &&
      !intro?.description &&
      !intro?.imageUrl &&
      !intro?.videoUrl;
    const isEmptyRecovery = (section: RecoveryState | undefined) =>
      !section?.heading && !(section?.items?.length ?? 0);

    const load = async () => {
      try {
        const [meta, hero, intro, recovery] = await Promise.all([
          getHomeMeta(undefined, activeLang),
          getHomeHero(undefined, activeLang),
          getHomeIntro(undefined, activeLang),
          getHomeRecovery(undefined, activeLang),
        ]);
        if (cancelled) return;

        setMetaByLang((prev) => {
          if (hasDraft && !isEmptyMeta(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              metaTitle: meta?.metaTitle ?? "",
              metaDescription: meta?.metaDescription ?? "",
              canonical: meta?.canonical ?? "",
              robots: meta?.robots ?? "index,follow",
              ogTitle: meta?.ogTitle ?? "",
              ogDescription: meta?.ogDescription ?? "",
              ogImage: meta?.ogImage ?? "",
              schemaJson: meta?.schemaJson ? JSON.stringify(meta.schemaJson, null, 2) : "",
            },
          };
        });

        const fallbackSlides =
          hero?.slides && hero.slides.length
            ? hero.slides
            : (hero?.images ?? []).map((imageUrl) => ({
                imageUrl,
                heading: "",
                subheading: "",
                primaryCta: "",
                primaryLink: "",
                secondaryCta: "",
                secondaryLink: "",
              }));

        setHeroByLang((prev) => {
          if (hasDraft && !isEmptyHero(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: hero?.heading ?? "",
              subheading: hero?.subheading ?? "",
              slides: fallbackSlides,
            },
          };
        });

        setIntroByLang((prev) => {
          if (hasDraft && !isEmptyIntro(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: intro?.heading ?? "",
              description: intro?.description ?? "",
              imageUrl: intro?.imageUrl ?? "",
              videoUrl: intro?.videoUrl ?? "",
              providerName: intro?.providerName ?? "Tripadvisor",
              listingName: intro?.listingName ?? "Panda Spa",
              rating: intro?.rating ? String(intro.rating) : "5",
              reviews: intro?.reviews ? String(intro.reviews) : "",
              rankText: intro?.rankText ?? "",
              buttonLabel: intro?.buttonLabel ?? "SPA DA NANG",
              buttonLink: intro?.buttonLink ?? "",
            },
          };
        });

        setRecoveryByLang((prev) => {
          if (hasDraft && !isEmptyRecovery(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: recovery?.heading ?? "",
              items: Array.isArray(recovery?.items)
                ? recovery.items.map((item) => ({
                    title: item?.title ?? "",
                    description: item?.description ?? "",
                    imageUrl: item?.imageUrl ?? "",
                  }))
                : [],
            },
          };
        });

        setLoadedLangs((prev) => ({ ...prev, [activeLang]: true }));
      } catch (err) {
        handleError(err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeLang, loadedLangs, hasDraft]);

  useEffect(() => {
    let cancelled = false;
    const loadStatus = async () => {
      try {
        const response = await getHomeStatus(undefined);
        if (cancelled) return;
        if (!isDirty) {
          setStatus(response.status);
        }
      } catch (err) {
        handleError(err);
      }
    };
    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [isDirty]);

  const persistStatus = async (nextStatus: "DRAFT" | "PUBLISHED") => {
    const previousStatus = status;
    setStatus(nextStatus);
    setIsSavingStatus(true);
    try {
      await updateHomeStatus(undefined, { status: nextStatus });
      notify(`Homepage status updated to ${nextStatus}.`, "success");
    } catch (err) {
      setStatus(previousStatus);
      handleError(err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const discardChanges = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
    setHasDraft(false);
    setIsDirty(false);
    window.location.reload();
  };

  const ensureRecoveryItems = (items: RecoveryItem[]) => {
    const next = [...items];
    while (next.length < 3) {
      next.push({ title: "", description: "", imageUrl: "" });
    }
    return next.slice(0, 3);
  };

  const sectionNav = [
    { label: "SEO Metadata", href: "#seo" },
    { label: "Hero Banner", href: "#hero" },
    { label: "Intro Section", href: "#intro" },
    { label: "Recovery Section", href: "#recovery" },
    { label: "Live Status", href: "#status" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section
          id="seo"
          className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h10M4 18h7" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">SEO Metadata</p>
                <p className="text-sm text-slate-500">Tối ưu hóa khả năng hiển thị tìm kiếm.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button type="button" className="rounded-full p-2 hover:bg-slate-100">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5c4.5 0 8.3 2.9 9.5 7-1.2 4.1-5 7-9.5 7S3.7 16.1 2.5 12C3.7 7.9 7.5 5 12 5z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button type="button" className="rounded-full p-2 text-rose-500 hover:bg-rose-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-5 space-y-4">
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
                    title:
                      currentMeta.metaTitle ||
                      heroByLang[activeLang]?.heading ||
                      "Panda Spa",
                    contentHtml: seoContent,
                  });
                  setIsDirty(true);
                  setMetaByLang((prev) => ({
                    ...prev,
                    [activeLang]: {
                      ...prev[activeLang],
                      metaTitle: generated.seoTitle,
                      metaDescription: generated.seoDescription,
                      ogTitle: generated.ogTitle,
                      ogDescription: generated.ogDescription,
                    },
                  }));
                }}
              >
                Auto generate SEO
              </Button>
              <span className="text-xs text-slate-400">
                Tự động lấy từ nội dung trang
              </span>
            </div>
            <Input
              label="Meta title"
              value={currentMeta.metaTitle}
              onChange={(event) => {
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    metaTitle: event.target.value,
                  },
                }));
              }}
            />
            <Textarea
              label="Meta description"
              value={currentMeta.metaDescription}
              onChange={(event) => {
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    metaDescription: event.target.value,
                  },
                }));
              }}
            />
            <Input
              label="Canonical URL"
              value={currentMeta.canonical}
              onChange={(event) => {
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    canonical: event.target.value,
                  },
                }));
              }}
            />
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-500">
              Robots
              <select
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                value={currentMeta.robots || "index,follow"}
                onChange={(event) => {
                  setIsDirty(true);
                  setMetaByLang((prev) => ({
                    ...prev,
                    [activeLang]: {
                      ...prev[activeLang],
                      robots: event.target.value,
                    },
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
              value={currentMeta.ogTitle}
              onChange={(event) => {
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    ogTitle: event.target.value,
                  },
                }));
              }}
            />
            <Textarea
              label="OG Description"
              value={currentMeta.ogDescription}
              onChange={(event) => {
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    ogDescription: event.target.value,
                  },
                }));
              }}
            />
            <Input
              label="OG Image"
              value={currentMeta.ogImage}
              onChange={(event) => {
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    ogImage: event.target.value,
                  },
                }));
              }}
            />

            <div className="rounded-2xl border border-slate-200 bg-[#0f1722] p-4 text-white seo-panel">
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
                        check.ok
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
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

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                SERP Preview
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-[#1a73e8]">
                  {currentMeta.metaTitle || "SEO title"}
                </p>
                <p className="text-xs text-emerald-700">{serpUrl}</p>
                <p className="text-xs text-slate-500">
                  {currentMeta.metaDescription || "Meta description sẽ hiển thị ở đây."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 seo-panel">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Schema Builder
              </p>
              <div className="mt-3 grid gap-3">
                <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-500">
                  Template
                  <select
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm"
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
                      <div key={`faq-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-2">
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
                <div className="rounded-xl border border-slate-200 bg-[#0f1722] p-3 text-xs text-white/80">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(
                      buildSchemaTemplate({
                        type: schemaTemplate,
                        title: currentMeta.metaTitle || "Panda Spa",
                        description: currentMeta.metaDescription || "",
                        url: serpUrl,
                        image: currentMeta.ogImage || "",
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
                      title: currentMeta.metaTitle || "Panda Spa",
                      description: currentMeta.metaDescription || "",
                      url: serpUrl,
                      image: currentMeta.ogImage || "",
                      organization: schemaOrg,
                      faqItems: schemaFaqItems,
                    });
                    setIsDirty(true);
                    setMetaByLang((prev) => ({
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
                  value={currentMeta.schemaJson || ""}
                  onChange={(event) => {
                    setIsDirty(true);
                    setMetaByLang((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], schemaJson: event.target.value },
                    }));
                  }}
                  className="min-h-[160px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={async () => {
                  try {
                    const schemaJson = parseSchemaJson(currentMeta.schemaJson);
                    if (schemaJson === null) return;
                    await updateHomeMeta(undefined, activeLang, {
                      metaTitle: currentMeta.metaTitle,
                      metaDescription: currentMeta.metaDescription,
                      canonical: currentMeta.canonical,
                      robots: currentMeta.robots,
                      ogTitle: currentMeta.ogTitle,
                      ogDescription: currentMeta.ogDescription,
                      ogImage: currentMeta.ogImage,
                      schemaJson,
                    });
                    const fresh = await getHomeMeta(undefined, activeLang);
                    if (fresh) {
                      setMetaByLang((prev) => ({
                        ...prev,
                        [activeLang]: {
                          metaTitle: fresh.metaTitle ?? "",
                          metaDescription: fresh.metaDescription ?? "",
                          canonical: fresh.canonical ?? "",
                          robots: fresh.robots ?? "index,follow",
                          ogTitle: fresh.ogTitle ?? "",
                          ogDescription: fresh.ogDescription ?? "",
                          ogImage: fresh.ogImage ?? "",
                          schemaJson: fresh.schemaJson ? JSON.stringify(fresh.schemaJson, null, 2) : "",
                        },
                      }));
                    }
                    notify("SEO metadata updated.", "success");
                    setIsDirty(false);
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem(storageKey);
                    }
                  } catch (err) {
                    handleError(err);
                  }
                }}
              >
                Save metadata
              </Button>
              {activeLang !== lang ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setMetaByLang((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[lang] },
                    }));
                    setHeroByLang((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[lang] },
                    }));
                    setIsDirty(true);
                  }}
                >
                  Clone from {lang.toUpperCase()}
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section
          id="hero"
          className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6l8-4 8 4-8 4-8-4z" />
                  <path d="M4 12l8 4 8-4" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hero Section</p>
                <p className="text-sm text-slate-500">Cập nhật thông điệp chính cho heros.</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <Input
                label="Heading"
                value={currentHero.heading}
                onChange={(event) => {
                  setIsDirty(true);
                  setHeroByLang((prev) => ({
                    ...prev,
                    [activeLang]: {
                      ...prev[activeLang],
                      heading: event.target.value,
                    },
                  }));
                }}
              />
              <Textarea
                label="Subheading"
                value={currentHero.subheading}
                onChange={(event) => {
                  setIsDirty(true);
                  setHeroByLang((prev) => ({
                    ...prev,
                    [activeLang]: {
                      ...prev[activeLang],
                      subheading: event.target.value,
                    },
                  }));
                }}
              />
            </div>
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M7 15l3-3 3 3 4-4 3 3" />
                </svg>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Ảnh thumb
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <label className="cursor-pointer rounded-full bg-[#111827] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  {isUploading ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const files = Array.from(event.target.files || []);
                      if (!files.length) return;
                      if (currentHero.slides.length >= 10) {
                        notify("Maximum 10 images.", "info");
                        return;
                      }
                      setIsUploading(true);
                      try {
                        let remaining = 10 - currentHero.slides.length;
                        for (const file of files) {
                          if (remaining <= 0) break;
                          const response = await uploadHeroImage(file);
                          const url = response?.data?.url;
                          if (url) {
                            setIsDirty(true);
                            setHeroByLang((prev) => ({
                              ...prev,
                              [activeLang]: {
                                ...prev[activeLang],
                                slides: [
                                  ...prev[activeLang].slides,
                                  {
                                    imageUrl: url,
                                    heading: "",
                                    subheading: "",
                                    primaryCta: "",
                                    primaryLink: "",
                                    secondaryCta: "",
                                    secondaryLink: "",
                                  },
                                ].slice(0, 10),
                              },
                            }));
                            remaining -= 1;
                          }
                        }
                        notify("Images uploaded.", "success");
                      } catch (err) {
                        handleError(err);
                      } finally {
                        setIsUploading(false);
                        event.target.value = "";
                      }
                    }}
                  />
                </label>
                <span className="rounded-full border border-slate-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Library
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Tối thiểu: 1920x1080px</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Hero slides (max 10)</p>
                <p className="text-xs text-slate-400">Hãy giữ mọi thứ ở mức tối giản, mở rộng slide để chỉnh sửa chi tiết đầy đủ.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (currentHero.slides.length >= 10) {
                    notify("Maximum 10 images.", "info");
                    return;
                  }
                  setIsDirty(true);
                  setHeroByLang((prev) => ({
                    ...prev,
                    [activeLang]: {
                      ...prev[activeLang],
                      slides: [
                        ...prev[activeLang].slides,
                        {
                          imageUrl: "",
                          heading: "",
                          subheading: "",
                          primaryCta: "",
                          primaryLink: "",
                          secondaryCta: "",
                          secondaryLink: "",
                        },
                      ],
                    },
                  }));
                }}
              >
                Add slide
              </Button>
            </div>
            <div className="space-y-3">
              {currentHero.slides.map((slide, idx) => (
                <details
                  key={`hero-slide-${idx}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-600">
                    <span>
                      Slide {idx + 1} · {slide.heading?.trim() || "Untitled"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {slide.imageUrl ? "Image set" : "No image"}
                    </span>
                  </summary>
                  <div className="mt-4 grid gap-3">
                    <Input
                      label="Image URL"
                      value={slide.imageUrl}
                      onChange={(event) => {
                        setIsDirty(true);
                        setHeroByLang((prev) => {
                          const next = [...prev[activeLang].slides];
                          next[idx] = { ...next[idx], imageUrl: event.target.value };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], slides: next },
                          };
                        });
                      }}
                    />
                    <Input
                      label="Heading"
                      value={slide.heading || ""}
                      onChange={(event) => {
                        setIsDirty(true);
                        setHeroByLang((prev) => {
                          const next = [...prev[activeLang].slides];
                          next[idx] = { ...next[idx], heading: event.target.value };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], slides: next },
                          };
                        });
                      }}
                    />
                    <Textarea
                      label="Subheading"
                      value={slide.subheading || ""}
                      onChange={(event) => {
                        setIsDirty(true);
                        setHeroByLang((prev) => {
                          const next = [...prev[activeLang].slides];
                          next[idx] = { ...next[idx], subheading: event.target.value };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], slides: next },
                          };
                        });
                      }}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Primary button"
                        value={slide.primaryCta || ""}
                        onChange={(event) => {
                          setIsDirty(true);
                          setHeroByLang((prev) => {
                            const next = [...prev[activeLang].slides];
                            next[idx] = {
                              ...next[idx],
                              primaryCta: event.target.value,
                            };
                            return {
                              ...prev,
                              [activeLang]: { ...prev[activeLang], slides: next },
                            };
                          });
                        }}
                      />
                      <Input
                        label="Primary link"
                        value={slide.primaryLink || ""}
                        onChange={(event) => {
                          setIsDirty(true);
                          setHeroByLang((prev) => {
                            const next = [...prev[activeLang].slides];
                            next[idx] = {
                              ...next[idx],
                              primaryLink: event.target.value,
                            };
                            return {
                              ...prev,
                              [activeLang]: { ...prev[activeLang], slides: next },
                            };
                          });
                        }}
                      />
                      <Input
                        label="Secondary button"
                        value={slide.secondaryCta || ""}
                        onChange={(event) => {
                          setIsDirty(true);
                          setHeroByLang((prev) => {
                            const next = [...prev[activeLang].slides];
                            next[idx] = {
                              ...next[idx],
                              secondaryCta: event.target.value,
                            };
                            return {
                              ...prev,
                              [activeLang]: { ...prev[activeLang], slides: next },
                            };
                          });
                        }}
                      />
                      <Input
                        label="Secondary link"
                        value={slide.secondaryLink || ""}
                        onChange={(event) => {
                          setIsDirty(true);
                          setHeroByLang((prev) => {
                            const next = [...prev[activeLang].slides];
                            next[idx] = {
                              ...next[idx],
                              secondaryLink: event.target.value,
                            };
                            return {
                              ...prev,
                              [activeLang]: { ...prev[activeLang], slides: next },
                            };
                          });
                        }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setHeroByLang((prev) => ({
                            ...prev,
                            [activeLang]: {
                              ...prev[activeLang],
                              slides: prev[activeLang].slides.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                      >
                        Remove slide
                      </Button>
                    </div>
                  </div>
                </details>
              ))}
              {!currentHero.slides.length ? (
                <p className="text-xs text-slate-400">No slides yet. Add up to 10 slides.</p>
              ) : null}
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={async () => {
                try {
                  const normalizedSlides = currentHero.slides
                    .map((slide) => ({
                      imageUrl: slide.imageUrl.trim(),
                      heading: slide.heading?.trim(),
                      subheading: slide.subheading?.trim(),
                      primaryCta: slide.primaryCta?.trim(),
                      primaryLink: slide.primaryLink?.trim(),
                      secondaryCta: slide.secondaryCta?.trim(),
                      secondaryLink: slide.secondaryLink?.trim(),
                    }))
                    .filter((slide) => slide.imageUrl)
                    .map((slide) => ({
                      ...slide,
                      imageUrl: slide.imageUrl.startsWith("/")
                        ? `${API_BASE_URL}${slide.imageUrl}`
                        : slide.imageUrl,
                    }));
                  if (normalizedSlides.length > 10) {
                    notify("Maximum 10 images.", "info");
                    return;
                  }
                  await updateHomeHero(undefined, activeLang, {
                    heading: currentHero.heading,
                    subheading: currentHero.subheading,
                    slides: normalizedSlides.slice(0, 10),
                  });
                  notify("Hero section updated.", "success");
                  setIsDirty(false);
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(storageKey);
                  }
                } catch (err) {
                  handleError(err);
                }
              }}
            >
              Save hero
            </Button>
          </div>
        </section>

        <section
          id="intro"
          className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12h16" />
                  <path d="M4 6h10" />
                  <path d="M4 18h7" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Intro Section</p>
                <p className="text-sm text-slate-500">Điểm nổi bật trên trang chủ nằm bên dưới phần hero.</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            <Input
              label="Heading"
              value={currentIntro.heading}
              onChange={(event) => {
                setIsDirty(true);
                setIntroByLang((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], heading: event.target.value },
                }));
              }}
            />
            <Textarea
              label="Description"
              value={currentIntro.description}
              onChange={(event) => {
                setIsDirty(true);
                setIntroByLang((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], description: event.target.value },
                }));
              }}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Image URL"
                value={currentIntro.imageUrl}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], imageUrl: event.target.value },
                  }));
                }}
              />
              <Input
                label="Video URL"
                value={currentIntro.videoUrl}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], videoUrl: event.target.value },
                  }));
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Provider name"
                value={currentIntro.providerName}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], providerName: event.target.value },
                  }));
                }}
              />
              <Input
                label="Listing name"
                value={currentIntro.listingName}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], listingName: event.target.value },
                  }));
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Rating"
                value={currentIntro.rating}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], rating: event.target.value },
                  }));
                }}
              />
              <Input
                label="Reviews"
                value={currentIntro.reviews}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], reviews: event.target.value },
                  }));
                }}
              />
              <Input
                label="Rank text"
                value={currentIntro.rankText}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], rankText: event.target.value },
                  }));
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Button label"
                value={currentIntro.buttonLabel}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], buttonLabel: event.target.value },
                  }));
                }}
              />
              <Input
                label="Button link"
                value={currentIntro.buttonLink}
                onChange={(event) => {
                  setIsDirty(true);
                  setIntroByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], buttonLink: event.target.value },
                  }));
                }}
              />
            </div>
            <Button
              onClick={async () => {
                try {
                  await updateHomeIntro(undefined, activeLang, {
                    heading: currentIntro.heading,
                    description: currentIntro.description,
                    imageUrl: currentIntro.imageUrl,
                    videoUrl: currentIntro.videoUrl,
                    providerName: currentIntro.providerName,
                    listingName: currentIntro.listingName,
                    rating: Number(currentIntro.rating),
                    reviews: Number(currentIntro.reviews),
                    rankText: currentIntro.rankText,
                    buttonLabel: currentIntro.buttonLabel,
                    buttonLink: currentIntro.buttonLink,
                  });
                  const fresh = await getHomeIntro(undefined, activeLang);
                  if (fresh) {
                    setIntroByLang((prev) => ({
                      ...prev,
                      [activeLang]: {
                        heading: fresh.heading ?? "",
                        description: fresh.description ?? "",
                        imageUrl: fresh.imageUrl ?? "",
                        videoUrl: fresh.videoUrl ?? "",
                        providerName: fresh.providerName ?? "Tripadvisor",
                        listingName: fresh.listingName ?? "Panda Spa",
                        rating: fresh.rating ? String(fresh.rating) : "5",
                        reviews: fresh.reviews ? String(fresh.reviews) : "",
                        rankText: fresh.rankText ?? "",
                        buttonLabel: fresh.buttonLabel ?? "SPA DA NANG",
                        buttonLink: fresh.buttonLink ?? "",
                      },
                    }));
                  }
                  notify("Intro section updated.", "success");
                  setIsDirty(false);
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(storageKey);
                  }
                } catch (err) {
                  handleError(err);
                }
              }}
            >
              Save intro
            </Button>
          </div>
        </section>

        <section
          id="recovery"
          className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16" />
                  <path d="M4 12h12" />
                  <path d="M4 18h8" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recovery Section</p>
                <p className="text-sm text-slate-500">Hãy nêu bật ba dịch vụ chính.</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            <Input
              label="Heading"
              value={currentRecovery.heading}
              onChange={(event) => {
                setIsDirty(true);
                setRecoveryByLang((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], heading: event.target.value },
                }));
              }}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {ensureRecoveryItems(currentRecovery.items).map(
                (item, index) => (
                  <div
                    key={`recovery-item-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <Input
                      label={`Card ${index + 1} title`}
                      value={item.title || ""}
                      onChange={(event) => {
                        setIsDirty(true);
                        setRecoveryByLang((prev) => {
                          const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                          next[index] = { ...next[index], title: event.target.value };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], items: next },
                          };
                        });
                      }}
                    />
                    <Textarea
                      label="Description"
                      value={item.description || ""}
                      onChange={(event) => {
                        setIsDirty(true);
                        setRecoveryByLang((prev) => {
                          const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                          next[index] = { ...next[index], description: event.target.value };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], items: next },
                          };
                        });
                      }}
                    />
                    <Input
                      label="Image URL"
                      value={item.imageUrl || ""}
                      onChange={(event) => {
                        setIsDirty(true);
                        setRecoveryByLang((prev) => {
                          const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                          next[index] = { ...next[index], imageUrl: event.target.value };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], items: next },
                          };
                        });
                      }}
                    />
                  </div>
                )
              )}
            </div>
            <Button
              onClick={async () => {
                try {
                  const normalizedItems = (currentRecovery.items || [])
                    .slice(0, 3)
                    .map((item) => ({
                      title: item.title?.trim() || "",
                      description: item.description?.trim() || "",
                      imageUrl: item.imageUrl?.trim() || "",
                    }));
                  await updateHomeRecovery(undefined, activeLang, {
                    heading: currentRecovery.heading,
                    items: normalizedItems,
                  });
                  const fresh = await getHomeRecovery(undefined, activeLang);
                  if (fresh) {
                    setRecoveryByLang((prev) => ({
                      ...prev,
                      [activeLang]: {
                        heading: fresh.heading ?? "",
                        items: Array.isArray(fresh.items)
                          ? fresh.items.map((item) => ({
                              title: item?.title ?? "",
                              description: item?.description ?? "",
                              imageUrl: item?.imageUrl ?? "",
                            }))
                          : [],
                      },
                    }));
                  }
                  notify("Recovery section updated.", "success");
                  setIsDirty(false);
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(storageKey);
                  }
                } catch (err) {
                  handleError(err);
                }
              }}
            >
              Save recovery section
            </Button>
          </div>
        </section>

        <div
          id="status"
          className="sticky bottom-6 z-20 flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-[#0b1118]/90 px-5 py-3 text-xs text-white/70 shadow-[0_20px_60px_rgba(5,10,18,0.45)] backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </span>
            <span>Changes will be live instantly upon publishing.</span>
          </div>
          <div className="flex items-center gap-3">
            {mounted ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <UiButton variant="outline" size="sm">
                    Discard
                  </UiButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Discard draft changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This clears your local draft and reloads the last saved version.
                  </AlertDialogDescription>
                  <div className="mt-5 flex items-center justify-end gap-3">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={discardChanges}>
                      Discard changes
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            <UiButton
              size="sm"
              onClick={() => persistStatus("PUBLISHED")}
              disabled={isSavingStatus}
              className="bg-[#ff9f40] text-[#1a1410] shadow-[0_12px_24px_rgba(255,159,64,0.3)] hover:bg-[#ffb454]"
            >
              Publish page
            </UiButton>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="admin-panel p-5 text-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Điều hướng nhanh</p>
          <div className="mt-4 space-y-2">
            {sectionNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 12h10" />
                    <path d="M12 7v10" />
                  </svg>
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="admin-panel p-5 text-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Cấu hình trang chủ</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3 text-white/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18" />
                    <path d="M12 3a15 15 0 0 1 0 18" />
                    <path d="M12 3a15 15 0 0 0 0 18" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Ngôn Ngữ</p>
                  <p className="text-sm font-semibold text-white">Nội dung</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0f1722] p-1">
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
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      activeLang === code
                        ? "bg-[#ff9f40] text-[#1a1410]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3 text-white/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">Trạng thái</p>
                  <p className="text-sm font-semibold text-white">{status}</p>
                </div>
              </div>
              <Switch
                checked={status === "PUBLISHED"}
                onCheckedChange={(checked) => {
                  if (isSavingStatus) return;
                  persistStatus(checked ? "PUBLISHED" : "DRAFT");
                }}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
