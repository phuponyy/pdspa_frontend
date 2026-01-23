"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUPPORTED_LANGS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isLocalized = SUPPORTED_LANGS.includes(
    segments[0] as (typeof SUPPORTED_LANGS)[number]
  );
  const currentLang = isLocalized ? segments[0] : "en";
  const rest = isLocalized ? segments.slice(1).join("/") : segments.join("/");
  const buildHref = (lang: string) => {
    if (lang === "en") {
      return `/${rest}`.replace(/\/+$/, "") || "/";
    }
    return `/${lang}${rest ? `/${rest}` : ""}`;
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
      {SUPPORTED_LANGS.map((lang) => (
        <Link
          key={lang}
          href={buildHref(lang)}
          className={cn(
            "rounded-full px-2 py-1 transition",
            lang === currentLang
              ? "bg-[var(--accent)] text-white"
              : "hover:text-[var(--accent-strong)]"
          )}
        >
          {lang}
        </Link>
      ))}
    </div>
  );
}
