"use client";

import Container from "@/components/common/Container";
import type { HomeSectionItem } from "@/types/page.types";

type HomeHighlightsProps = {
  heading: string;
  description?: string;
  items?: HomeSectionItem[];
};

export default function HomeHighlightsSection({
  heading,
  description,
  items = [],
}: HomeHighlightsProps) {
  const normalized = items.filter(Boolean).slice(0, 3);

  return (
    <section className="bg-[#050505] py-20">
      <Container className="space-y-10 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] md:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="text-sm leading-relaxed text-white/70 md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {normalized.map((item, index) => (
            <div key={`${item.title}-${index}`} className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-[var(--accent-strong)]/70 bg-[#0b0b0b] shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
                <img
                  src={item.imageUrl || "/images/hero-placeholder.svg"}
                  alt={item.title || `Highlight ${index + 1}`}
                  className="h-56 w-full object-cover"
                  loading="lazy"
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
