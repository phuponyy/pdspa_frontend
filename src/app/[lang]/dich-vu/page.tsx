import type { Metadata } from "next";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import { getServices } from "@/lib/api/public";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";
import { buildCmsMetadata, resolveSchemaJson } from "@/lib/seo/cmsPageMeta";

const CMS_SLUG = "dich-vu";

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

export default async function ServicesPage({
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
          eyebrow={t("servicesPage.eyebrow")}
          title={t("servicesPage.title")}
          description={t("servicesPage.description")}
        />
      </Container>

      <Container className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.length ? (
          services.map((service) => (
            <div
              key={service.id}
              className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                {service.key}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                {service.description || t("servicesPage.serviceFallback")}
              </p>
              {service.priceOptions.length ? (
                <div className="mt-4 space-y-1 text-sm text-[var(--ink-muted)]">
                  {service.priceOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <span>{option.code}</span>
                      <span className="font-semibold text-[var(--ink)]">
                        {option.price.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--line)] bg-white/70 p-8 text-sm text-[var(--ink-muted)]">
            {t("servicesPage.emptyState")}
          </div>
        )}
      </Container>
    </div>
  );
}
