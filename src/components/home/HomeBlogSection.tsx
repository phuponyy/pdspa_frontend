"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/common/Container";
import { getPublicPosts, getPublicPostBySlug } from "@/lib/api/public";
import { API_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { stripHtml } from "@/lib/seo/seoUtils";
import type { PublicPostItem, CmsTranslation } from "@/types/api.types";

type BlogCard = {
  title: string;
  slug: string;
  excerpt?: string;
  thumbnailUrl?: string | null;
};

type HomeBlogProps = {
  heading: string;
  description?: string;
  featuredSlug?: string;
  lang: "vi" | "en";
};

const POSTS_PER_PAGE = 5;
const EXCERPT_MAX = 160;

const buildPostHref = (lang: "vi" | "en", slug: string) =>
  lang === "en" ? `/tin-tuc/${slug}` : `/${lang}/tin-tuc/${slug}`;

const normalizeMediaUrl = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return value;
};

const buildExcerptFromContent = (content: CmsTranslation["content"]) => {
  if (!content) return "";
  let html = "";
  if (typeof content === "string") {
    html = content;
  } else if (
    typeof (content as { html?: unknown }).html === "string"
  ) {
    html = (content as { html: string }).html;
  }
  if (!html) return "";
  const text = stripHtml(html).replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= EXCERPT_MAX) return text;
  return `${text.slice(0, EXCERPT_MAX).trim()}…`;
};

const mapTranslation = (translation: CmsTranslation | null): BlogCard | null => {
  if (!translation?.slug) return null;
  const excerptFromContent = buildExcerptFromContent(translation.content ?? null);
  return {
    title: translation.seoTitle || translation.title,
    slug: translation.slug,
    excerpt:
      excerptFromContent ||
      translation.excerpt ||
      translation.seoDescription ||
      "",
    thumbnailUrl: normalizeMediaUrl(translation.thumbnailUrl),
  };
};

const mapListItem = (item: PublicPostItem): BlogCard | null =>
  mapTranslation(item.translation ?? null);

const buildPageRange = (page: number, totalPages: number) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const range: Array<number | "..."> = [];
  const showLeft = Math.max(2, page - 1);
  const showRight = Math.min(totalPages - 1, page + 1);
  range.push(1);
  if (showLeft > 2) range.push("...");
  for (let p = showLeft; p <= showRight; p += 1) range.push(p);
  if (showRight < totalPages - 1) range.push("...");
  range.push(totalPages);
  return range;
};

export default function HomeBlogSection({
  heading,
  description,
  featuredSlug,
  lang,
}: HomeBlogProps) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BlogCard[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await getPublicPosts(lang, page, POSTS_PER_PAGE);
        if (!active) return;
        const list = response?.data?.items ?? [];
        const pagination = response?.data?.pagination;
        const mapped = list
          .map(mapListItem)
          .filter((value): value is BlogCard => Boolean(value));

        let finalItems = mapped.slice(0, POSTS_PER_PAGE);
        if (featuredSlug) {
          if (page === 1) {
            const detail = await getPublicPostBySlug(featuredSlug, lang);
            const featured = mapTranslation(detail?.data?.translation ?? null);
            if (featured) {
              const filtered = mapped.filter(
                (item) => item.slug !== featured.slug
              );
              finalItems = [
                featured,
                ...filtered.slice(0, POSTS_PER_PAGE - 1),
              ];
            } else {
              finalItems = mapped.slice(0, POSTS_PER_PAGE);
            }
          } else {
            const prevResponse = await getPublicPosts(
              lang,
              Math.max(1, page - 1),
              POSTS_PER_PAGE
            );
            const prevMapped = (prevResponse?.data?.items ?? [])
              .map(mapListItem)
              .filter((value): value is BlogCard => Boolean(value));
            const combined = [...prevMapped, ...mapped].filter(
              (item) => item.slug !== featuredSlug
            );
            const offset = POSTS_PER_PAGE - 1;
            finalItems = combined.slice(offset, offset + POSTS_PER_PAGE);
          }
        }

        setItems(finalItems);
        setTotalPages(pagination?.totalPages ?? 1);
      } catch {
        if (!active) return;
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [lang, page, featuredSlug]);

  const pages = useMemo(() => buildPageRange(page, totalPages), [page, totalPages]);

  if (!items.length && !loading) {
    return null;
  }

  const primary = items[0];
  const secondary = items.slice(1, POSTS_PER_PAGE);

  return (
    <section className="bg-[#050505] py-20">
      <Container className="space-y-10 text-white">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent-strong)]">
            Blog
          </p>
          <h2 className="text-3xl font-semibold text-[var(--accent-strong)] md:text-4xl">
            {heading}
          </h2>
          {description ? (
            <p className="max-w-3xl text-sm text-white/70 md:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {primary ? (
            <article className="space-y-4">
              <Link
                href={buildPostHref(lang, primary.slug)}
                className="group block overflow-hidden rounded-[32px] border border-white/10 bg-black/30 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#111]">
                  {primary.thumbnailUrl ? (
                    <img
                      src={primary.thumbnailUrl}
                      alt={primary.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#242424] to-[#0b0b0b]" />
                  )}
                </div>
              </Link>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[var(--accent-strong)]">
                  {primary.title}
                </h3>
                {primary.excerpt ? (
                  <p className="text-sm text-white/70">{primary.excerpt}</p>
                ) : null}
                <Link
                  href={buildPostHref(lang, primary.slug)}
                  className="text-sm font-semibold text-[var(--accent-strong)]"
                >
                  See more
                </Link>
              </div>
            </article>
          ) : null}

          <div className="space-y-4">
            {secondary.map((item) => (
              <Link
                key={item.slug}
                href={buildPostHref(lang, item.slug)}
                className="group flex gap-4 rounded-2xl border border-white/10 bg-black/25 p-3 transition hover:border-[var(--accent-strong)]"
              >
                <div className="h-20 w-28 overflow-hidden rounded-xl bg-[#111]">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#242424] to-[#0b0b0b]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <h4 className="text-sm font-semibold text-[var(--accent-strong)]">
                    {item.title}
                  </h4>
                  {item.excerpt ? (
                    <p className="text-xs text-white/60">{item.excerpt}</p>
                  ) : null}
                  <span className="text-xs font-semibold text-[var(--accent-strong)]">
                    See more
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-full border border-white/10 px-3 py-1 text-white/60 transition hover:text-white disabled:opacity-40"
            >
              «
            </button>
            {pages.map((value, idx) =>
              value === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-white/40">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${value}`}
                  type="button"
                  onClick={() => setPage(value)}
                  className={cn(
                    "rounded-full border px-3 py-1 transition",
                    page === value
                      ? "border-[var(--accent-strong)] bg-[var(--accent-strong)] text-[#1a1410]"
                      : "border-white/10 text-white/70 hover:text-white"
                  )}
                >
                  {value}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="rounded-full border border-white/10 px-3 py-1 text-white/60 transition hover:text-white disabled:opacity-40"
            >
              »
            </button>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
