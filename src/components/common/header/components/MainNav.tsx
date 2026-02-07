"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "../types";

export type MainNavProps = {
  logoUrl?: string | null;
  links: NavItem[];
  isActive: (href: string) => boolean;
  navLinkClass: (active: boolean) => string;
  onOpenMobileMenu: () => void;
  onOpenBooking: () => void;
  fixedT: (key: string) => string;
  buildPublicHref: (path: string) => string;
  currentLang: string;
  buildLangSwitcherHref: (lang: string) => string;
};

export const MainNav = ({
  logoUrl,
  links,
  isActive,
  navLinkClass,
  onOpenMobileMenu,
  onOpenBooking,
  fixedT,
  buildPublicHref,
  currentLang,
  buildLangSwitcherHref,
}: MainNavProps) => {
  const router = useRouter();
  const nextLang = currentLang === "vi" ? "en" : "vi";
  const langLabel = currentLang === "vi" ? "VI" : "EN";
  const handleLangChange = (value: string) => {
    if (!value || value === currentLang) return;
    router.push(buildLangSwitcherHref(value));
  };
  return (
    <div className="bg-transparent">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <div className="relative flex flex-1 items-center justify-between gap-8 rounded-full bg-white px-4 py-2 shadow-[0_18px_40px_rgba(255,106,61,0.4)] md:static md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black md:hidden"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </button>
            <Link
              href={buildPublicHref("")}
              className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 md:static md:translate-x-0"
            >
              <img
                src={
                  logoUrl ||
                  "https://cdn.builder.io/api/v1/image/assets%2F5617c6399e7e490498e90123ca427448%2F579ea19fe5e6468982aa7d2e2790f9f4"
                }
                alt="Panda Spa"
                className="h-14 w-auto object-contain"
                loading="lazy"
              />
            </Link>
          </div>
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
            <div className="md:hidden">
              <Select value={currentLang} onValueChange={handleLangChange}>
                <SelectTrigger
                  aria-label="Switch language"
                  data-theme="light"
                  className="h-9 w-[70px] rounded-full px-3 text-[12px] font-semibold shadow-none"
                >
                  <SelectValue className="text-black">{langLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent data-theme="light" className="z-[90] min-w-[120px]">
                  <SelectItem value="vi" className="!text-black">
                    🇻🇳
                  </SelectItem>
                  <SelectItem value="en" className="!text-black">
                    🇺🇸
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              className="!hidden rounded-full bg-[linear-gradient(135deg,#ff7a45,#ffa14a)] px-7 py-3 text-base text-white shadow-[0_16px_36px_rgba(255,122,69,0.35)] hover:brightness-110 md:!inline-flex"
              onClick={onOpenBooking}
            >
              {fixedT("hero.ctaPrimary")}
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-2 flex w-full max-w-3xl items-center justify-center gap-4 overflow-x-auto overflow-y-visible pb-1 text-white md:hidden">
        <Link
          href={buildPublicHref("")}
          className="flex h-12 w-12 items-center justify-center rounded-full text-white/80"
          aria-label="Home"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z" />
          </svg>
        </Link>
        {links
          .filter((link) =>
            ["/dich-vu", "/price-list", "/contact"].some((path) => link.href.includes(path))
          )
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[14px] font-semibold text-white transition hover:brightness-110"
            >
              {link.label}
            </Link>
          ))}
        <Button
          className="rounded-full bg-[linear-gradient(135deg,#ff7a45,#ffa14a)] px-3 py-1 text-sm text-white shadow-[0_16px_36px_rgba(255,122,69,0.35)] hover:brightness-110"
          onClick={onOpenBooking}
        >
          {fixedT("hero.ctaPrimary")}
        </Button>
      </div>
    </div>
  );
};
