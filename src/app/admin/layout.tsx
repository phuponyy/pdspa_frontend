import I18nProvider from "@/components/common/I18nProvider";
import { DEFAULT_LANG } from "@/lib/constants";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <I18nProvider lang={DEFAULT_LANG}>{children}</I18nProvider>;
}
