import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { ADMIN_ROUTES } from "@/lib/admin/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("pd2_token")?.value;
  const refresh = cookieStore.get("pd2_refresh")?.value;
  if (!token && !refresh) {
    redirect(ADMIN_ROUTES.login);
  }
  return <AdminShell>{children}</AdminShell>;
}
