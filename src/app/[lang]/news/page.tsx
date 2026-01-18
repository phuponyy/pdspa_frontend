import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function NewsPage({
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
      <Container>
        <SectionHeading
          eyebrow={t("newsPage.eyebrow")}
          title={t("newsPage.title")}
          description={t("newsPage.description")}
        />
      </Container>
      <Container className="rounded-3xl border border-dashed border-[var(--line)] bg-white/70 p-8 text-sm text-[var(--ink-muted)]">
        {t("newsPage.emptyState")}
      </Container>
    </div>
  );
}
