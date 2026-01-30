import type { Metadata } from "next";
import { getCmsPageBySlug } from "@/lib/api/public";
import { API_BASE_URL } from "@/lib/constants";
import { resolveSchemaJson } from "@/lib/sanitize";

const resolveOgImage = (value?: string | null) => {
  if (!value) return undefined;
  return value.startsWith("/") ? `${API_BASE_URL}${value}` : value;
};

export { resolveSchemaJson };

export const buildCmsMetadata = async (
  slug: string,
  lang: string
): Promise<{ metadata: Metadata | null; schemaJson: unknown | null }> => {
  const data = await getCmsPageBySlug(slug, lang).catch(() => null);
  const translation = data?.translation;
  if (!translation) {
    return { metadata: null, schemaJson: null };
  }

  const title = translation.seoTitle || translation.title;
  const description = translation.seoDescription || undefined;
  const canonical = data?.seo?.canonical;
  const hreflangs = data?.seo?.hreflangs;
  const ogTitle = translation.ogTitle || title;
  const ogDescription = translation.ogDescription || description;
  const ogImage = resolveOgImage(translation.ogImage);
  const robots = translation.robots || undefined;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical,
      languages: hreflangs,
    },
    openGraph: {
      type: "website",
      locale: lang === "vi" ? "vi_VN" : "en_US",
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
    robots: robots
      ? {
          index: !robots.includes("noindex"),
          follow: !robots.includes("nofollow"),
          googleBot: {
            index: !robots.includes("noindex"),
            follow: !robots.includes("nofollow"),
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : undefined,
  };

  return {
    metadata,
    schemaJson: data?.seo?.schemaJson ?? translation.schemaJson ?? null,
  };
};
