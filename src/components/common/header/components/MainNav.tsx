import Link from "next/link";
import Button from "../../Button";
import { cn } from "@/lib/utils/cn";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
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
}: MainNavProps) => {
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
            <Button className="hidden px-7 py-3 text-base md:inline-flex" onClick={onOpenBooking}>
              {fixedT("hero.ctaPrimary")}
            </Button>
            <Link
              href={ADMIN_ROUTES.login}
              className={cn(
                "hidden text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)] hover:text-[var(--accent-strong)] md:inline-flex"
              )}
            >
              {fixedT("nav.admin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
