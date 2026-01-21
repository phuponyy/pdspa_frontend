"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import Sidebar from "./Sidebar";

export default function AdminShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname.includes("/admin/login");

  if (isLogin) {
    return <div className="min-h-screen bg-[var(--mist)]">{children}</div>;
  }

  const segments = pathname.split("/").filter(Boolean);
  const currentLang = segments[0] || lang;
  const restPath = segments.slice(1).join("/");
  const newPostHref = `/${lang}/admin/posts/new`;
  const breadcrumb = segments.slice(2).map((segment) => segment.replace(/-/g, " "));

  return (
    <div className="admin-shell min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:flex-row lg:gap-10 lg:px-10 lg:py-10">
        <Sidebar lang={lang} />
        <main className="flex-1 space-y-8">
          <div className="admin-panel flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M4 12h10M4 17h7" />
                  </svg>
                </span>
                <span className="hidden text-white/80 lg:inline">Admin Command Center</span>
              </div>
              <div className="hidden items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 lg:flex">
                <span>Admin</span>
                {breadcrumb.map((segment) => (
                  <span key={segment} className="text-white/60">
                    / {segment}
                  </span>
                ))}
              </div>
              <div className="relative w-full max-w-xl">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                </span>
                <Input
                  placeholder="Search content, leads, or settings..."
                  aria-label="Search admin content"
                  autoComplete="off"
                  className="h-11 rounded-2xl border-white/5 bg-[#111a25] pl-10 text-white/90 placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={newPostHref}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#2f7bff] px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(47,123,255,0.35)] hover:bg-[#2a6fe6]"
              >
                <span className="text-base">+</span>
                New Post
              </Link>
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0f1722] p-1">
                {["vn", "en"].map((code) => (
                  <Link
                    key={code}
                    href={`/${code}${restPath ? `/${restPath}` : ""}`}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      currentLang === code
                        ? "bg-[#2f7bff] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {code.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
