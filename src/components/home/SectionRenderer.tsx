import ServicesSection from "./ServicesSection";
import FeatureGrid from "./FeatureGrid";
import type { HomeSection } from "@/types/page.types";
import { getDictionary } from "@/lib/i18n";

const findSection = (sections: HomeSection[] | undefined, keys: string[]) =>
  sections?.find((section) =>
    keys.some((key) => section.type?.toLowerCase() === key)
  );

export default function SectionRenderer({
  sections,
  lang,
}: {
  sections?: HomeSection[];
  lang: string;
}) {
  const dict = getDictionary(lang);
  const services = findSection(sections, ["services", "service"]);
  const features = findSection(sections, ["features", "why", "highlights"]);

  return (
    <>
      <ServicesSection
        title={services?.heading || dict.sections.services}
        description={services?.description || services?.subheading}
        items={services?.items}
      />
      <FeatureGrid
        title={features?.heading || dict.sections.features}
        description={features?.description || features?.subheading}
        items={features?.items}
      />
    </>
  );
}
