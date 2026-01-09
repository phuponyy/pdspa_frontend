export const SUPPORTED_LANGS = ["vn", "en"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: SupportedLang =
  (process.env.NEXT_PUBLIC_DEFAULT_LANG as SupportedLang) || "vn";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pandaspa.vn";
