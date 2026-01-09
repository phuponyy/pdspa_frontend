"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUPPORTED_LANGS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentLang = segments[0] || "vn";
  const rest = segments.slice(1).join("/");

  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
      {SUPPORTED_LANGS.map((lang) => (
        <Link
          key={lang}
          href={`/${lang}${rest ? `/${rest}` : ""}`}
          className={cn(
            "rounded-full px-2 py-1 transition",
            lang === currentLang
              ? "bg-[var(--jade)] text-white"
              : "hover:text-[var(--jade)]"
          )}
        >
          {lang}
        </Link>
      ))}
    </div>
  );
}
