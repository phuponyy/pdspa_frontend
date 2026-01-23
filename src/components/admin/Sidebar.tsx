"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { getAdminMe } from "@/lib/api/admin";
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

export const adminNavSections = (lang: string, t: (key: string) => string): AdminNavSection[] => [
    {
      title: "Số Liệu",
      links: [
        {
          href: `/${lang}/admin/overview`,
          label: "Tổng Quan",
          requiredPermissions: ["view_dashboard"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 11h7V4H4zM13 20h7v-7h-7zM4 20h7v-7H4zM13 11h7V4h-7z" />
            </svg>
          ),
        },
        {
          href: `/${lang}/admin/live`,
          label: "Live",
          requiredPermissions: ["view_live"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h3l2 3 4-6 3 4h4" />
            </svg>
          ),
        },
        {
          href: `/${lang}/admin/analytics`,
          label: "Thống Kê",
          requiredPermissions: ["view_dashboard"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20V6M10 20V10M16 20v-6M22 20H2" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Quản lý khách",
      links: [
        {
          href: `/${lang}/admin/customers`,
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
          href: `/${lang}/admin/bookings`,
          label: "Đặt lịch",
          requiredPermissions: ["manage_bookings"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" />
            </svg>
          ),
        },
        {
          href: `/${lang}/admin/leads`,
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
          href: `/${lang}/admin/posts`,
          label: "Bài viết",
          requiredPermissions: ["manage_posts"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 5h16M4 12h16M4 19h10" />
            </svg>
          ),
        },
        {
          href: `/${lang}/admin/pages`,
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
          href: `/${lang}/admin/media`,
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
          href: `/${lang}/admin/pages/home`,
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
      title: "Cài Đặt Chung",
      links: [
        {
          href: `/${lang}/admin/settings`,
          label: "Cài đặt",
          requiredPermissions: ["manage_users"],
          icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l2.1 4.5 5 .7-3.6 3.5.9 5-4.4-2.3-4.4 2.3.9-5L4.9 7.2l5-.7L12 2z" />
            </svg>
          ),
        },
        {
          href: `/${lang}/admin/settings/roles`,
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
          href: `/${lang}/admin/users`,
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
export default function Sidebar({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const navSections = adminNavSections(lang, t);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(undefined),
  });
  const permissions = data?.data?.permissions || [];
  const roleKey = data?.data?.roleKey;
  const userName = data?.data?.name || data?.data?.email || "Admin";
  const avatarUrl = data?.data?.avatarUrl || "/admin-avatar.svg";
  const filteredSections = roleKey
    ? filterAdminSections(navSections, permissions, roleKey)
    : [];

  return (
    <aside className="sticky top-8 hidden h-fit w-72 flex-col gap-6 text-white lg:flex">
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
      <div className="admin-panel flex flex-col gap-5 p-4 text-sm">
        {isLoading ? (
          <p className="px-3 text-xs uppercase tracking-[0.35em] text-white/40">
            Đăng Tải...
          </p>
        ) : filteredSections.length === 0 ? (
          <p className="px-3 text-xs uppercase tracking-[0.35em] text-white/40">
            Không có quyền!
          </p>
        ) : (
          filteredSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-xs uppercase tracking-[0.35em] text-white/40">
                {section.title}
              </p>
              <div className="flex flex-col gap-2">
                {section.links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
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
          ))
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
              await fetch(`${API_BASE_URL}/admin/auth/logout`, {
                method: "POST",
                credentials: "include",
              });
            } catch {
              // ignore logout errors
            }
            router.replace(`/${lang}/admin/login`);
            router.refresh();
          }}
        >
          {t("admin.logout")}
        </Button>
      </div>
    </aside>
  );
}
