"use client";

import Container from "@/components/common/Container";
import ServiceCardItem from "@/components/home/services/ServiceCardItem";
import { useServiceCards } from "@/components/home/services/hooks";
import type { HomeServicesProps } from "@/components/home/services/types";

export default function HomeServicesSection({
  heading,
  description,
  items = [],
  services,
  lang,
}: HomeServicesProps) {
  const cards = useServiceCards({ heading, description, items, services, lang });

  if (!cards.length) {
    return null;
  }

  const openBooking = (serviceId: number) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("public-booking-open", { detail: { serviceId } })
    );
  };

  const buildServiceLink = (serviceId: number) => {
    const base = lang === "en" ? "/dich-vu" : `/${lang}/dich-vu`;
    return `${base}?service=${serviceId}`;
  };

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ServiceCardItem
              key={card.id}
              card={card}
              lang={lang}
              onBook={openBooking}
              buildServiceLink={buildServiceLink}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
