export const SUPPORTED_LANGS = ["vi", "en"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: SupportedLang =
  (process.env.NEXT_PUBLIC_DEFAULT_LANG as SupportedLang) || "en";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pandaspa.vn";

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "Panda Spa Da Nang";

export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Massage & spa rituals inspired by the calming energy of Da Nang.";

export const HOTLINE =
  process.env.NEXT_PUBLIC_HOTLINE || "0909 000 000";

export const HOTLINE_SECONDARY =
  process.env.NEXT_PUBLIC_HOTLINE_SECONDARY || "083 396 7775";

export const SPA_ADDRESS =
  process.env.NEXT_PUBLIC_SPA_ADDRESS ||
  "229 & 225 Nguyen Van Thoai, Son Tra, Da Nang";

export const SPA_HOURS =
  process.env.NEXT_PUBLIC_SPA_HOURS || "09 AM - 23h45 PM";

