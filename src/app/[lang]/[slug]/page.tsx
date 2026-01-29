import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsPageBySlug } from "@/lib/api/public";
import { isSupportedLang } from "@/lib/i18n";
import { sanitizeHtml } from "@/lib/sanitize";
import Container from "@/components/common/Container";
import { API_BASE_URL } from "@/lib/constants";

type PageParams = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) return {};

  const data = await getCmsPageBySlug(slug, rawLang).catch(() => null);
  const translation = data?.translation;
  if (!translation) return {};

  const title = translation.seoTitle || translation.title;
  const description = translation.seoDescription || undefined;
  const canonical = data?.seo?.canonical;
  const hreflangs = data?.seo?.hreflangs;
  const ogTitle = translation.ogTitle || title;
  const ogDescription = translation.ogDescription || description;
  const ogImage = translation.ogImage
    ? translation.ogImage.startsWith("/")
      ? `${API_BASE_URL}${translation.ogImage}`
      : translation.ogImage
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: hreflangs,
    },
    openGraph: {
      type: "article",
      locale: rawLang === "vi" ? "vi_VN" : "en_US",
      url: canonical,
      title: ogTitle,
      description: ogDescription,
      images: ogImage
        ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: ogTitle,
          },
        ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: translation.robots?.includes("noindex") ? false : true,
      follow: translation.robots?.includes("nofollow") ? false : true,
      googleBot: {
        index: translation.robots?.includes("noindex") ? false : true,
        follow: translation.robots?.includes("nofollow") ? false : true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function CmsPage({
  params,
}: {
  params: PageParams;
}) {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) {
    notFound();
  }

  const data = await getCmsPageBySlug(slug, rawLang).catch(() => null);
  const translation = data?.translation;
  if (!translation) {
    notFound();
  }

  const rawContent = typeof translation.content === "string" ? translation.content : "";
  const withLazyImages = rawContent.replace(
    /<img(?![^>]*loading=)/gi,
    '<img loading="lazy" decoding="async" '
  );
  const content = sanitizeHtml(withLazyImages);
  const schemaJson = data?.seo?.schemaJson ?? translation.schemaJson ?? null;
  const resolvedSchema = (() => {
    if (!schemaJson) return "";
    if (typeof schemaJson === "string") {
      try {
        return JSON.stringify(JSON.parse(schemaJson));
      } catch {
        return "";
      }
    }
    try {
      return JSON.stringify(schemaJson);
    } catch {
      return "";
    }
  })();

  return (
    <section className="py-16">
      <Container className="space-y-6">
        {resolvedSchema ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: resolvedSchema }}
          />
        ) : null}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Page
          </p>
          <h1 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
            {translation.title}
          </h1>
        </div>
        <div
          className="cms-content space-y-4 text-sm leading-7 text-[var(--ink-muted)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </section>
  );
}
