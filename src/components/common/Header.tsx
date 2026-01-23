"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import {
  HOTLINE,
  HOTLINE_SECONDARY,
  SPA_ADDRESS,
  SPA_HOURS,
  SUPPORTED_LANGS,
} from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { getSiteConfig } from "@/lib/api/public";

type NavItem = { label: string; href: string };
type TopBarConfig = {
  address?: string;
  hours?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
};

export default function Header({
  lang,
  hotline,
  className,
}: {
  lang: string;
  hotline?: string;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const fixedT = useMemo(() => i18n.getFixedT(lang), [i18n, lang]);
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("/admin");
  const [hideTopBar, setHideTopBar] = useState(false);
  const lastScroll = useRef(0);
  const lastToggle = useRef(0);
  const rafRef = useRef<number | null>(null);
  const buildPublicHref = (path: string) => {
    if (lang === "en") {
      return `/${path}`.replace(/\/+$/, "") || "/";
    }
    return `/${lang}${path ? `/${path}` : ""}`;
  };
  const defaultLinks = useMemo(
    () => [
      { href: buildPublicHref(""), label: fixedT("nav.home") },
      { href: buildPublicHref("good-massage-in-da-nang"), label: fixedT("nav.about") },
      { href: buildPublicHref("dich-vu"), label: fixedT("nav.services") },
      { href: buildPublicHref("price-list"), label: fixedT("nav.price") },
      { href: buildPublicHref("news"), label: fixedT("nav.news") },
      { href: buildPublicHref("contact"), label: fixedT("nav.contact") },
    ],
    [lang, fixedT]
  );
  const [links, setLinks] = useState<NavItem[]>(defaultLinks);
  const [topBar, setTopBar] = useState<TopBarConfig>({});

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }
    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        const current = Math.max(window.scrollY, 0);
        const isScrollingDown = current > lastScroll.current;
        const distance = Math.abs(current - lastToggle.current);

        if (current < 120) {
          setHideTopBar(false);
          lastToggle.current = current;
        } else if (distance > 80) {
          setHideTopBar(isScrollingDown);
          lastToggle.current = current;
        }

        lastScroll.current = current;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }
    let active = true;
    const loadConfig = async () => {
      try {
        setLinks(defaultLinks);
        const response = await getSiteConfig();
        const config = response?.data ?? {};
        const raw =
          config[`navbar_${lang}`] || (lang === "vi" ? config.navbar_vn : undefined);
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
        }
      }
    };

    loadConfig();
    return () => {
      active = false;
    };
  }, [lang, defaultLinks, isAdminRoute]);

  const segments = pathname.split("/").filter(Boolean);
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

  const isActive = (href: string) => {
    if (href === "/" || href === `/${lang}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  const navLinkClass = (active: boolean) =>
    cn(
      "transition",
      active
        ? "text-[var(--accent-strong)]"
        : "text-[rgba(0,0,0,0.55)] hover:text-[rgba(0,0,0,0.9)]"
    );

  if (isAdminRoute) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-black transition-[padding] duration-300 bg-transparent py-10",
        hideTopBar ? "m-[10px]" : "pt-0",
        className
      )}
    >
      <div
        className={cn(
          "hidden text-sm text-white transition-all duration-300 md:block",
          hideTopBar ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-8 px-6 py-3 lg:px-10">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>{topBar.address || SPA_ADDRESS}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v5l3 2" />
            </svg>
            <span>Working Time: {topBar.hours || SPA_HOURS}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.9 19.9 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.9 19.9 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 13 13 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1l-1.2 1.2a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
            </svg>
            <span>{topBar.phonePrimary || hotline || HOTLINE}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.9 19.9 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.9 19.9 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 13 13 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1l-1.2 1.2a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
            </svg>
            <span>{topBar.phoneSecondary || HOTLINE_SECONDARY}</span>
          </div>
          <div className="flex items-center gap-2">
              {[
                { code: "vi", label: "VI" },
                { code: "en", label: "EN" },
              ].map((item) => (
                <Link
                  key={item.code}
                  href={buildLangSwitcherHref(item.code)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition",
                    item.code === currentLang
                    ? "border-white text-white"
                    : "border-[rgba(255,255,255,0.4)] text-[rgba(255,255,255,0.7)] hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-transparent">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex flex-1 items-center justify-between gap-8 rounded-full bg-white px-8 py-2 shadow-[0_18px_40px_rgba(255,106,61,0.4)]">
            <Link href={buildPublicHref("")} className="flex items-center gap-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F5617c6399e7e490498e90123ca427448%2F579ea19fe5e6468982aa7d2e2790f9f4"
                alt="Panda Spa"
                className="h-14 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            <nav className="hidden items-center gap-9 text-base font-semibold text-black md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={navLinkClass(isActive(link.href))}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden h-12 w-12 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] text-[var(--accent-strong)] transition hover:border-[var(--accent-strong)] md:inline-flex"
                aria-label="Search"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-3.5-3.5" />
                </svg>
              </button>
              <Button
                className="hidden px-7 py-3 text-base md:inline-flex"
                onClick={() => {
                  const line = hotline || HOTLINE;
                  if (line && typeof window !== "undefined") {
                    window.location.href = `tel:${line}`;
                  }
                }}
              >
                Booking
              </Button>
              <Link
                href={`/${lang === "en" ? "en" : lang}/admin/login`}
                className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)] hover:text-[var(--accent-strong)] md:inline-flex"
              >
                {fixedT("nav.admin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
