import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LANGS = ["vi", "en"];
const DEFAULT_LANG = "en";

type AccessRule = {
  prefix: string;
  permissions?: string[];
  roles?: string[];
};

const ACCESS_RULES: AccessRule[] = [
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
];

const getLangFromPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const lang = segments[0];
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
};

const getAdminPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return "";
  return `/${segments.slice(1).join("/")}`;
};

const findRule = (adminPath: string) =>
  ACCESS_RULES.find((rule) => adminPath.startsWith(rule.prefix));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }
  if (pathname === "/vn" || pathname.startsWith("/vn/")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = pathname.replace(/^\/vn(\/|$)/, "/vi$1");
    return NextResponse.redirect(redirectUrl);
  }
  if (pathname === "/en" || (pathname.startsWith("/en/") && !pathname.startsWith("/en/admin"))) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = pathname.replace(/^\/en(\/|$)/, "/$1");
    redirectUrl.pathname = redirectUrl.pathname.replace(/\/+$/, "/");
    return NextResponse.redirect(redirectUrl);
  }
  const segments = pathname.split("/").filter(Boolean);
  const pathLang = segments[0];
  const isLocalized = SUPPORTED_LANGS.includes(pathLang);
  if (!isLocalized && pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${DEFAULT_LANG}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }
  const lang = getLangFromPath(pathname);
  const adminPath = getAdminPath(pathname);

  if (!adminPath.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (adminPath.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(`${apiBase}/admin/auth/me`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  }).catch(() => null);

  if (!response || !response.ok) {
    return NextResponse.redirect(new URL(`/${lang}/admin/login`, request.url));
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: { permissions?: string[]; roleKey?: string };
  } | null;
  const permissions = payload?.data?.permissions ?? [];
  const roleKey = payload?.data?.roleKey;
  const rule = findRule(adminPath);

  if (rule?.roles?.length && (!roleKey || !rule.roles.includes(roleKey))) {
    return NextResponse.redirect(new URL(`/${lang}/admin/overview`, request.url));
  }

  if (
    rule?.permissions?.length &&
    !rule.permissions.every((permission) => permissions.includes(permission))
  ) {
    return NextResponse.redirect(new URL(`/${lang}/admin/overview`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|uploads|images|favicon.ico).*)"],
};
