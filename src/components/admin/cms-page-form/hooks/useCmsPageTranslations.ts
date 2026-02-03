import { useEffect, useMemo, useState } from "react";
import type { CmsPage } from "@/types/api.types";
import type { CmsPageTranslations } from "../types";

const createEmptyTranslations = (languages: string[]) => {
  const base: CmsPageTranslations = {};
  languages.forEach((code) => {
    base[code] = {
      title: "",
      slug: "",
      content: "",
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
  return base;
};

export const useCmsPageTranslations = (
  initial: CmsPage | undefined,
  langCode: string,
  languages: string[]
) => {
  const initialTranslations = useMemo(() => {
    const base = createEmptyTranslations(languages);
    initial?.translations?.forEach((t) => {
      const rawCode = t.language?.code || langCode;
      const code = rawCode === "vn" ? "vi" : rawCode;
      if (!base[code]) return;
      base[code] = {
        title: t.title || "",
        slug: t.slug || "",
        content: typeof t.content === "string" ? t.content : JSON.stringify(t.content || ""),
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
  }, [initial, langCode, languages]);

  const [translations, setTranslations] = useState<CmsPageTranslations>(initialTranslations);

  useEffect(() => {
    setTranslations(initialTranslations);
  }, [initialTranslations]);

  return { translations, setTranslations };
};
