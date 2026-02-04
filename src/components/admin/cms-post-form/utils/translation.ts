import type { CmsPost } from "@/types/api.types";
import type {
  CmsPostTranslationsByLang,
} from "@/components/admin/cms-post-form/types";

const normalizeLangCode = (code: string, fallback: string) =>
  (code || fallback) === "vn" ? "vi" : (code || fallback);

export const buildInitialTranslations = (
  initial: CmsPost | undefined,
  langCode: string,
  languages: readonly string[]
): CmsPostTranslationsByLang => {
  const base: CmsPostTranslationsByLang = {};
  languages.forEach((code) => {
    base[code] = {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      thumbnailUrl: null,
      seoTitle: "",
      seoDescription: "",
      canonical: "",
      robots: "index,follow",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      schemaJson: "",
    };
  });

  initial?.translations?.forEach((t) => {
    const code = normalizeLangCode(t.language?.code || langCode, langCode);
    if (!base[code]) return;
    base[code] = {
      title: t.title || "",
      slug: t.slug || "",
      excerpt: t.excerpt || "",
      content: typeof t.content === "string" ? t.content : JSON.stringify(t.content || ""),
      thumbnailUrl: t.thumbnailUrl ?? null,
      seoTitle: t.seoTitle || "",
      seoDescription: t.seoDescription || "",
      canonical: t.canonical || "",
      robots: t.robots || "index,follow",
      ogTitle: t.ogTitle || "",
      ogDescription: t.ogDescription || "",
      ogImage: t.ogImage || "",
      schemaJson: t.schemaJson ? JSON.stringify(t.schemaJson, null, 2) : "",
    };
  });

  return base;
};

export const buildSlugEditedMap = (
  initial: CmsPost | undefined,
  langCode: string,
  languages: readonly string[]
) => {
  const base: Record<string, boolean> = {};
  languages.forEach((code) => {
    const hasSlug =
      initial?.translations?.some((t) => {
        const rawCode = t.language?.code || langCode;
        const normalized = rawCode === "vn" ? "vi" : rawCode;
        return normalized === code && t.slug;
      }) ?? false;
    base[code] = hasSlug;
  });
  return base;
};

export const getExistingLangs = (initial: CmsPost | undefined, langCode: string) => {
  const langs = new Set<string>();
  initial?.translations?.forEach((t) => {
    const raw = t.language?.code || langCode;
    langs.add(raw === "vn" ? "vi" : raw);
  });
  return langs;
};
