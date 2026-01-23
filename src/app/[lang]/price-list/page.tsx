import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import { getServices } from "@/lib/api/public";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function PriceListPage({
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

  return (
    <div className="space-y-16 pb-16 pt-10">
      <Container>
        <SectionHeading
          eyebrow={t("pricePage.eyebrow")}
          title={t("pricePage.title")}
          description={t("pricePage.description")}
        />
      </Container>

      <Container className="space-y-6">
        {services.length ? (
          services.map((service) => (
            <div
              key={service.id}
              className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ink)]">
                    {service.name}
                  </h3>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {service.description || t("pricePage.serviceFallback")}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                  {service.key}
                </span>
              </div>
              {service.priceOptions.length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {service.priceOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--mist)] px-4 py-3 text-sm"
                    >
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
            {t("pricePage.emptyState")}
          </div>
        )}
      </Container>
    </div>
  );
}
