"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/common/Container";
import type { HomeSectionItem } from "@/types/page.types";

type ReviewItem = HomeSectionItem & {
  name?: string;
  avatarUrl?: string;
  rating?: number;
  contributions?: string;
  visit?: string;
  tag?: string;
  review?: string;
};

type HomeReviewsProps = {
  heading: string;
  description?: string;
  items?: HomeSectionItem[];
};

const MAX_REVIEWS = 10;
const AUTO_SCROLL_INTERVAL = 4200;

const normalizeReview = (item: ReviewItem) => {
  const name = item.name || item.title || "";
  const review = item.review || item.description || "";
  const avatarUrl = item.avatarUrl || item.imageUrl || "";
  const rating =
    typeof item.rating === "number" && Number.isFinite(item.rating)
      ? Math.min(5, Math.max(0, item.rating))
      : 5;
  return {
    name,
    review,
    avatarUrl,
    rating,
    contributions: item.contributions,
    visit: item.visit,
    tag: item.tag,
  };
};

export default function HomeReviewsSection({
  heading,
  description,
  items = [],
}: HomeReviewsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const layoutRef = useRef({
    step: 0,
    maxIndex: 0,
    pageSize: 0,
    totalPages: 1,
  });
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const normalized = (items as ReviewItem[])
    .map((item) => normalizeReview(item))
    .filter((item) => item.name || item.review)
    .slice(0, MAX_REVIEWS);

  if (!normalized.length) {
    return null;
  }

  const shouldAutoScroll = normalized.length > 3;
  const canPaginate = totalPages > 1;

  const computeLayout = () => {
    const track = trackRef.current;
    if (!track) return false;
    const cards = track.querySelectorAll<HTMLElement>("[data-review-card]");
    if (!cards.length) return false;
    const style = window.getComputedStyle(track);
    const gapValue = style.columnGap || style.gap || "0px";
    const gap = Number.parseFloat(gapValue) || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const viewport = track.parentElement;
    const viewportWidth = viewport?.getBoundingClientRect().width ?? cardWidth;
    const visibleCount = Math.max(
      1,
      Math.round(viewportWidth / Math.max(1, cardWidth + gap))
    );
    const maxIndex = Math.max(0, cards.length - visibleCount);
    const step = cardWidth + gap;
    const pageSize = step * visibleCount;
    const pages = Math.max(1, Math.ceil(cards.length / visibleCount));
    layoutRef.current = { step, maxIndex, pageSize, totalPages: pages };
    setTotalPages(pages);
    const pageIndex = pageSize ? Math.round(track.scrollLeft / pageSize) : 0;
    setCurrentPage(Math.min(pages, Math.max(1, pageIndex + 1)));
    return maxIndex > 0 && step > 0;
  };

  const scrollByPage = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const { pageSize, totalPages } = layoutRef.current;
    if (!pageSize) return;
    const nextPage =
      direction === "next"
        ? Math.min(totalPages, currentPage + 1)
        : Math.max(1, currentPage - 1);
    track.scrollTo({ left: (nextPage - 1) * pageSize, behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    computeLayout();
    const handleResize = () => {
      window.requestAnimationFrame(() => {
        computeLayout();
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [normalized.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        const { pageSize, totalPages } = layoutRef.current;
        if (!pageSize) return;
        const pageIndex = Math.round(track.scrollLeft / pageSize) + 1;
        setCurrentPage(Math.min(totalPages, Math.max(1, pageIndex)));
      });
    };
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [normalized.length]);

  useEffect(() => {
    if (!shouldAutoScroll) return;
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const track = trackRef.current;
    if (!track) return;

    let index = 0;
    let maxIndex = 0;
    let step = 0;
    let rafId: number | null = null;

    const compute = () => {
      const ok = computeLayout();
      const layout = layoutRef.current;
      maxIndex = layout.maxIndex;
      step = layout.step;
      return ok;
    };

    const ready = compute();
    if (!ready) return;

    const tick = () => {
      if (document.hidden) return;
      index = index >= maxIndex ? 0 : index + 1;
      track.scrollTo({ left: index * step, behavior: "smooth" });
    };

    const timer = window.setInterval(tick, AUTO_SCROLL_INTERVAL);

    return () => {
      window.clearInterval(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [shouldAutoScroll, normalized.length]);

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
        <div className="relative">
          {canPaginate ? (
            <>
              <button
                type="button"
                onClick={() => scrollByPage("prev")}
                aria-label="Previous reviews"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-[#0b0b0b]/70 p-2 text-white/80 transition hover:border-[#ff9f40] hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollByPage("next")}
                aria-label="Next reviews"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-[#0b0b0b]/70 p-2 text-white/80 transition hover:border-[#ff9f40] hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              <div className="absolute left-4 bottom-4 rounded-full border border-white/10 bg-[#0b0b0b]/75 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                {currentPage} / {totalPages}
              </div>
              <div className="absolute right-4 bottom-4 rounded-full border border-white/10 bg-[#0b0b0b]/75 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                {currentPage} / {totalPages}
              </div>
            </>
          ) : null}
          <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="grid grid-flow-col gap-6 overflow-x-auto scroll-smooth md:auto-cols-[calc((100%-24px)/2)] lg:auto-cols-[calc((100%-48px)/3)] auto-cols-[85%] snap-x snap-mandatory select-none cursor-grab [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              const track = trackRef.current;
              if (!track) return;
              isDraggingRef.current = true;
              dragStartXRef.current = event.clientX;
              dragScrollLeftRef.current = track.scrollLeft;
              track.style.scrollBehavior = "auto";
              track.classList.add("cursor-grabbing");
              track.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!isDraggingRef.current) return;
              const track = trackRef.current;
              if (!track) return;
              const delta = event.clientX - dragStartXRef.current;
              track.scrollLeft = dragScrollLeftRef.current - delta;
            }}
            onPointerUp={(event) => {
              const track = trackRef.current;
              if (!track) return;
              isDraggingRef.current = false;
              track.releasePointerCapture(event.pointerId);
              track.style.scrollBehavior = "smooth";
              track.classList.remove("cursor-grabbing");
            }}
            onPointerLeave={(event) => {
              const track = trackRef.current;
              if (!track || !isDraggingRef.current) return;
              isDraggingRef.current = false;
              track.releasePointerCapture(event.pointerId);
              track.style.scrollBehavior = "smooth";
              track.classList.remove("cursor-grabbing");
            }}
            onWheel={(event) => {
              const track = trackRef.current;
              if (!track) return;
              if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
              track.scrollLeft += event.deltaY;
            }}
          >
            {normalized.map((item, index) => (
              <article
                key={`${item.name}-${index}`}
                data-review-card
                className="snap-start flex h-full flex-col gap-4 rounded-3xl bg-white p-6 text-[#1a1a1a] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-[#f1f1f1]">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.name || "Reviewer"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#ff6a3d]">
                        {item.name?.slice(0, 1) || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#ff6a3d]">{item.name}</p>
                    {item.contributions ? (
                      <p className="text-xs text-slate-500">
                        {item.contributions}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span
                      key={`rating-${index}-${idx}`}
                      className={`h-2.5 w-2.5 rounded-full ${
                        idx < item.rating ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {item.review}
                </p>
                <div className="mt-auto space-y-1 text-xs text-slate-400">
                  {item.visit ? <p>{item.visit}</p> : null}
                  {item.tag ? <p>{item.tag}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
        </div>
      </Container>
    </section>
  );
}
