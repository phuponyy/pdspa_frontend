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
  if (!token) {
    redirect(`/${lang}/admin/login`);
  }
  return <AdminShell lang={lang}>{children}</AdminShell>;
}
