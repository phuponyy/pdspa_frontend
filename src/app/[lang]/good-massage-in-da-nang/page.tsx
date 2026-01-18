import Container from "@/components/common/Container";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const i18n = await getServerTranslator(lang);
  const t = i18n.t.bind(i18n);

  return (
    <div className="space-y-16 pb-16 pt-10">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {t("aboutPage.eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
            <span className="text-accent">
              {t("aboutPage.title")}
            </span>
          </h1>
          <p className="text-base text-[var(--ink-muted)] md:text-lg">
            {t("aboutPage.description")}
          </p>
          <div className="grid gap-4 text-sm text-[var(--ink-muted)] md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="font-semibold text-[var(--ink)]">
                {t("aboutPage.therapistsTitle")}
              </p>
              <p>
                {t("aboutPage.therapistsText")}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="font-semibold text-[var(--ink)]">
                {t("aboutPage.atmosphereTitle")}
              </p>
              <p>
                {t("aboutPage.atmosphereText")}
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-8 top-10 h-24 w-24 rounded-full bg-[rgba(255,182,64,0.3)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-[var(--line)] bg-white shadow-[var(--shadow)]">
            <img
              src="/images/hero-placeholder.svg"
              alt="Panda Spa"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </Container>

      <Container className="grid gap-6 md:grid-cols-3">
        {[
          t("aboutPage.highlight1"),
          t("aboutPage.highlight2"),
          t("aboutPage.highlight3"),
        ].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--ink-muted)]"
          >
            <p className="text-base font-semibold text-[var(--ink)]">{item}</p>
            <p className="mt-2">
              {t("aboutPage.highlightText")}
            </p>
          </div>
        ))}
      </Container>
    </div>
  );
}
