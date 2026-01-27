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
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminMe, getBookings } from "@/lib/api/admin";
import AdminRequestFeedback from "./AdminRequestFeedback";
import type { Booking } from "@/types/admin-dashboard.types";
import { useTranslation } from "react-i18next";
import { ADMIN_BASE, ADMIN_ROUTES } from "@/lib/admin/constants";

type AccessRule = {
  prefix: string;
  permissions?: string[];
  roles?: string[];
  requireAnyPermission?: boolean;
};

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isLogin = pathname.startsWith(ADMIN_ROUTES.login);
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  const currentLang = adminIndex > 0
    ? segments[0]
    : (i18n.language?.split("-")[0] || "en");

  if (isLogin) {
    return <div className="min-h-screen bg-[var(--mist)]">{children}</div>;
  }

  const breadcrumb = (adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments.slice(2)).map(
    (segment) => segment.replace(/-/g, " ")
  );
  const breadcrumbTrail = ["Admin", ...breadcrumb];
  const displayTrail = breadcrumbTrail.length > 1 ? breadcrumbTrail : ["Admin", "Overview"];
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const navSections = useMemo(
    () =>
      adminNavSections((key: string) => {
        if (key === "admin.leads") return "Leads";
        if (key === "admin.logout") return "Logout";
        return key;
      }),
    []
  );
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(undefined),
  });
  const userName = data?.data?.name || data?.data?.email || "Admin User";
  const avatarUrl = data?.data?.avatarUrl || "/admin-avatar.svg";
  const permissions = data?.data?.permissions || [];
  const effectivePermissions = useMemo(() => {
    if (!permissions.includes("manage_bookings")) return permissions;
    return Array.from(new Set([...permissions, "view_bookings", "edit_bookings"]));
  }, [permissions]);
  const roleKey = data?.data?.roleKey;
  const canViewBookings = effectivePermissions.includes("view_bookings");
  const filteredSections = useMemo(
    () => filterAdminSections(navSections, effectivePermissions, roleKey),
    [navSections, effectivePermissions, roleKey]
  );
  const fullLinks = useMemo(
    () => navSections.flatMap((section) => section.links),
    [navSections]
  );
  const allowedLinks = useMemo(
    () => new Set(filteredSections.flatMap((section) => section.links.map((link) => link.href))),
    [filteredSections]
  );
  const firstAllowedLink = useMemo(() => {
    const links = filteredSections.flatMap((section) => section.links);
    return links.length ? links[0].href : "";
  }, [filteredSections]);

  const adminPath = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const adminIndex = segments.indexOf("admin");
    if (adminIndex === -1) return "";
    return `/${segments.slice(adminIndex).join("/")}`;
  }, [pathname]);

  const isAllowed = useMemo(() => {
    if (!roleKey) return false;
    const rules: AccessRule[] = [
      { prefix: ADMIN_BASE, requireAnyPermission: true },
      { prefix: ADMIN_ROUTES.overview, permissions: ["view_dashboard"] },
      { prefix: ADMIN_ROUTES.dashboard, permissions: ["view_dashboard"] },
      { prefix: ADMIN_ROUTES.analytics, permissions: ["view_dashboard"] },
      { prefix: ADMIN_ROUTES.live, permissions: ["view_live"] },
      { prefix: ADMIN_ROUTES.customers, permissions: ["manage_customers"] },
      { prefix: ADMIN_ROUTES.bookings, permissions: ["view_bookings"] },
      { prefix: ADMIN_ROUTES.leads, roles: ["ADMIN"] },
      { prefix: ADMIN_ROUTES.posts, permissions: ["manage_posts"] },
      { prefix: ADMIN_ROUTES.pages, permissions: ["manage_pages"] },
      { prefix: ADMIN_ROUTES.services, permissions: ["manage_services"] },
      { prefix: ADMIN_ROUTES.media, permissions: ["manage_media"] },
      { prefix: ADMIN_ROUTES.users, permissions: ["manage_users"] },
      { prefix: ADMIN_ROUTES.settings, permissions: ["manage_users"] },
    ] as const;

    const rule = rules
      .filter((item) => adminPath.startsWith(item.prefix))
      .sort((a, b) => b.prefix.length - a.prefix.length)[0];
    if (!rule) return false;
    if (rule.roles?.length && !rule.roles.includes(roleKey)) return false;
    if (rule.permissions?.length) {
      return rule.permissions.every((permission) =>
        effectivePermissions.includes(permission)
      );
    }
    if (rule.requireAnyPermission) {
      return effectivePermissions.length > 0;
    }
    return true;
  }, [adminPath, effectivePermissions, roleKey]);

  const bookingsQuery = useQuery({
    queryKey: ["admin-booking-notifications"],
    queryFn: () =>
      getBookings(
        undefined,
        { status: "NEW", page: 1, limit: 5 },
        { notify: false, timeoutMs: 8000 }
      ),
    enabled: canViewBookings,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  const newBookings = bookingsQuery.data?.items ?? [];
  const totalNewBookings = bookingsQuery.data?.pagination.total ?? newBookings.length;
  const badgeCount = totalNewBookings > 99 ? "99+" : totalNewBookings.toString();
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const openBookingPopup = (booking: Booking) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent<Booking>("admin-booking-open", { detail: booking })
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("admin_lang");
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, [i18n]);

  useEffect(() => {
    if (!roleKey) return;
    const currentLink = fullLinks.find((link) => link.href === pathname);
    const currentAllowed = currentLink ? allowedLinks.has(currentLink.href) : false;
    if (!currentLink && isAllowed) return;
    if (!isAllowed || (currentLink && !currentAllowed)) {
      if (firstAllowedLink && pathname !== firstAllowedLink) {
        router.replace(firstAllowedLink);
      }
    }
  }, [allowedLinks, fullLinks, pathname, roleKey, router, isAllowed, firstAllowedLink]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);
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
  const suggestedResults = useMemo(() => {
    return filteredSections.flatMap((section) =>
      section.links.slice(0, 2).map((link) => ({
        ...link,
        section: section.title,
      }))
    );
  }, [filteredSections]);

  if (isLoading || !roleKey) {
    return <div className="min-h-screen bg-[var(--mist)]" />;
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-[var(--mist)] px-6 py-10 text-white">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 rounded-3xl border border-white/10 bg-[#0f1722] p-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Access Denied</p>
            <h1 className="text-2xl font-semibold text-white">Bạn chưa có quyền truy cập</h1>
            <p className="text-sm text-white/60">
              Tài khoản hiện tại chưa được cấp quyền cho khu vực này. Vui lòng liên hệ quản trị
              viên để cấp thêm quyền.
            </p>
          </div>
          {firstAllowedLink ? (
            <button
              type="button"
              onClick={() => router.replace(firstAllowedLink)}
              className="w-fit cursor-pointer rounded-full border border-white/10 bg-[#111a25] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
            >
              Về trang được phép
            </button>
          ) : (
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Không có quyền nào được gán cho vai trò này.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen">
      <AdminRequestFeedback />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-6 lg:flex-row lg:gap-10 lg:px-10 lg:py-8">
        <Sidebar />
        <main className="flex-1 space-y-8">
          <div className="admin-panel relative z-10 flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/60">
              {displayTrail.map((segment, index) => (
                <span key={`${segment}-${index}`} className={index === 0 ? "text-white/40" : ""}>
                  {index === 0 ? segment.toUpperCase() : `/ ${segment.toUpperCase()}`}
                </span>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {mounted ? (
                <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open search"
                      className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-[#111a25] px-3 text-white/70 transition hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-3.5-3.5" />
                      </svg>
                      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40 lg:inline">
                        Ctrl+K
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Tìm kiếm nhanh</DialogTitle>
                      <DialogDescription>Tìm kiếm nhanh các mục, trang hoặc cài đặt.</DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-3.5-3.5" />
                        </svg>
                      </span>
                      <Input
                        placeholder="Tìm kiếm các mục hoặc cài đặt..."
                        aria-label="Search admin content"
                        autoComplete="off"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-12 rounded-full border-white/5 bg-[#111a25] pl-10 text-white/90 placeholder:text-slate-500"
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                      Gợi ý: nhấn <span className="font-semibold text-white/70">Ctrl+K</span> để mở nhanh.
                    </p>
                    <div className="mt-4 max-h-64 space-y-2 overflow-auto">
                      {searchResults.length ? (
                        searchResults.map((result) => (
                          <button
                            key={result.href}
                            type="button"
                            onClick={() => {
                              router.push(result.href);
                              setIsSearchOpen(false);
                            }}
                            className="flex w-full cursor-auto items-center justify-between rounded-2xl border border-white/5 bg-[#0f1722] px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/5"
                          >
                            <span>{result.label}</span>
                            <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                              {result.section}
                            </span>
                          </button>
                        ))
                      ) : searchQuery.trim() ? (
                        <p className="text-sm text-white/50">Không tìm thấy kết quả phù hợp.</p>
                      ) : (
                        <>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Gợi ý</p>
                          {suggestedResults.map((result) => (
                            <button
                              key={`suggested-${result.href}`}
                              type="button"
                              onClick={() => {
                                router.push(result.href);
                                setIsSearchOpen(false);
                              }}
                              className="flex w-full cursor-auto items-center justify-between rounded-2xl border border-white/5 bg-[#0f1722] px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/5"
                            >
                              <span>{result.label}</span>
                              <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                                {result.section}
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0f1722] p-1">
                {["vi", "en"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(code);
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem("admin_lang", code);
                      }
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
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1722] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff9f40]" />
                {currentLang}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1722] px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]" />
                TRỰC TIẾP
              </div>
              {canViewBookings ? (
                <div ref={notificationsRef} className="relative">
                  <button
                    type="button"
                    aria-label="Booking notifications"
                    onClick={() => setIsNotificationsOpen((open) => !open)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111a25] text-white/70 transition hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                      <path d="M9 17a3 3 0 0 0 6 0" />
                    </svg>
                    {totalNewBookings > 0 ? (
                      <span className="absolute -right-1 -top-1 rounded-full bg-[#ff9f40] px-1.5 py-0.5 text-[10px] font-semibold text-[#1a1410]">
                        {badgeCount}
                      </span>
                    ) : null}
                  </button>
                  {isNotificationsOpen ? (
                    <div className="absolute right-0 top-12 z-[100] w-72 rounded-2xl border border-white/10 bg-[#0f1722] p-3 text-sm text-white/80 shadow-[0_20px_60px_rgba(8,12,20,0.45)]">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-xs uppercase tracking-[0.25em] text-white/50">
                          Thông báo
                        </span>
                        <span className="text-xs text-white/40">
                          {totalNewBookings} tin mới
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {bookingsQuery.isLoading ? (
                          <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-white/60">
                            Loading new bookings...
                          </div>
                        ) : newBookings.length ? (
                          newBookings.map((booking) => (
                            <button
                              key={booking.id}
                              type="button"
                              onClick={() => {
                                openBookingPopup(booking);
                                setIsNotificationsOpen(false);
                                router.push(ADMIN_ROUTES.bookings);
                              }}
                              className="w-full rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                            >
                              <div className="text-sm font-semibold text-white">
                                {booking.customer?.name || "New customer"}
                              </div>
                              <div className="text-xs text-white/60">
                                {booking.service?.key || "Service"} ·{" "}
                                {dateFormatter.format(new Date(booking.scheduledAt))}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-white/60">
                            No new bookings yet.
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          router.push(ADMIN_ROUTES.bookings);
                        }}
                        className="mt-3 cursor-pointer flex w-full items-center justify-center rounded-full border border-white/10 bg-[#111a25] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
                      >
                        Xem
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="group relative flex items-center gap-2">
                <img
                  src={avatarUrl}
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
