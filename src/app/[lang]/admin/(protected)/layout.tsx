import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("pd2_token")?.value;
  const refresh = cookieStore.get("pd2_refresh")?.value;
  if (!token && !refresh) {
    redirect("/admin/login");
  }
  return <AdminShell lang={lang}>{children}</AdminShell>;
}
