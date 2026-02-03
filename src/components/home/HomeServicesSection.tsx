"use client";

import Container from "@/components/common/Container";
import { API_BASE_URL } from "@/lib/constants";
import type { PublicService } from "@/types/api.types";

type ServiceCardItem = {
  serviceId?: number;
  imageUrl?: string;
  label?: string;
  priceNote?: string;
};

type HomeServicesProps = {
  heading: string;
  description?: string;
  items?: ServiceCardItem[];
  services: PublicService[];
  lang: string;
};

const formatPrice = (value: number) => {
  try {
    return value.toLocaleString("vi-VN");
  } catch {
    return String(value);
  }
};

const resolveImageUrl = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }
  return trimmed;
};

export default function HomeServicesSection({
  heading,
  description,
  items = [],
  services,
  lang,
}: HomeServicesProps) {
  const cards = items
    .filter((item) => item.serviceId)
    .map((item) => {
      const service = services.find((svc) => svc.id === item.serviceId);
      if (!service) return null;
      const prices = service.priceOptions.map((option) => option.price);
      const minPrice = prices.length ? Math.min(...prices) : null;
      return {
        id: service.id,
        title: item.label || service.name,
        imageUrl: resolveImageUrl(item.imageUrl),
        priceNote:
          item.priceNote ||
          (minPrice !== null
            ? `From ${formatPrice(minPrice)} VND`
            : lang === "vi"
              ? "Liên hệ"
              : "Contact us"),
      };
    })
    .filter(Boolean) as {
    id: number;
    title: string;
    imageUrl?: string;
    priceNote: string;
  }[];

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
            <div
              key={card.id}
              className="group relative overflow-hidden rounded-3xl border border-[var(--accent-strong)]/40 bg-[#0b0b0b] shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
              <img
                src={card.imageUrl || "/images/hero-placeholder.svg"}
                alt={card.title}
                className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
                <h3 className="text-lg font-semibold uppercase tracking-[0.08em] text-[var(--accent-strong)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {card.priceNote}
                </p>
                <div className="mt-3 flex items-center gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <a
                    href={buildServiceLink(card.id)}
                    className="rounded-full border border-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:border-white"
                  >
                    Xem chi tiết
                  </a>
                  <button
                    type="button"
                    onClick={() => openBooking(card.id)}
                    className="rounded-full bg-[#ff9f40] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1a1410] shadow-[0_12px_24px_rgba(255,159,64,0.35)]"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
