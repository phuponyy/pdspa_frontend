"use client";

import { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import {
  updateHomeHero,
  updateHomeMeta,
  updateHomeStatus,
  uploadHeroImage,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/constants";
import type { HeroSlide } from "@/types/page.types";

export default function PageEditor({
  token,
  lang,
}: {
  token: string;
  lang: string;
}) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [message, setMessage] = useState<string | null>(null);

  const notify = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.");
      return;
    }
    notify("Unable to reach the server. Please try again.");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">SEO Metadata</h2>
        <div className="mt-4 grid gap-4">
          <Input
            label="Meta title"
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
          />
          <Textarea
            label="Meta description"
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
          />
          <Button
            onClick={async () => {
              try {
                await updateHomeMeta(token, lang, { metaTitle, metaDescription });
                notify("SEO metadata updated.");
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
            value={heading}
            onChange={(event) => setHeading(event.target.value)}
          />
          <Textarea
            label="Subheading"
            value={subheading}
            onChange={(event) => setSubheading(event.target.value)}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--ink)]">
                Hero slides (max 10)
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  if (slides.length >= 10) {
                    notify("Maximum 10 images.");
                    return;
                  }
                  setSlides((prev) => [
                    ...prev,
                    {
                      imageUrl: "",
                      heading: "",
                      subheading: "",
                      primaryCta: "",
                      primaryLink: "",
                      secondaryCta: "",
                      secondaryLink: "",
                    },
                  ]);
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
                    if (slides.length >= 10) {
                      notify("Maximum 10 images.");
                      return;
                    }
                    setIsUploading(true);
                    try {
                      let remaining = 10 - slides.length;
                      for (const file of files) {
                        if (remaining <= 0) break;
                        const response = await uploadHeroImage(token, file);
                        const url = response?.data?.url;
                        if (url) {
                          setSlides((prev) =>
                            [
                              ...prev,
                              {
                                imageUrl: url,
                                heading: "",
                                subheading: "",
                                primaryCta: "",
                                primaryLink: "",
                                secondaryCta: "",
                                secondaryLink: "",
                              },
                            ].slice(0, 10)
                          );
                          remaining -= 1;
                        }
                      }
                      notify("Images uploaded.");
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
              {slides.map((slide, idx) => (
                <div key={`hero-image-${idx}`} className="flex gap-2">
                  <Input
                    label={`Image URL ${idx + 1}`}
                    value={slide.imageUrl}
                    onChange={(event) => {
                      const next = [...slides];
                      next[idx] = { ...next[idx], imageUrl: event.target.value };
                      setSlides(next);
                    }}
                  />
                  <Button
                    variant="outline"
                    className="h-12 px-4"
                    onClick={() =>
                      setSlides((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {slides.map((slide, idx) => (
                <div key={`hero-text-${idx}`} className="grid gap-3">
                  <Input
                    label={`Heading ${idx + 1}`}
                    value={slide.heading || ""}
                    onChange={(event) => {
                      const next = [...slides];
                      next[idx] = { ...next[idx], heading: event.target.value };
                      setSlides(next);
                    }}
                  />
                  <Textarea
                    label={`Subheading ${idx + 1}`}
                    value={slide.subheading || ""}
                    onChange={(event) => {
                      const next = [...slides];
                      next[idx] = { ...next[idx], subheading: event.target.value };
                      setSlides(next);
                    }}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      label={`Primary button ${idx + 1}`}
                      value={slide.primaryCta || ""}
                      onChange={(event) => {
                        const next = [...slides];
                        next[idx] = { ...next[idx], primaryCta: event.target.value };
                        setSlides(next);
                      }}
                    />
                    <Input
                      label={`Primary link ${idx + 1}`}
                      value={slide.primaryLink || ""}
                      onChange={(event) => {
                        const next = [...slides];
                        next[idx] = { ...next[idx], primaryLink: event.target.value };
                        setSlides(next);
                      }}
                    />
                    <Input
                      label={`Secondary button ${idx + 1}`}
                      value={slide.secondaryCta || ""}
                      onChange={(event) => {
                        const next = [...slides];
                        next[idx] = { ...next[idx], secondaryCta: event.target.value };
                        setSlides(next);
                      }}
                    />
                    <Input
                      label={`Secondary link ${idx + 1}`}
                      value={slide.secondaryLink || ""}
                      onChange={(event) => {
                        const next = [...slides];
                        next[idx] = { ...next[idx], secondaryLink: event.target.value };
                        setSlides(next);
                      }}
                    />
                  </div>
                </div>
              ))}
              {!slides.length ? (
                <p className="text-xs text-[var(--ink-muted)]">
                  No slides yet. Add up to 10 slides.
                </p>
              ) : null}
            </div>
          </div>
          <Button
            onClick={async () => {
              try {
                const normalizedSlides = slides
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
                  notify("Maximum 10 images.");
                  return;
                }
                await updateHomeHero(token, lang, {
                  heading,
                  subheading,
                  slides: normalizedSlides.slice(0, 10),
                });
                notify("Hero section updated.");
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
                notify("Homepage status updated.");
              } catch (err) {
                handleError(err);
              }
            }}
          >
            Update status
          </Button>
        </div>
      </div>

      {message ? (
        <p className="text-sm text-[var(--jade)]">{message}</p>
      ) : null}
    </div>
  );
}
