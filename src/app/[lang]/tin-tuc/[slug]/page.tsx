import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPostBySlug } from "@/lib/api/public";
import { isSupportedLang } from "@/lib/i18n";
import { sanitizeHtml } from "@/lib/sanitize";
import Container from "@/components/common/Container";
import { API_BASE_URL } from "@/lib/constants";
import { resolveSchemaJson } from "@/lib/seo/cmsPageMeta";

type PageParams = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) return {};
  const data = await getPublicPostBySlug(slug, rawLang).catch(() => null);
  const translation = data?.data?.translation;
  if (!translation) return {};
  const seo = data?.data?.seo;
  const ogImage = seo?.ogImage
    ? seo.ogImage.startsWith("/")
      ? `${API_BASE_URL}${seo.ogImage}`
      : seo.ogImage
    : undefined;
  return {
    title: translation.seoTitle || translation.title,
    description: translation.seoDescription || translation.excerpt || undefined,
    alternates: {
      canonical: seo?.canonical,
      languages: seo?.hreflangs,
    },
    openGraph: {
      type: "article",
      locale: rawLang === "vi" ? "vi_VN" : "en_US",
      url: seo?.canonical,
      title: seo?.ogTitle || translation.seoTitle || translation.title,
      description:
        seo?.ogDescription ||
        translation.seoDescription ||
        translation.excerpt ||
        undefined,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: seo?.ogTitle || translation.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || translation.seoTitle || translation.title,
      description:
        seo?.ogDescription ||
        translation.seoDescription ||
        translation.excerpt ||
        undefined,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: seo?.robots?.includes("noindex") ? false : true,
      follow: seo?.robots?.includes("nofollow") ? false : true,
      googleBot: {
        index: seo?.robots?.includes("noindex") ? false : true,
        follow: seo?.robots?.includes("nofollow") ? false : true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) {
    notFound();
  }
  const data = await getPublicPostBySlug(slug, rawLang).catch(() => null);
  const translation = data?.data?.translation;
  const post = data?.data?.post;
  const schema = resolveSchemaJson(data?.data?.seo?.schemaJson ?? null);
  const thumbnail = translation?.thumbnailUrl
    ? translation.thumbnailUrl.startsWith("/")
      ? `${API_BASE_URL}${translation.thumbnailUrl}`
      : translation.thumbnailUrl
    : null;
  if (!translation || !post) {
    notFound();
  }

  const rawContent = typeof translation.content === "string" ? translation.content : "";
  const withLazyImages = rawContent.replace(
    /<img(?![^>]*loading=)/gi,
    '<img loading="lazy" decoding="async" '
  );
  const content = sanitizeHtml(withLazyImages);

  return (
    <section className="py-16">
      <Container className="space-y-6">
        {schema ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schema }}
          />
        ) : null}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString()
              : "Draft"}
          </p>
          <h1 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
            {translation.title}
          </h1>
          {translation.excerpt ? (
            <p className="text-sm text-[var(--ink-muted)]">
              {translation.excerpt}
            </p>
          ) : null}
        </div>
        {thumbnail ? (
          <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/70">
            <img src={thumbnail} alt={translation.title} className="h-[360px] w-full object-cover" />
          </div>
        ) : null}
        <div
          className="cms-content space-y-4 text-sm leading-7 text-[var(--ink-muted)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </section>
  );
}
