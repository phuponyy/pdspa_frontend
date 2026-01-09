import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getPublicConfig } from "@/lib/api/public";
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
  const config = await getPublicConfig().catch(() => ({
    success: true,
    data: { siteName: "Panda Spa", hotline: "0909 000 000" },
  }));

  return (
    <div lang={lang} className="min-h-screen">
      <Header lang={lang} hotline={config.data.hotline} />
      <main className="flex min-h-[70vh] flex-col">{children}</main>
      <Footer hotline={config.data.hotline} siteName={config.data.siteName} />
    </div>
  );
}
