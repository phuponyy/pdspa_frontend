"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/common/Container";
import type { HomeSectionItem } from "@/types/page.types";
import { resolveMediaUrl } from "@/lib/media";

type GalleryItem = HomeSectionItem & {
  imageUrl?: string;
  caption?: string;
};

type HomePhotoGallerySectionProps = {
  heading: string;
  description?: string;
  items?: HomeSectionItem[];
};

const normalizeItem = (item: GalleryItem) => {
  const imageUrl = item.imageUrl || "";
  const caption = item.caption || item.description || item.title || "";
  return { imageUrl, caption };
};

export default function HomePhotoGallerySection({
  heading,
  description,
  items = [],
}: HomePhotoGallerySectionProps) {
  const normalized = useMemo(
    () =>
      (items as GalleryItem[])
        .map((item) => normalizeItem(item))
        .filter((item) => item.imageUrl),
    [items]
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => {
          if (prev === null) return prev;
          return prev + 1 >= normalized.length ? 0 : prev + 1;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => {
          if (prev === null) return prev;
          return prev - 1 < 0 ? normalized.length - 1 : prev - 1;
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, normalized.length]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (activeIndex !== null) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [activeIndex]);

  if (!normalized.length) {
    return null;
  }

  const active = activeIndex !== null ? normalized[activeIndex] : null;

  return (
    <section className="bg-[#050505] py-20">
      <Container className="space-y-10 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] md:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="text-sm leading-relaxed text-white/70 md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {normalized.map((item, index) => (
            <button
              key={`gallery-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-left shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
            >
              <img
                src={resolveMediaUrl(item.imageUrl)}
                alt={item.caption || `Gallery ${index + 1}`}
                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute left-4 bottom-4 text-xs uppercase tracking-[0.22em] text-white/70">
                Panda Spa
              </div>
            </button>
          ))}
        </div>
      </Container>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] bg-black/90 text-white"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute inset-0 z-0"
            aria-label="Close gallery"
          />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between px-6 py-4 text-sm text-white/70">
              <span>
                {activeIndex! + 1} / {normalized.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:border-[#ff9f40] hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-6">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === null
                      ? prev
                      : prev - 1 < 0
                      ? normalized.length - 1
                      : prev - 1
                  )
                }
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white/80 transition hover:border-[#ff9f40] hover:text-white"
                aria-label="Previous image"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <img
                src={resolveMediaUrl(active.imageUrl)}
                alt={active.caption || "Gallery item"}
                className="max-h-[70vh] w-auto max-w-[90vw] rounded-2xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              />
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === null
                      ? prev
                      : prev + 1 >= normalized.length
                      ? 0
                      : prev + 1
                  )
                }
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white/80 transition hover:border-[#ff9f40] hover:text-white"
                aria-label="Next image"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {normalized.map((item, index) => (
                  <button
                    key={`thumb-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border transition ${
                      index === activeIndex
                        ? "border-[#ff9f40]"
                        : "border-white/20"
                    }`}
                  >
                    <img
                      src={resolveMediaUrl(item.imageUrl)}
                      alt={item.caption || `Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
