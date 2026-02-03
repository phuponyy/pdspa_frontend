export type CmsPostTranslationState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaJson?: string;
};

export type CmsPostTranslationsByLang = Record<string, CmsPostTranslationState>;

export type SeoCheck = {
  label: string;
  ok: boolean;
  hint?: string;
};

export type SeoAnalysis = {
  score: number;
  checks: SeoCheck[];
};
