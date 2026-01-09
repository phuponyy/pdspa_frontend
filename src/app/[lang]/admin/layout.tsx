import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return <AdminShell lang={params.lang}>{children}</AdminShell>;
}
