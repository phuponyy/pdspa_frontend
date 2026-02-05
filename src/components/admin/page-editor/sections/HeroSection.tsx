import AdminTextarea from "@/components/admin/ui/AdminTextarea";
import { uploadHeroImage, updateHomeHero } from "@/lib/api/admin";
import { API_BASE_URL } from "@/lib/constants";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type { HeroState } from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export type HeroSectionProps = {
  activeLang: "vi" | "en";
  currentHero: HeroState;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  setHeroByLang: Dispatch<SetStateAction<Record<string, HeroState>>>;
  setIsDirty: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

export default function HeroSection({
  activeLang,
  currentHero,
  isUploading,
  setIsUploading,
  setHeroByLang,
  setIsDirty,
  notify,
  handleError,
}: HeroSectionProps) {
  return (
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
          <AdminInput
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
          <AdminTextarea
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
          <AdminButton
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
          </AdminButton>
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
                <AdminInput
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
                <AdminInput
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
                <AdminTextarea
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
                  <AdminInput
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
                  <AdminInput
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
                  <AdminInput
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
                  <AdminInput
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
                  <AdminButton
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
                  </AdminButton>
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
        <AdminButton
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
        </AdminButton>
      </div>
    </section>
  );
}
