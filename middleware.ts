import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/lib/constants";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const lang = segments[0];

  if (lang === "vi") {
    const url = request.nextUrl.clone();
    url.pathname = `/vn${pathname.replace(/^\/vi/, "")}`;
    return NextResponse.redirect(url);
  }

  if (!lang || !SUPPORTED_LANGS.includes(lang as (typeof SUPPORTED_LANGS)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (segments[1] === "admin") {
    const token = request.cookies.get("pd2_token")?.value;
    const isLogin = segments[2] === "login";
    if (!token && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${lang}/admin/login`;
      return NextResponse.redirect(url);
    }
    if (token && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${lang}/admin/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
