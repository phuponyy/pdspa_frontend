import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HOTLINE, SITE_NAME } from "@/lib/constants";
import { isSupportedLang } from "@/lib/i18n";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";

  return (
    <div lang={lang} className="min-h-screen">
      <Header lang={lang} hotline={HOTLINE} />
      <main className="flex min-h-[70vh] flex-col">{children}</main>
      <Footer hotline={HOTLINE} siteName={SITE_NAME} lang={lang} />
    </div>
  );
}
