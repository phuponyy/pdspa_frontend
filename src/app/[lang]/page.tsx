import { getHomePage, getServices, getSiteConfig } from "@/lib/api/public";
import { SITE_DESCRIPTION, SITE_NAME, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";
import HeroSection from "@/components/home/HeroSection";
import HomeIntroSection from "@/components/home/HomeIntroSection";
import HomeHighlightsSection from "@/components/home/HomeHighlightsSection";
import HomeServicesSection from "@/components/home/HomeServicesSection";
import HomeRecoverySection from "@/components/home/HomeRecoverySection";
import HomeReviewsSection from "@/components/home/HomeReviewsSection";
import HomeBlogSection from "@/components/home/HomeBlogSection";
import HomePhotoGallerySection from "@/components/home/HomePhotoGallerySection";
import SectionRenderer from "@/components/home/SectionRenderer";
import ContactForm from "@/components/home/ContactForm";
import Container from "@/components/common/Container";
import type { HomeSection } from "@/types/page.types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveSchemaJson } from "@/lib/sanitize";

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
  if (!isSupportedLang(rawLang)) {
    return {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    };
  }
  const lang = rawLang;
  const homeResponse = await getHomePage(lang).catch(() => null);

  const metaTitle = homeResponse?.meta?.metaTitle || SITE_NAME;
  const metaDescription = homeResponse?.meta?.metaDescription || SITE_DESCRIPTION;
  const canonical = homeResponse?.seo?.canonical;
  const hreflangs = homeResponse?.seo?.hreflangs;

  const ogTitle = homeResponse?.meta?.ogTitle || metaTitle;
  const ogDescription = homeResponse?.meta?.ogDescription || metaDescription;
  const ogImage = homeResponse?.meta?.ogImage;

  return {
    title: metaTitle,
    description: metaDescription,
    applicationName: SITE_NAME,
    alternates: {
      canonical: canonical,
      languages: hreflangs,
    },
    openGraph: {
      type: "website",
      locale: lang === "vi" ? "vi_VN" : "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      images: ogImage
        ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: ogTitle,
          },
        ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
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
  const schemaJson = homeData?.meta?.schemaJson ?? null;
  const resolvedSchema = resolveSchemaJson(schemaJson);

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
  const highlightsSection =
    findSection(homeData?.sections, ["highlights", "benefits", "reasons"]) || {};
  const servicesSection =
    findSection(homeData?.sections, ["services", "service", "service-grid"]) || {};
  const servicesBody = (servicesSection?.body || {}) as {
    items?: HomeSection["items"];
    text?: string;
  };
  const servicesItems =
    (servicesSection?.items as HomeSection["items"] | undefined) ||
    (servicesBody.items as HomeSection["items"] | undefined) ||
    (((servicesSection as { t?: { body?: { items?: HomeSection["items"] } } })?.t
      ?.body?.items as HomeSection["items"] | undefined) ??
      []);
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

  const orderedSections = (homeData?.sections || []).slice().sort((a, b) => {
    const orderA = Number.isFinite(a.order) ? (a.order as number) : 0;
    const orderB = Number.isFinite(b.order) ? (b.order as number) : 0;
    return orderA - orderB;
  });

  const renderHomeSection = (section: HomeSection) => {
    const key = section.key?.toLowerCase() || section.type?.toLowerCase();
    if (!key) return null;
    if (key === "hero") {
      const heroBody = (section?.body || {}) as {
        slides?: HomeSection["slides"];
        images?: HomeSection["images"];
      } | null;
      const heroSlides =
        section?.slides ??
        (Array.isArray(heroBody?.slides) ? heroBody?.slides : undefined);
      const heroImages =
        section?.images ??
        (Array.isArray(heroBody?.images) ? heroBody?.images : undefined);
      return (
        <HeroSection
          key="hero"
          badge={t("hero.badge")}
          heading={(section?.heading as string) || t("hero.title")}
          subheading={(section?.subheading as string) || t("hero.subtitle")}
          imageUrl={section?.imageUrl as string | undefined}
          images={heroImages}
          slides={heroSlides}
          primaryCta={t("hero.ctaPrimary")}
          secondaryCta={t("hero.ctaSecondary")}
        />
      );
    }
    if (key === "intro") {
      return (
        <HomeIntroSection
          key="intro"
          heading={
            (section?.heading as string) || "Massage in Da Nang | Panda Spa"
          }
          description={
            (section?.description as string) ||
            "Discover a calm sanctuary in the heart of Da Nang with signature massage rituals and thoughtfully crafted wellness experiences."
          }
          imageUrl={section?.imageUrl as string | undefined}
          videoUrl={introBody.videoUrl}
          providerName={introBody.providerName}
          listingName={introBody.listingName}
          rating={introBody.rating}
          reviews={introBody.reviews}
          rankText={introBody.rankText}
          buttonLabel={introBody.buttonLabel || "SPA DA NANG"}
          buttonLink={introBody.buttonLink || "#contact"}
        />
      );
    }
    if (key === "services" || key === "service" || key === "service-grid") {
      return (
        <HomeServicesSection
          key="services"
          heading={
            (section?.heading as string) ||
            "Services massage at Panda Spa"
          }
          description={
            (section?.description as string | undefined) ||
            (servicesBody.text as string | undefined)
          }
          items={servicesItems}
          services={services}
          lang={lang}
        />
      );
    }
    if (key === "highlights") {
      return (
        <HomeHighlightsSection
          key="highlights"
          heading={
            (section?.heading as string) ||
            "Recover your energy through relaxation"
          }
          description={section?.description as string | undefined}
          items={section?.items}
        />
      );
    }
    if (key === "recovery") {
      return (
        <HomeRecoverySection
          key="recovery"
          heading={
            (section?.heading as string) ||
            "Recover your energy through relaxation"
          }
          description={section?.description as string | undefined}
          items={section?.items}
        />
      );
    }
    if (key === "reviews" || key === "review" || key === "testimonials") {
      return (
        <HomeReviewsSection
          key="reviews"
          heading={
            (section?.heading as string) ||
            "Reviews of the massage & spa Da Nang at Panda Spa"
          }
          description={section?.description as string | undefined}
          items={section?.items}
        />
      );
    }
    if (key === "gallery" || key === "photo-gallery" || key === "photos") {
      const galleryBody = (section?.body || {}) as {
        items?: HomeSection["items"];
        text?: string;
      };
      const galleryItems =
        (section?.items as HomeSection["items"] | undefined) ||
        (galleryBody.items as HomeSection["items"] | undefined) ||
        [];
      return (
        <HomePhotoGallerySection
          key="gallery"
          heading={(section?.heading as string) || "Panda Spa Photo Gallery"}
          description={
            (section?.description as string | undefined) ||
            (galleryBody.text as string | undefined)
          }
          items={galleryItems}
        />
      );
    }
    if (key === "blog" || key === "posts" || key === "news") {
      const blogBody = (section?.body || {}) as { featuredSlug?: string };
      return (
        <HomeBlogSection
          key="blog"
          heading={(section?.heading as string) || "Massage Guide"}
          description={section?.description as string | undefined}
          featuredSlug={blogBody.featuredSlug}
          lang={lang}
        />
      );
    }
    return null;
  };

  return (
    <div className="home-dark space-y-16 pb-16">
      {resolvedSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: resolvedSchema }}
        />
      ) : null}
      {orderedSections.length
        ? orderedSections.map((section) => renderHomeSection(section))
        : null}
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
