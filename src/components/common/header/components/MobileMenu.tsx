import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "../types";

const defaultSearchLabel = {
  vi: "Tìm kiếm menu...",
  en: "Search menu...",
};

export type MobileMenuProps = {
  lang: string;
  isOpen: boolean;
  onClose: () => void;
  links: NavItem[];
  isActive: (href: string) => boolean;
  query: string;
  setQuery: (value: string) => void;
};

export const MobileMenu = ({
  lang,
  isOpen,
  onClose,
  links,
  isActive,
  query,
  setQuery,
}: MobileMenuProps) => {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[90] bg-black/50 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-[100] h-full w-72 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={lang === "vi" ? defaultSearchLabel.vi : defaultSearchLabel.en}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-full border border-black/10 bg-white pl-9 pr-3 text-sm text-black/70"
            />
          </div>
          <nav className="mt-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold transition",
                  isActive(link.href)
                    ? "bg-[var(--accent-strong)] text-white"
                    : "text-[var(--ink-muted)] hover:bg-black/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!links.length ? <p className="text-sm text-[var(--ink-muted)]">No results.</p> : null}
          </nav>
        </div>
      </aside>
    </>
  );
};
