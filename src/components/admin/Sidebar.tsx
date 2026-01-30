"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import { useQuery } from "@tanstack/react-query";
import { getAdminMe } from "@/lib/api/admin";
import { apiFetch } from "@/lib/api/client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type AdminNavLink = {
  href: string;
  label: string;
  icon: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
};

type AdminNavSection = {
  title: string;
  links: AdminNavLink[];
};

export const adminNavSections = (t: (key: string) => string): AdminNavSection[] => [
    {
      title: "Số Liệu",
      links: [
        {
          href: ADMIN_ROUTES.overview,
          label: "Tổng Quan",
          requiredPermissions: ["view_dashboard"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 11h7V4H4zM13 20h7v-7h-7zM4 20h7v-7H4zM13 11h7V4h-7z" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.live,
          label: "Live",
          requiredPermissions: ["view_live"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h3l2 3 4-6 3 4h4" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.analytics,
          label: "Thống Kê",
          requiredPermissions: ["view_dashboard"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20V6M10 20V10M16 20v-6M22 20H2" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.observability,
          label: "Observability",
          requiredPermissions: ["view_dashboard"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h3l2 3 4-6 3 4h4" />
              <path d="M4 20h16" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Quản lý khách",
      links: [
        {
          href: ADMIN_ROUTES.customers,
          label: "Khách hàng",
          requiredPermissions: ["manage_customers"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.bookings,
          label: "Đặt lịch",
          requiredPermissions: ["view_bookings"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.leads,
          label: t("admin.leads"),
          requiredRoles: ["ADMIN"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Nội dung",
      links: [
        {
          href: ADMIN_ROUTES.posts,
          label: "Bài viết",
          requiredPermissions: ["manage_posts"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 5h16M4 12h16M4 19h10" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.services,
          label: "Dịch vụ",
          requiredPermissions: ["manage_services"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 4h10l2 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z" />
              <path d="M7 8h10" />
              <path d="M9 12h6" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.pages,
          label: "Trang",
          requiredPermissions: ["manage_pages"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h9l5 5v11H6z" />
              <path d="M15 4v5h5" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.media,
          label: "Ảnh",
          requiredPermissions: ["manage_media"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 15l3-3 3 3 4-4 3 3" />
            </svg>
          ),
        },
        {
          href: `${ADMIN_ROUTES.pages}/home`,
          label: "Trang Chủ",
          requiredPermissions: ["manage_pages"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "SEO",
      links: [
        {
          href: ADMIN_ROUTES.seoRedirects,
          label: "Redirects",
          requiredPermissions: ["manage_redirects"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 7h10v4" />
              <path d="M17 7l-3 3" />
              <path d="M17 17H7v-4" />
              <path d="M7 17l3-3" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.seoBrokenLinks,
          label: "Broken Links",
          requiredPermissions: ["manage_broken_links"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.1 0l2.2-2.2a5 5 0 1 0-7.1-7.1l-1.2 1.2" />
              <path d="M14 11a5 5 0 0 0-7.1 0L4.7 13.2a5 5 0 0 0 7.1 7.1l1.2-1.2" />
              <path d="M8 12h8" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.seoKeywords,
          label: "Keyword Tracking",
          requiredPermissions: ["manage_keywords"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-3.5-3.5" />
              <path d="M8 11h6" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Cài Đặt Chung",
      links: [
        {
          href: ADMIN_ROUTES.settings,
          label: "Cài đặt",
          requiredPermissions: ["manage_users"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l2.1 4.5 5 .7-3.6 3.5.9 5-4.4-2.3-4.4 2.3.9-5L4.9 7.2l5-.7L12 2z" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.roles,
          label: "Quyền",
          requiredPermissions: ["manage_users"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.users,
          label: "Người dùng",
          requiredPermissions: ["manage_users"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 14a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
              <path d="M4 20a8 8 0 0 1 12-6.9" />
              <path d="M18 10h4" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "AUTH",
      links: [
        {
          href: ADMIN_ROUTES.securityWhitelist,
          label: "WhiteList IP",
          requiredPermissions: ["manage_security"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.securityBlacklist,
          label: "BlackList IP",
          requiredPermissions: ["manage_security"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z" />
              <path d="M8 12h8" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.securitySessions,
          label: "Phiên đăng nhập",
          requiredPermissions: ["manage_security"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M7 8h10M7 12h6" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.securityMfa,
          label: "MFA / 2FA",
          requiredPermissions: ["manage_security"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15" r="1.5" />
            </svg>
          ),
        },
        {
          href: ADMIN_ROUTES.securityAudit,
          label: "Audit Log",
          requiredPermissions: ["manage_security"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h12l4 4v12a2 2 0 0 1-2 2H4z" />
              <path d="M8 12h8M8 16h6M8 8h4" />
            </svg>
          ),
        },
      ],
    },
  ];

export const filterAdminSections = (
  sections: AdminNavSection[],
  permissions: string[],
  roleKey?: string
) => {
  const normalizedPermissions = new Set(permissions);
  return sections
    .map((section) => {
      const links = section.links.filter((link) => {
        if (link.requiredRoles?.length && roleKey) {
          if (!link.requiredRoles.includes(roleKey)) return false;
        } else if (link.requiredRoles?.length) {
          return false;
        }
        if (!link.requiredPermissions?.length) return true;
        return link.requiredPermissions.every((permission) =>
          normalizedPermissions.has(permission)
        );
      });
      return { ...section, links };
    })
    .filter((section) => section.links.length > 0);
};
export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement | null>(null);
  const navSections = useMemo(() => adminNavSections(t), [t]);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(undefined),
  });
  const permissions = data?.data?.permissions || [];
  const effectivePermissions = permissions.includes("manage_bookings")
    ? Array.from(new Set([...permissions, "view_bookings", "edit_bookings"]))
    : permissions;
  const roleKey = data?.data?.roleKey;
  const userName = data?.data?.name || data?.data?.email || "Admin";
  const avatarUrl = data?.data?.avatarUrl || "/admin-avatar.svg";
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const filteredSections = roleKey
    ? filterAdminSections(navSections, effectivePermissions, roleKey)
    : [];
  const sectionsWithActive = useMemo(
    () =>
      filteredSections.map((section) => ({
        ...section,
        hasActive: section.links.some((link) => pathname === link.href),
      })),
    [filteredSections, pathname]
  );

  useEffect(() => {
    setOpenSections((prev) => {
      let changed = false;
      const next = { ...prev };
      sectionsWithActive.forEach((section) => {
        if (!(section.title in next)) {
          next[section.title] = true;
          changed = true;
        }
        if (section.hasActive && next[section.title] === false) {
          next[section.title] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [sectionsWithActive]);
  const clearClientSession = () => {
    if (typeof window === "undefined") return;
    try {
      const prefixes = ["cms-post-draft-", "cms-page-draft-"];
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        if (prefixes.some((prefix) => key.startsWith(prefix))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // ignore storage cleanup errors
    }
    try {
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0]?.trim();
        if (!name) return;
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      });
    } catch {
      // HttpOnly cookies are cleared by backend logout
    }
  };

  const handleNavKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const container = navRef.current;
    if (!container) return;
    const focusableLinks = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('[data-admin-nav-link="true"]')
    ).filter((item) => item.tabIndex >= 0);

    if (!focusableLinks.length) return;
    const currentIndex = focusableLinks.indexOf(
      document.activeElement as HTMLAnchorElement
    );

    const focusAt = (index: number) => {
      const target = focusableLinks[index];
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };

    if (event.key === "ArrowDown") {
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % focusableLinks.length : 0;
      focusAt(nextIndex);
    } else if (event.key === "ArrowUp") {
      const nextIndex =
        currentIndex >= 0
          ? (currentIndex - 1 + focusableLinks.length) % focusableLinks.length
          : focusableLinks.length - 1;
      focusAt(nextIndex);
    } else if (event.key === "Home") {
      focusAt(0);
    } else if (event.key === "End") {
      focusAt(focusableLinks.length - 1);
    }
  };

  return (
    <aside
      className="sticky top-8 hidden h-fit w-72 flex-col gap-6 text-white lg:flex"
      role="navigation"
      aria-label="Admin sidebar"
    >
      <div className="admin-panel flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff9f40] text-[#1a1410] shadow-[0_12px_24px_rgba(255,159,64,0.3)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4l7 3.5v9L12 20l-7-3.5v-9z" />
              <path d="M12 10l7-3.5M12 10L5 6.5M12 10v10" />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Panda Spa</p>
            <p className="text-lg font-semibold text-white">Quản Trị Website</p>
          </div>
        </div>
        <p className="text-xs text-white/60">
          Bảo mật không gian làm việc cho nội dung, khách hàng tiềm năng và tình trạng hệ thống.
        </p>
      </div>
      <div
        ref={navRef}
        className="admin-panel flex flex-col gap-5 p-4 text-sm"
        onKeyDown={handleNavKeyDown}
      >
        {isLoading ? (
          <p className="px-3 text-xs uppercase tracking-[0.35em] text-white/40">
            Đăng Tải...
          </p>
        ) : filteredSections.length === 0 ? (
          <p className="px-3 text-xs uppercase tracking-[0.35em] text-white/40">
            Không có quyền!
          </p>
        ) : (
          sectionsWithActive.map((section) => {
            const isOpen = openSections[section.title] ?? true;
            const sectionId = `admin-section-${section.title
              .toLowerCase()
              .replace(/\s+/g, "-")}`;
            return (
              <div key={section.title} className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections((prev) => ({
                      ...prev,
                      [section.title]: !isOpen,
                    }))
                  }
                  className="flex w-full items-center justify-between px-3 text-left text-xs uppercase tracking-[0.35em] text-white/40 transition hover:text-white/70"
                  aria-expanded={isOpen}
                  aria-controls={sectionId}
                  aria-label={`Toggle ${section.title}`}
                >
                  <span>{section.title}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isOpen ? "rotate-180" : "rotate-0"
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
                  id={sectionId}
                  className={cn(
                    "flex flex-col gap-2 overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                  )}
                  aria-hidden={!isOpen}
                >
                  {section.links.map((link) => {
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        data-admin-nav-link="true"
                        tabIndex={isOpen ? 0 : -1}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {active ? (
                          <span className="absolute left-0 top-2 h-8 w-[3px] rounded-full bg-[#ff9f40]" />
                        ) : null}
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-white/80">
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="admin-panel flex flex-col gap-4 p-5 text-sm">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={userName}
            className="h-10 w-10 rounded-full border border-white/10 object-cover"
          />
          <div>
            <p className="font-semibold text-white">{userName}</p>
            <p className="text-xs text-white/60">Phiên bảo mật đã được kích hoạt</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            try {
              await apiFetch("/admin/auth/logout", { method: "POST" });
            } catch {
              // ignore logout errors
            }
            clearClientSession();
            router.replace(ADMIN_ROUTES.login);
            router.refresh();
          }}
        >
          {t("admin.logout")}
        </Button>
      </div>
    </aside>
  );
}
