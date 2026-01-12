"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import Button from "../common/Button";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils/cn";

export default function Sidebar({ lang }: { lang: string }) {
  const dict = getDictionary(lang);
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useAuthStore((state) => state.clearToken);

  const links = [
    { href: `/${lang}/admin/dashboard`, label: dict.admin.dashboard },
    { href: `/${lang}/admin/leads`, label: dict.admin.leads },
    { href: `/${lang}/admin/pages/home`, label: dict.admin.pageEditor },
  ];

  return (
    <aside className="sticky top-10 hidden h-fit w-64 flex-col gap-6 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] lg:flex">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
          Panda Spa
        </p>
        <p className="text-lg font-semibold text-[var(--ink)]">
          Admin Console
        </p>
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-2xl px-4 py-2 font-medium text-[var(--ink-muted)] transition",
              pathname === link.href
                ? "bg-[rgba(31,107,95,0.1)] text-[var(--jade)]"
                : "hover:text-[var(--jade)]"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button
        variant="outline"
        onClick={() => {
          clearToken();
          router.replace(`/${lang}/admin/login`);
          router.refresh();
        }}
      >
        {dict.admin.logout}
      </Button>
    </aside>
  );
}
