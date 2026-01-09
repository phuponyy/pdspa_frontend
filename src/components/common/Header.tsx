"use client";

import Link from "next/link";
import Button from "./Button";
import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

export default function Header({
  lang,
  hotline,
  className,
}: {
  lang: string;
  hotline?: string;
  className?: string;
}) {
  const dict = getDictionary(lang);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-[rgba(230,221,210,0.6)] bg-[rgba(251,248,243,0.8)] backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-[var(--ink)]">
            Panda Spa
          </span>
          <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            since 2014
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--ink-muted)] md:flex">
          <Link href={`/${lang}`} className="hover:text-[var(--jade)]">
            {dict.nav.home}
          </Link>
          <a href="#services" className="hover:text-[var(--jade)]">
            {dict.nav.services}
          </a>
          <a href="#contact" className="hover:text-[var(--jade)]">
            {dict.nav.contact}
          </a>
          <Link href={`/${lang}/admin/login`} className="hover:text-[var(--jade)]">
            {dict.nav.admin}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button
            variant="outline"
            className="hidden md:inline-flex"
            onClick={() => {
              if (hotline && typeof window !== "undefined") {
                window.location.href = `tel:${hotline}`;
              }
            }}
          >
            {hotline || "Hotline"}
          </Button>
        </div>
      </div>
    </header>
  );
}
