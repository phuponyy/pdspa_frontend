import { ADMIN_BASE, ADMIN_ROUTES } from "@/lib/admin/constants";

export type AccessRule = {
  prefix: string;
  permissions?: string[];
  roles?: string[];
  requireAnyPermission?: boolean;
};

export const adminAccessRules: AccessRule[] = [
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
  { prefix: ADMIN_ROUTES.seoRedirects, permissions: ["manage_redirects"] },
  { prefix: ADMIN_ROUTES.seoBrokenLinks, permissions: ["manage_broken_links"] },
  { prefix: ADMIN_ROUTES.seoKeywords, permissions: ["manage_keywords"] },
  { prefix: ADMIN_ROUTES.users, permissions: ["manage_users"] },
  { prefix: ADMIN_ROUTES.settings, permissions: ["manage_users"] },
];

export const isAdminPathAllowed = (
  adminPath: string,
  permissions: string[],
  roleKey?: string
) => {
  if (!roleKey) return false;
  const rule = adminAccessRules
    .filter((item) => adminPath.startsWith(item.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  if (!rule) return false;
  if (rule.roles?.length && !rule.roles.includes(roleKey)) return false;
  if (rule.permissions?.length) {
    return rule.permissions.every((permission) => permissions.includes(permission));
  }
  if (rule.requireAnyPermission) {
    return permissions.length > 0;
  }
  return true;
};
