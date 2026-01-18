"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export default function Sidebar({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useAuthStore((state) => state.clearToken);

  const links = [
    { href: `/${lang}/admin/dashboard`, label: t("admin.dashboard") },
    { href: `/${lang}/admin/posts`, label: "Posts" },
    { href: `/${lang}/admin/pages`, label: "Pages" },
    { href: `/${lang}/admin/media`, label: "Media" },
    { href: `/${lang}/admin/leads`, label: t("admin.leads") },
    { href: `/${lang}/admin/pages/home`, label: "Homepage" },
    { href: `/${lang}/admin/settings`, label: "Settings" },
    { href: `/${lang}/admin/users`, label: "Users" },
  ];

  return (
    <aside className="sticky top-10 hidden h-fit w-72 flex-col gap-6 rounded-3xl border border-white/5 bg-[#0f1722] p-6 text-white shadow-[0_20px_60px_rgba(5,10,18,0.45)] lg:flex">
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
        className="w-full"
        onClick={() => {
          clearToken();
          router.replace(`/${lang}/admin/login`);
          router.refresh();
        }}
      >
      {t("admin.logout")}
      </Button>
    </aside>
  );
}
