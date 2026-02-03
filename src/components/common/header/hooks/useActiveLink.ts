import { useMemo } from "react";
import { SUPPORTED_LANGS } from "@/lib/constants";

export const useActiveLink = (pathname: string, lang: string) => {
  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  const currentLang = SUPPORTED_LANGS.includes(segments[0] as "vi" | "en")
    ? segments[0]
    : "en";
  const restPath = SUPPORTED_LANGS.includes(segments[0] as "vi" | "en")
    ? segments.slice(1).join("/")
    : segments.join("/");

  const buildLangSwitcherHref = (code: string) => {
    if (code === "en") {
      return `/${restPath}`.replace(/\/+$/, "") || "/";
    }
    return `/${code}${restPath ? `/${restPath}` : ""}`;
  };

  const normalizePath = (value: string) => {
    let path = value.trim();
    if (!path) return "/";
    if (!path.startsWith("/")) {
      try {
        path = new URL(path).pathname;
      } catch {
        path = `/${path}`;
      }
    }
    path = path.replace(/\/+$/, "");
    return path || "/";
  };

  const isActive = (href: string) => {
    const current = normalizePath(pathname);
    const raw = normalizePath(href);
    const isRoot =
      raw === "/" || raw === `/${lang}` || (lang === "vi" && raw === "/vi") || (lang === "en" && raw === "/en");
    if (isRoot) {
      return current === "/" || current === `/${lang}`;
    }
    const candidates = new Set([raw]);
    if (lang === "vi" && raw !== "/" && !raw.startsWith("/vi")) {
      candidates.add(`/vi${raw}`);
    }
    if (lang === "en" && raw.startsWith("/en/")) {
      candidates.add(raw.replace(/^\/en/, "") || "/");
    }
    return Array.from(candidates).some((candidate) => current === candidate || current.startsWith(`${candidate}/`));
  };

  return { currentLang, buildLangSwitcherHref, isActive };
};
