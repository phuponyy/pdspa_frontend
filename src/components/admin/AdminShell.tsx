"use client";

import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import Sidebar, { adminNavSections, filterAdminSections } from "./Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminMe } from "@/lib/api/admin";

export default function AdminShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname.includes("/admin/login");

  if (isLogin) {
    return <div className="min-h-screen bg-[var(--mist)]">{children}</div>;
  }

  const segments = pathname.split("/").filter(Boolean);
  const currentLang = segments[0] || lang;
  const restPath = segments.slice(1).join("/");
  const breadcrumb = segments
    .slice(2)
    .map((segment) => segment.replace(/-/g, " "));
  const breadcrumbTrail = ["Admin", ...breadcrumb];
  const displayTrail = breadcrumbTrail.length > 1 ? breadcrumbTrail : ["Admin", "Overview"];
  const userName = "Admin User";
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const navSections = useMemo(
    () =>
      adminNavSections(lang, (key: string) => {
        if (key === "admin.leads") return "Leads";
        if (key === "admin.logout") return "Logout";
        return key;
      }),
    [lang]
  );
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(undefined),
  });
  const permissions = data?.data?.permissions || [];
  const roleKey = data?.data?.roleKey;
  const filteredSections = useMemo(
    () => filterAdminSections(navSections, permissions, roleKey),
    [navSections, permissions, roleKey]
  );
  const fullLinks = useMemo(
    () => navSections.flatMap((section) => section.links),
    [navSections]
  );
  const allowedLinks = useMemo(
    () => new Set(filteredSections.flatMap((section) => section.links.map((link) => link.href))),
    [filteredSections]
  );

  const adminPath = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) return "";
    return `/${segments.slice(1).join("/")}`;
  }, [pathname]);

  const isAllowed = useMemo(() => {
    if (!roleKey) return false;
    const rules = [
      { prefix: "/admin", permissions: ["view_dashboard"] },
      { prefix: "/admin/overview", permissions: ["view_dashboard"] },
      { prefix: "/admin/dashboard", permissions: ["view_dashboard"] },
      { prefix: "/admin/analytics", permissions: ["view_dashboard"] },
      { prefix: "/admin/live", permissions: ["view_live"] },
      { prefix: "/admin/customers", permissions: ["manage_customers"] },
      { prefix: "/admin/bookings", permissions: ["manage_bookings"] },
      { prefix: "/admin/leads", roles: ["ADMIN"] },
      { prefix: "/admin/posts", permissions: ["manage_posts"] },
      { prefix: "/admin/pages", permissions: ["manage_pages"] },
      { prefix: "/admin/media", permissions: ["manage_media"] },
      { prefix: "/admin/users", permissions: ["manage_users"] },
      { prefix: "/admin/settings", permissions: ["manage_users"] },
    ] as const;

    const rule = rules.find((item) => adminPath.startsWith(item.prefix));
    if (!rule) return false;
    if (rule.roles?.length && !rule.roles.includes(roleKey)) return false;
    if (rule.permissions?.length) {
      return rule.permissions.every((permission) =>
        permissions.includes(permission)
      );
    }
    return true;
  }, [adminPath, permissions, roleKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!roleKey) return;
    const currentLink = fullLinks.find((link) => link.href === pathname);
    if (!currentLink && isAllowed) return;
    if (!isAllowed || (currentLink && !allowedLinks.has(currentLink.href))) {
      router.replace(`/${lang}/admin/overview`);
    }
  }, [allowedLinks, fullLinks, pathname, roleKey, router, lang, isAllowed]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return filteredSections
      .flatMap((section) =>
        section.links.map((link) => ({
          ...link,
          section: section.title,
        }))
      )
      .filter((link) => link.label.toLowerCase().includes(query));
  }, [navSections, searchQuery]);

  if (isLoading || !roleKey) {
    return <div className="min-h-screen bg-[var(--mist)]" />;
  }

  if (!isAllowed) {
    return <div className="min-h-screen bg-[var(--mist)]" />;
  }

  return (
    <div className="admin-shell min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-6 lg:flex-row lg:gap-10 lg:px-10 lg:py-8">
        <Sidebar lang={lang} />
        <main className="flex-1 space-y-8">
          <div className="admin-panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/60">
              {displayTrail.map((segment, index) => (
                <span key={`${segment}-${index}`} className={index === 0 ? "text-white/40" : ""}>
                  {index === 0 ? segment.toUpperCase() : `/ ${segment.toUpperCase()}`}
                </span>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {mounted ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open search"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111a25] text-white/70 transition hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-3.5-3.5" />
                      </svg>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Search</DialogTitle>
                      <DialogDescription>Find sections, pages, or settings quickly.</DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-3.5-3.5" />
                        </svg>
                      </span>
                      <Input
                        placeholder="Search sections or settings..."
                        aria-label="Search admin content"
                        autoComplete="off"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-12 rounded-full border-white/5 bg-[#111a25] pl-10 text-white/90 placeholder:text-slate-500"
                      />
                    </div>
                    <div className="mt-4 max-h-64 space-y-2 overflow-auto">
                      {searchResults.length ? (
                        searchResults.map((result) => (
                          <button
                            key={result.href}
                            type="button"
                            onClick={() => {
                              router.push(result.href);
                            }}
                            className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-[#0f1722] px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/5"
                          >
                            <span>{result.label}</span>
                            <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                              {result.section}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-white/50">Type to search sidebar pages.</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0f1722] p-1">
                {["vn", "en"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      const next = `/${code}${restPath ? `/${restPath}` : ""}`;
                      router.push(next);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      currentLang === code
                        ? "bg-[#ff9f40] text-[#1a1410]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1722] px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]" />
                Autosaved 2m ago
              </div>
              <div className="group relative flex items-center gap-2">
                <img
                  src="/admin-avatar.svg"
                  alt={userName}
                  className="h-10 w-10 rounded-full border border-white/10 object-cover"
                />
                <span className="pointer-events-none absolute right-0 top-12 rounded-full border border-white/10 bg-[#111a25] px-3 py-1 text-xs text-white/80 opacity-0 transition group-hover:opacity-100">
                  {userName}
                </span>
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
