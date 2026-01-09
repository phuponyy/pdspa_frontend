import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import type { HomeSectionItem } from "@/types/page.types";

export default function FeatureGrid({
  title,
  description,
  items = [],
}: {
  title: string;
  description?: string;
  items?: HomeSectionItem[];
}) {
  return (
    <section className="py-16">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Care"
          title={title}
          description={description}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {(items.length ? items : fallbackFeatures).map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-3xl border border-[var(--line)] bg-[var(--mist)] p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-[var(--ink-muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

const fallbackFeatures: HomeSectionItem[] = [
  {
    id: "rituals",
    title: "Curated rituals",
    description:
      "Signature treatments built for calm recovery and deep restorative balance.",
  },
  {
    id: "team",
    title: "Certified therapists",
    description:
      "Skilled experts trained in pressure therapy, aroma, and mindful recovery.",
  },
  {
    id: "ambience",
    title: "Intentional ambience",
    description:
      "Muted light, essential oils, and soundscapes designed to quiet the mind.",
  },
  {
    id: "hygiene",
    title: "Premium hygiene",
    description:
      "Daily sanitization, fresh linens, and single-use supplies where needed.",
  },
];
