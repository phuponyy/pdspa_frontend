import { getHomePage, getServices, getSiteConfig } from "@/lib/api/public";
import { SITE_DESCRIPTION, SITE_NAME, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";
import HeroSection from "@/components/home/HeroSection";
import HomeIntroSection from "@/components/home/HomeIntroSection";
import HomeRecoverySection from "@/components/home/HomeRecoverySection";
import SectionRenderer from "@/components/home/SectionRenderer";
import ContactForm from "@/components/home/ContactForm";
import Container from "@/components/common/Container";
import type { HomeSection } from "@/types/page.types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  params: { lang: string };
}): Promise<Metadata> {
  const { lang: rawLang } = params;
  if (!isSupportedLang(rawLang)) {
    return {};
  }
  const lang = rawLang;
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
  params: { lang: string };
}) {
  const { lang: rawLang } = params;
  if (!isSupportedLang(rawLang)) {
    notFound();
  }
  const lang = rawLang;
  const i18n = await getServerTranslator(lang);
  const t = i18n.t.bind(i18n);
  const [homeData, servicesResponse, siteConfigResponse] = await Promise.all([
    getHomePage(lang).catch(() => null),
    getServices(lang).catch(() => null),
    getSiteConfig().catch(() => null),
  ]);
  const services = servicesResponse?.data ?? [];
  const config = siteConfigResponse?.data ?? {};

  const heroFromPage = (homeData?.page as { hero?: HomeSection })?.hero;
  const heroSection =
    heroFromPage || findSection(homeData?.sections, ["hero", "banner"]) || {};
  const heroBody = heroSection?.body as {
    slides?: HomeSection["slides"];
    images?: HomeSection["images"];
  } | null;
  const heroSlides =
    heroSection?.slides ??
    (Array.isArray(heroBody?.slides) ? heroBody?.slides : undefined);
  const heroImages =
    heroSection?.images ??
    (Array.isArray(heroBody?.images) ? heroBody?.images : undefined);
  const introSection =
    findSection(homeData?.sections, ["intro", "about", "highlight"]) || {};
  const recoverySection =
    findSection(homeData?.sections, ["recovery", "recover", "relaxation"]) || {};
  const introBody = (introSection?.body || {}) as {
    providerName?: string;
    listingName?: string;
    rating?: number;
    reviews?: number;
    rankText?: string;
    videoUrl?: string;
    buttonLabel?: string;
    buttonLink?: string;
  };
  const contactName =
    config[`site_name_${lang}`] ||
    (lang === "vi" ? config.site_name_vn : undefined) ||
    config.site_name ||
    SITE_NAME;
  const contactAddress =
    config[`topbar_address_${lang}`] ||
    (lang === "vi" ? config.topbar_address_vn : undefined) ||
    SPA_ADDRESS;
  const contactHours =
    config[`topbar_hours_${lang}`] ||
    (lang === "vi" ? config.topbar_hours_vn : undefined) ||
    SPA_HOURS;

  return (
    <div className="home-dark space-y-16 pb-16">
      <HeroSection
        badge={t("hero.badge")}
        heading={(heroSection?.heading as string) || t("hero.title")}
        subheading={(heroSection?.subheading as string) || t("hero.subtitle")}
        imageUrl={heroSection?.imageUrl as string | undefined}
        images={heroImages}
        slides={heroSlides}
        primaryCta={t("hero.ctaPrimary")}
        secondaryCta={t("hero.ctaSecondary")}
      />
      <HomeIntroSection
        heading={
          (introSection?.heading as string) || "Massage in Da Nang | Panda Spa"
        }
        description={
          (introSection?.description as string) ||
          "Discover a calm sanctuary in the heart of Da Nang with signature massage rituals and thoughtfully crafted wellness experiences."
        }
        imageUrl={introSection?.imageUrl as string | undefined}
        videoUrl={introBody.videoUrl}
        providerName={introBody.providerName}
        listingName={introBody.listingName}
        rating={introBody.rating}
        reviews={introBody.reviews}
        rankText={introBody.rankText}
        buttonLabel={introBody.buttonLabel || "SPA DA NANG"}
        buttonLink={introBody.buttonLink || "#contact"}
      />
      <HomeRecoverySection
        heading={
          (recoverySection?.heading as string) ||
          "Recover your energy through relaxation"
        }
        items={recoverySection?.items}
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
                {contactName}
              </p>
              <p>{contactAddress}</p>
              <p>Working Time: {contactHours}</p>
            </div>
          </div>
          <ContactForm lang={lang} services={services} />
        </Container>
      </section>
    </div>
  );
}
