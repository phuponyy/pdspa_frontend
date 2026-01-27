import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AccessRule = {
  prefix: string;
  permissions?: string[];
  roles?: string[];
};

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN = "/admin/login";
const ADMIN_DEFAULT = "/admin/overview";
const ADMIN_ME = "/admin/auth/me";
const REDIRECT_RESOLVE = "/public/redirects/resolve";
const PUBLIC_IGNORES = ["/_next", "/api", "/uploads", "/images"];
const ROOT_ROUTES = new Set([
  "contact",
  "dich-vu",
  "good-massage-in-da-nang",
  "price-list",
  "tin-tuc",
]);

const ACCESS_RULES: AccessRule[] = [
  { prefix: ADMIN_PREFIX, permissions: ["view_dashboard"] },
  { prefix: "/admin/overview", permissions: ["view_dashboard"] },
  { prefix: "/admin/dashboard", permissions: ["view_dashboard"] },
  { prefix: "/admin/analytics", permissions: ["view_dashboard"] },
  { prefix: "/admin/live", permissions: ["view_live"] },
  { prefix: "/admin/customers", permissions: ["manage_customers"] },
  { prefix: "/admin/bookings", permissions: ["view_bookings"] },
  { prefix: "/admin/leads", roles: ["ADMIN"] },
  { prefix: "/admin/posts", permissions: ["manage_posts"] },
  { prefix: "/admin/pages", permissions: ["manage_pages"] },
  { prefix: "/admin/services", permissions: ["manage_services"] },
  { prefix: "/admin/media", permissions: ["manage_media"] },
  { prefix: "/admin/users", permissions: ["manage_users"] },
  { prefix: "/admin/settings", permissions: ["manage_users"] },
  { prefix: "/admin/seo/redirects", permissions: ["manage_redirects"] },
];

const getAdminPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  if (adminIndex === -1) return "";
  return `/${segments.slice(adminIndex).join("/")}`;
};

const findRule = (adminPath: string) =>
  ACCESS_RULES.filter((rule) => adminPath.startsWith(rule.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

const hasPermission = (permissions: string[], required: string) => {
  if (permissions.includes(required)) return true;
  if (required === "view_bookings" || required === "edit_bookings") {
    return permissions.includes("manage_bookings");
  }
  return false;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_IGNORES.some((prefix) => pathname.startsWith(prefix)) || pathname === "/favicon.ico") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/en/admin") || pathname.startsWith("/vi/admin")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = pathname.replace(/^\/(en|vi)(?=\/admin)/, "");
    return NextResponse.redirect(redirectUrl, 301);
  }
  if (pathname === "/vi/news" || pathname.startsWith("/vi/news/")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = pathname.replace(/^\/vi\/news(\/|$)/, "/vi/tin-tuc$1");
    return NextResponse.redirect(redirectUrl, 308);
  }
  if (pathname === "/vi/tin-tuc" || pathname.startsWith("/vi/tin-tuc/")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = pathname.replace(/^\/vi(\/|$)/, "/$1");
    redirectUrl.pathname = redirectUrl.pathname.replace(/\/+$/, "/");
    return NextResponse.redirect(redirectUrl, 308);
  }
  if (pathname === "/tin-tuc" || pathname.startsWith("/tin-tuc/")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/vi${pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }
  if (pathname === "/en" || (pathname.startsWith("/en/") && !pathname.startsWith("/en/admin"))) {
    const redirectUrl = new URL(request.url);
    const stripped = pathname.replace(/^\/en(?=\/|$)/, "");
    redirectUrl.pathname = stripped.startsWith("/") ? stripped : `/${stripped}`;
    if (!redirectUrl.pathname) {
      redirectUrl.pathname = "/";
    }
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (request.method === "GET" && !pathname.startsWith("/admin")) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const redirectUrl = new URL(`${apiBase}${REDIRECT_RESOLVE}`);
    redirectUrl.searchParams.set("path", pathname);
    const redirectResponse = await fetch(redirectUrl.toString(), {
      cache: "no-store",
      headers: { accept: "application/json" },
    }).catch(() => null);

    if (redirectResponse?.ok) {
      const payload = (await redirectResponse.json().catch(() => null)) as
        | { data?: { to?: string; status?: number } | null }
        | null;
      const target = payload?.data?.to;
      const status = payload?.data?.status;
      if (target && target !== pathname) {
        const nextStatus = status === 301 || status === 302 ? status : 302;
        return NextResponse.redirect(new URL(target, request.url), nextStatus);
      }
    }
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (
    pathname !== "/" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/vi/") &&
    pathname !== "/vi" &&
    firstSegment &&
    !ROOT_ROUTES.has(firstSegment)
  ) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/en${pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }
  const adminPath = getAdminPath(pathname);

  if (!adminPath.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  if (adminPath.startsWith(ADMIN_LOGIN)) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  if (!cookieHeader.includes("pd2_refresh") && !cookieHeader.includes("pd2_token")) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(`${apiBase}${ADMIN_ME}`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response || !response.ok) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: { permissions?: string[]; roleKey?: string };
  } | null;
  const permissions = payload?.data?.permissions ?? [];
  const roleKey = payload?.data?.roleKey;
  const rule = findRule(adminPath);

  if (rule?.roles?.length && (!roleKey || !rule.roles.includes(roleKey))) {
    return NextResponse.redirect(new URL(ADMIN_DEFAULT, request.url));
  }

  if (
    rule?.permissions?.length &&
    !rule.permissions.every((permission) => hasPermission(permissions, permission))
  ) {
    return NextResponse.redirect(new URL(ADMIN_DEFAULT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|uploads|images|favicon.ico).*)"],
};
