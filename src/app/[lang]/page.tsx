import { getHomeMeta, getHomePage, getPublicConfig } from "@/lib/api/public";
import { getDictionary, isSupportedLang } from "@/lib/i18n";
import HeroSection from "@/components/home/HeroSection";
import SectionRenderer from "@/components/home/SectionRenderer";
import ContactForm from "@/components/home/ContactForm";
import Container from "@/components/common/Container";
import type { HomeSection } from "@/types/page.types";
import type { Metadata } from "next";

const findSection = (sections: HomeSection[] | undefined, keys: string[]) =>
  sections?.find((section) =>
    keys.some((key) => section.type?.toLowerCase() === key)
  );

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const [metaResponse, configResponse, homeResponse] = await Promise.all([
    getHomeMeta(lang).catch(() => null),
    getPublicConfig().catch(() => null),
    getHomePage(lang).catch(() => null),
  ]);

  const metaTitle =
    metaResponse?.data?.metaTitle ||
    configResponse?.data?.siteName ||
    "Panda Spa";
  const metaDescription =
    metaResponse?.data?.metaDescription ||
    "Premium spa and wellness experiences tailored for balance.";

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
  const dict = getDictionary(lang);
  const homeData = await getHomePage(lang).catch(() => null);

  const heroFromPage = (homeData?.page as { hero?: HomeSection })?.hero;
  const heroSection =
    heroFromPage || findSection(homeData?.sections, ["hero", "banner"]) || {};

  const servicesSection = findSection(homeData?.sections, ["services", "service"]);

  return (
    <div className="space-y-16 pb-16">
      <HeroSection
        badge={dict.hero.badge}
        heading={(heroSection?.heading as string) || dict.hero.title}
        subheading={(heroSection?.subheading as string) || dict.hero.subtitle}
        imageUrl={heroSection?.imageUrl as string | undefined}
        primaryCta={dict.hero.ctaPrimary}
        secondaryCta={dict.hero.ctaSecondary}
      />
      <SectionRenderer sections={homeData?.sections} lang={lang} />

      <section id="contact" className="py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
              Concierge
            </span>
            <h2 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
              {dict.sections.contact}
            </h2>
            <p className="text-sm text-[var(--ink-muted)] md:text-base">
              Share your preferences and we will tailor a ritual and schedule
              that fits your timing.
            </p>
            <div className="rounded-3xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--ink-muted)]">
              <p className="text-base font-semibold text-[var(--ink)]">
                Panda Spa Da Nang
              </p>
              <p>72 Tran Phu, Hai Chau</p>
              <p>Open daily: 09:00 - 22:00</p>
            </div>
          </div>
          <ContactForm
            lang={lang}
            services={servicesSection?.items}
            labels={dict.form}
          />
        </Container>
      </section>
    </div>
  );
}
