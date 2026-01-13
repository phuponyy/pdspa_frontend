"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import { useToast } from "@/components/common/ToastProvider";
import {
  getHomeHero,
  getHomeMeta,
  getHomeStatus,
  updateHomeHero,
  updateHomeMeta,
  updateHomeStatus,
  uploadHeroImage,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/constants";
import type { HeroSlide } from "@/types/page.types";

type MetaState = {
  metaTitle: string;
  metaDescription: string;
};

type HeroState = {
  heading: string;
  subheading: string;
  slides: HeroSlide[];
};

export default function PageEditor({
  token,
  lang,
}: {
  token: string;
  lang: string;
}) {
  const languages = useMemo(() => ["vn", "en"], []);
  const searchParams = useSearchParams();
  const initialLang =
    searchParams.get("lang") && languages.includes(searchParams.get("lang") || "")
      ? (searchParams.get("lang") as string)
      : lang;
  const [activeLang, setActiveLang] = useState(initialLang);
  const [metaByLang, setMetaByLang] = useState<Record<string, MetaState>>({
    vn: { metaTitle: "", metaDescription: "" },
    en: { metaTitle: "", metaDescription: "" },
  });
  const [heroByLang, setHeroByLang] = useState<Record<string, HeroState>>({
    vn: { heading: "", subheading: "", slides: [] },
    en: { heading: "", subheading: "", slides: [] },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [loadedLangs, setLoadedLangs] = useState<Record<string, boolean>>({
    vn: false,
    en: false,
  });
  const [hasDraft, setHasDraft] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
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
        activeLang?: string;
        status?: "DRAFT" | "PUBLISHED";
      };
      if (parsed?.metaByLang) setMetaByLang(parsed.metaByLang);
      if (parsed?.heroByLang) setHeroByLang(parsed.heroByLang);
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
      JSON.stringify({ metaByLang, heroByLang, activeLang, status })
    );
  }, [metaByLang, heroByLang, activeLang, status, isDirty]);

  const currentMeta = metaByLang[activeLang] || {
    metaTitle: "",
    metaDescription: "",
  };
  const currentHero = heroByLang[activeLang] || {
    heading: "",
    subheading: "",
    slides: [],
  };

  useEffect(() => {
    if (!token) return;
    if (loadedLangs[activeLang]) return;
    let cancelled = false;

    const isEmptyMeta = (meta: MetaState | undefined) =>
      !meta?.metaTitle && !meta?.metaDescription;
    const isEmptyHero = (hero: HeroState | undefined) =>
      !hero?.heading && !hero?.subheading && !(hero?.slides?.length ?? 0);

    const load = async () => {
      try {
        const [meta, hero] = await Promise.all([
          getHomeMeta(token, activeLang),
          getHomeHero(token, activeLang),
        ]);
        if (cancelled) return;

        setMetaByLang((prev) => {
          if (hasDraft && !isEmptyMeta(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              metaTitle: meta?.metaTitle ?? "",
              metaDescription: meta?.metaDescription ?? "",
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

        setLoadedLangs((prev) => ({ ...prev, [activeLang]: true }));
      } catch (err) {
        handleError(err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeLang, token, loadedLangs, hasDraft]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const loadStatus = async () => {
      try {
        const response = await getHomeStatus(token);
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
  }, [token, isDirty]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">SEO Metadata</h2>
        <div className="mt-4 grid gap-4">
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
          <Button
            onClick={async () => {
              try {
                await updateHomeMeta(token, activeLang, {
                  metaTitle: currentMeta.metaTitle,
                  metaDescription: currentMeta.metaDescription,
                });
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
            Save SEO
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Hero section</h2>
        <div className="mt-4 grid gap-4">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--ink)]">
                Hero slides (max 10)
              </p>
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
                Add image
              </Button>
            </div>
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--mist)] p-4 text-xs text-[var(--ink-muted)]">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
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
                        const response = await uploadHeroImage(token, file);
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
                <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs">
                  {isUploading ? "Uploading..." : "Upload images"}
                </span>
                <span>PNG/JPG/WebP, up to 10 images.</span>
              </label>
            </div>
            <div className="space-y-3">
              {currentHero.slides.map((slide, idx) => (
                <div key={`hero-image-${idx}`} className="flex gap-2">
                  <Input
                    label={`Image URL ${idx + 1}`}
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
                  <Button
                    variant="outline"
                    className="h-12 px-4"
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
                    Remove
                  </Button>
                </div>
              ))}
              {currentHero.slides.map((slide, idx) => (
                <div key={`hero-text-${idx}`} className="grid gap-3">
                  <Input
                    label={`Heading ${idx + 1}`}
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
                    label={`Subheading ${idx + 1}`}
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
                      label={`Primary button ${idx + 1}`}
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
                      label={`Primary link ${idx + 1}`}
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
                      label={`Secondary button ${idx + 1}`}
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
                      label={`Secondary link ${idx + 1}`}
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
                </div>
              ))}
              {!currentHero.slides.length ? (
                <p className="text-xs text-[var(--ink-muted)]">
                  No slides yet. Add up to 10 slides.
                </p>
              ) : null}
            </div>
          </div>
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
                await updateHomeHero(token, activeLang, {
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
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Publish status</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <select
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "DRAFT" | "PUBLISHED")
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await updateHomeStatus(token, { status });
                notify("Homepage status updated.", "success");
              } catch (err) {
                handleError(err);
              }
            }}
          >
            Update status
          </Button>
        </div>
      </div>

    </div>
  );
}
