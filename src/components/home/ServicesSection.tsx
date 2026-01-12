import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import type { HomeSectionItem } from "@/types/page.types";

export default function ServicesSection({
  title,
  description,
  items = [],
}: {
  title: string;
  description?: string;
  items?: HomeSectionItem[];
}) {
  return (
    <section id="services" className="py-16">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Signature"
          title={title}
          description={description}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.length ? (
            items.map((item, index) => (
              <article
                key={item.id || index}
                className="group rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow)]"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                  <span>Service</span>
                  <span>{item.price ? `${item.price}k` : "Tailored"}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[var(--ink)]">
                  {item.title || "Custom therapy"}
                </h3>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  {item.description ||
                    "A calming treatment designed around your wellness goals."}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--line)] bg-white/70 p-8 text-sm text-[var(--ink-muted)]">
              Service content will appear here once configured in CMS.
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
