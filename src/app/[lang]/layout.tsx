import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import I18nProvider from "@/components/common/I18nProvider";
import { getSiteConfig } from "@/lib/api/public";
import { HOTLINE, SITE_NAME, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";
import { isSupportedLang } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  if (!isSupportedLang(rawLang)) {
    notFound();
  }
  const lang = rawLang;
  const siteConfigResponse = await getSiteConfig().catch(() => null);
  const config = siteConfigResponse?.data ?? {};
  const hotline =
    config[`topbar_phone_primary_${lang}`] || HOTLINE;
  const address =
    config[`topbar_address_${lang}`] || SPA_ADDRESS;
  const hours = config[`topbar_hours_${lang}`] || SPA_HOURS;
  const siteName =
    config[`site_name_${lang}`] || config.site_name || SITE_NAME;

  return (
    <div lang={lang} className="min-h-screen">
      <I18nProvider lang={lang}>
        <Header lang={lang} hotline={hotline} />
        <main className="flex min-h-[70vh] flex-col">{children}</main>
        <Footer
          hotline={hotline}
          siteName={siteName}
          address={address}
          hours={hours}
          lang={lang}
        />
      </I18nProvider>
    </div>
  );
}
