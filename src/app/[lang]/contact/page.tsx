import type { Metadata } from "next";
import Container from "@/components/common/Container";
import ContactForm from "@/components/home/ContactForm";
import SectionHeading from "@/components/common/SectionHeading";
import { getServices } from "@/lib/api/public";
import { HOTLINE, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";
import { buildCmsMetadata, resolveSchemaJson } from "@/lib/seo/cmsPageMeta";

const CMS_SLUG = "contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isSupportedLang(rawLang)) return {};
  const { metadata } = await buildCmsMetadata(CMS_SLUG, rawLang);
  return metadata ?? {};
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "en";
  const i18n = await getServerTranslator(lang);
  const t = i18n.t.bind(i18n);
  const servicesResponse = await getServices(lang).catch(() => null);
  const services = servicesResponse?.data ?? [];
  const cmsMeta = await buildCmsMetadata(CMS_SLUG, lang);
  const schema = resolveSchemaJson(cmsMeta.schemaJson);

  return (
    <div className="space-y-16 pb-16 pt-10">
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ) : null}
      <Container>
        <SectionHeading
          eyebrow={t("contactPage.eyebrow")}
          title={t("contactPage.title")}
          description={t("contactPage.description")}
        />
      </Container>
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-6 text-sm text-[var(--ink-muted)]">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              {t("contactPage.detailsLabel")}
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--ink)]">
              {t("contactPage.detailsName")}
            </p>
            <p className="mt-2">{SPA_ADDRESS}</p>
            <p>Working Time: {SPA_HOURS}</p>
            <p className="mt-4 text-base font-semibold text-[var(--ink)]">
              {HOTLINE}
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              {t("contactPage.reachLabel")}
            </p>
            <p className="mt-2">
              {t("contactPage.reachText")}
            </p>
          </div>
        </div>
        <ContactForm lang={lang} services={services} />
      </Container>
    </div>
  );
}
