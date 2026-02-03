"use client";

import Container from "@/components/common/Container";
import type { HomeSectionItem } from "@/types/page.types";

type HomeRecoveryProps = {
  heading: string;
  description?: string;
  items?: HomeSectionItem[];
};

export default function HomeRecoverySection({
  heading,
  description,
  items = [],
}: HomeRecoveryProps) {
  const normalized = items.filter(Boolean).slice(0, 2);

  return (
    <section className="bg-[#050505] py-20">
      <Container className="space-y-10 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold text-[var(--accent-strong)] md:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="text-sm leading-relaxed text-white/70 md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {normalized.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="flex items-start gap-5 rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#20110a] text-[var(--accent-strong)]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title || `Recovery ${index + 1}`}
                    className="h-10 w-10 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none">
                    <circle cx="32" cy="32" r="30" fill="#FF6A3D" opacity="0.2" />
                    <circle cx="24" cy="28" r="8" fill="#FF6A3D" />
                    <circle cx="40" cy="28" r="8" fill="#FF6A3D" />
                    <circle cx="32" cy="36" r="10" fill="#FF6A3D" />
                    <circle cx="28" cy="34" r="2.5" fill="#111" />
                    <circle cx="36" cy="34" r="2.5" fill="#111" />
                    <path
                      d="M28 40c2.5 2.5 5.5 2.5 8 0"
                      stroke="#111"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--accent-strong)] md:text-lg">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 md:text-base">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
