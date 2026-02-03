export type CmsPageTranslation = {
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaJson?: string;
};

export type CmsPageTranslations = Record<string, CmsPageTranslation>;

export type CmsPageStatus = "DRAFT" | "PUBLISHED";
