"use client";

import Container from "@/components/common/Container";
import type { HomeSectionItem } from "@/types/page.types";

type HomeRecoveryProps = {
  heading: string;
  items?: HomeSectionItem[];
};

export default function HomeRecoverySection({
  heading,
  items = [],
}: HomeRecoveryProps) {
  const normalized = items.slice(0, 3);

  return (
    <section className="py-16">
      <Container className="space-y-10">
        <h2 className="text-center text-2xl font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)] md:text-3xl">
          {heading}
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {normalized.map((item, index) => (
            <div key={`${item.title}-${index}`} className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-[var(--accent-strong)]/60 shadow-[0_18px_50px_rgba(255,106,61,0.35)]">
                <img
                  src={item.imageUrl || "/images/hero-placeholder.svg"}
                  alt={item.title || `Recovery ${index + 1}`}
                  className="h-56 w-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold uppercase text-[var(--accent-strong)]">
                  {item.title}
                </h3>
                <p className="flex items-start gap-2 text-sm text-white/80">
                  <span className="mt-1 h-3 w-3 rounded-[4px] bg-emerald-400" />
                  <span>{item.description}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
