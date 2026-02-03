import FeatureGrid from "./FeatureGrid";
import type { HomeSection } from "@/types/page.types";
import { getServerTranslator } from "@/lib/i18n/server";

const findSection = (sections: HomeSection[] | undefined, keys: string[]) =>
  sections?.find((section) =>
    keys.some(
      (key) =>
        section.type?.toLowerCase() === key ||
        section.key?.toLowerCase() === key
    )
  );

export default async function SectionRenderer({
  sections,
  lang,
}: {
  sections?: HomeSection[];
  lang: string;
}) {
  const i18n = await getServerTranslator(lang);
  const t = i18n.t.bind(i18n);
  const features = findSection(sections, ["features", "why", "highlights"]);

  return (
    <>
      <FeatureGrid
        title={features?.heading || t("sections.features")}
        description={features?.description || features?.subheading}
        items={features?.items}
      />
    </>
  );
}
