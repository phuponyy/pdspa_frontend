"use client";

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

  const isLogin = pathname.includes("/admin/login");

  useEffect(() => {
    if (!token && !isLogin) {
      router.replace(`/${lang}/admin/login`);
    }
    if (token && isLogin) {
      router.replace(`/${lang}/admin/dashboard`);
    }
  }, [token, isLogin, lang, router]);

  if (isLogin) {
    return <div className="min-h-screen bg-[var(--mist)]">{children}</div>;
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f1f1f1]">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-10 lg:px-10">
        <Sidebar lang={lang} />
        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}
