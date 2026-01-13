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
    { href: `/${lang}/admin/posts`, label: "Posts" },
    { href: `/${lang}/admin/pages`, label: "Pages" },
    { href: `/${lang}/admin/media`, label: "Media" },
    { href: `/${lang}/admin/leads`, label: dict.admin.leads },
    { href: `/${lang}/admin/pages/home`, label: "Homepage" },
    { href: `/${lang}/admin/settings`, label: "Settings" },
    { href: `/${lang}/admin/users`, label: "Users" },
  ];

  return (
    <aside className="sticky top-10 hidden h-fit w-72 flex-col gap-6 rounded-3xl border border-[var(--line)] bg-[#111111] p-6 text-white shadow-[var(--shadow)] lg:flex">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
          Panda Spa
        </p>
        <p className="text-lg font-semibold text-white">CMS Console</p>
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-2xl px-4 py-2 font-medium transition",
              pathname === link.href
                ? "bg-[rgba(255,255,255,0.12)] text-white"
                : "text-[rgba(255,255,255,0.7)] hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button
        variant="outline"
        className="border-white/30 text-white hover:border-white"
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
