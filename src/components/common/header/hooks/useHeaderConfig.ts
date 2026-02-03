import { useEffect, useMemo, useState } from "react";
import { getSiteConfig } from "@/lib/api/public";
import {
  HOTLINE,
  HOTLINE_SECONDARY,
  SPA_ADDRESS,
  SPA_HOURS,
} from "@/lib/constants";
import { API_BASE_URL } from "@/lib/constants";
import type { NavItem, TopBarConfig } from "../types";

const buildPublicHref = (lang: string, path: string) => {
  if (lang === "en") {
    return `/${path}`.replace(/\/+$/, "") || "/";
  }
  return `/${lang}${path ? `/${path}` : ""}`;
};

export const useHeaderConfig = (lang: string, fixedT: (key: string) => string, enabled: boolean) => {
  const defaultLinks = useMemo<NavItem[]>(
    () => [
      { href: buildPublicHref(lang, ""), label: fixedT("nav.home") },
      { href: buildPublicHref(lang, "good-massage-in-da-nang"), label: fixedT("nav.about") },
      { href: buildPublicHref(lang, "dich-vu"), label: fixedT("nav.services") },
      { href: buildPublicHref(lang, "price-list"), label: fixedT("nav.price") },
      {
        href: buildPublicHref(lang, lang === "vi" ? "tin-tuc" : "tin-tuc"),
        label: fixedT("nav.news"),
      },
      { href: buildPublicHref(lang, "contact"), label: fixedT("nav.contact") },
    ],
    [lang, fixedT]
  );

  const [links, setLinks] = useState<NavItem[]>(defaultLinks);
  const [topBar, setTopBar] = useState<TopBarConfig>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    const loadConfig = async () => {
      try {
        setLinks(defaultLinks);
        const response = await getSiteConfig();
        const config = response?.data ?? {};
        const raw = config[`navbar_${lang}`] || (lang === "vi" ? config.navbar_vn : undefined);
        if (!raw) {
          setLinks(defaultLinks);
        } else {
          const parsed = JSON.parse(raw) as NavItem[];
          if (!Array.isArray(parsed) || !parsed.length) {
            setLinks(defaultLinks);
          } else if (active) {
            setLinks(
              parsed.map((item) => ({
                label: String(item.label || ""),
                href: String(item.href || ""),
              }))
            );
          }
        }

        if (active) {
          setTopBar({
            address:
              config[`topbar_address_${lang}`] ||
              (lang === "vi" ? config.topbar_address_vn : undefined) ||
              SPA_ADDRESS,
            hours:
              config[`topbar_hours_${lang}`] ||
              (lang === "vi" ? config.topbar_hours_vn : undefined) ||
              SPA_HOURS,
            phonePrimary:
              config[`topbar_phone_primary_${lang}`] ||
              (lang === "vi" ? config.topbar_phone_primary_vn : undefined) ||
              HOTLINE,
            phoneSecondary:
              config[`topbar_phone_secondary_${lang}`] ||
              (lang === "vi" ? config.topbar_phone_secondary_vn : undefined) ||
              HOTLINE_SECONDARY,
          });
          const rawLogo = config.site_logo_url as string | undefined;
          if (rawLogo) {
            setLogoUrl(rawLogo.startsWith("/") ? `${API_BASE_URL}${rawLogo}` : rawLogo);
          } else {
            setLogoUrl(null);
          }
        }
      } catch {
        if (active) {
          setLinks(defaultLinks);
          setTopBar({
            address: SPA_ADDRESS,
            hours: SPA_HOURS,
            phonePrimary: HOTLINE,
            phoneSecondary: HOTLINE_SECONDARY,
          });
          setLogoUrl(null);
        }
      }
    };

    loadConfig();
    return () => {
      active = false;
    };
  }, [lang, defaultLinks, enabled]);

  const buildHref = (path: string) => buildPublicHref(lang, path);

  return { links, topBar, logoUrl, buildPublicHref: buildHref };
};
