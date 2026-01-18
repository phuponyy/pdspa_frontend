import { getHomePage, getServices } from "@/lib/api/public";
import { SITE_DESCRIPTION, SITE_NAME, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";
import HeroSection from "@/components/home/HeroSection";
import SectionRenderer from "@/components/home/SectionRenderer";
import ContactForm from "@/components/home/ContactForm";
import Container from "@/components/common/Container";
import type { HomeSection } from "@/types/page.types";
import type { Metadata } from "next";

const findSection = (sections: HomeSection[] | undefined, keys: string[]) =>
  sections?.find((section) =>
    keys.some(
      (key) =>
        section.type?.toLowerCase() === key ||
        section.key?.toLowerCase() === key
    )
  );

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const homeResponse = await getHomePage(lang).catch(() => null);

  const metaTitle = homeResponse?.meta?.metaTitle || SITE_NAME;
  const metaDescription = homeResponse?.meta?.metaDescription || SITE_DESCRIPTION;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: homeResponse?.seo?.canonical,
      languages: homeResponse?.seo?.hreflangs,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const i18n = await getServerTranslator(lang);
  const t = i18n.t.bind(i18n);
  const [homeData, servicesResponse] = await Promise.all([
    getHomePage(lang).catch(() => null),
    getServices(lang).catch(() => null),
  ]);
  const services = servicesResponse?.data ?? [];

  const heroFromPage = (homeData?.page as { hero?: HomeSection })?.hero;
  const heroSection =
    heroFromPage || findSection(homeData?.sections, ["hero", "banner"]) || {};

  return (
    <div className="home-dark space-y-16 pb-16">
      <HeroSection
        badge={t("hero.badge")}
        heading={(heroSection?.heading as string) || t("hero.title")}
        subheading={(heroSection?.subheading as string) || t("hero.subtitle")}
        imageUrl={heroSection?.imageUrl as string | undefined}
        images={heroSection?.images}
        slides={heroSection?.slides}
        primaryCta={t("hero.ctaPrimary")}
        secondaryCta={t("hero.ctaSecondary")}
      />
      <SectionRenderer sections={homeData?.sections} lang={lang} />

      <section id="contact" className="py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Concierge
            </span>
            <h2 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
              {t("sections.contact")}
            </h2>
            <p className="text-sm text-[var(--ink-muted)] md:text-base">
              Share your preferences and we will tailor a ritual and schedule
              that fits your timing.
            </p>
            <div className="rounded-3xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--ink-muted)]">
              <p className="text-base font-semibold text-[var(--ink)]">
                {SITE_NAME}
              </p>
              <p>{SPA_ADDRESS}</p>
              <p>Working Time: {SPA_HOURS}</p>
            </div>
          </div>
          <ContactForm lang={lang} services={services} />
        </Container>
      </section>
    </div>
  );
}
