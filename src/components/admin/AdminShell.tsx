"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import Sidebar from "./Sidebar";

export default function AdminShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setToken = useAuthStore((state) => state.setToken);

  const isLogin = pathname.includes("/admin/login");

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!token && !isLogin) {
      const cookieToken =
        typeof document !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("pd2_token="))
              ?.split("=")[1]
          : null;
      if (cookieToken) {
        setToken(cookieToken);
        return;
      }
      router.replace(`/${lang}/admin/login`);
    }
    if (token && isLogin) {
      router.replace(`/${lang}/admin/dashboard`);
    }
  }, [token, isLogin, lang, router, hydrated, setToken]);

  if (isLogin) {
    return <div className="min-h-screen bg-[var(--mist)]">{children}</div>;
  }

  if (!token) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const currentLang = segments[0] || lang;
  const restPath = segments.slice(1).join("/");

  return (
    <div className="min-h-screen bg-[#0b1118] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-10 lg:px-10">
        <Sidebar lang={lang} />
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-end gap-2">
            {["vn", "en"].map((code) => (
              <Link
                key={code}
                href={`/${code}${restPath ? `/${restPath}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  currentLang === code
                    ? "bg-[#2f7bff] text-white"
                    : "border border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
