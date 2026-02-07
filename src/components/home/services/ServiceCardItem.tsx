import type { ServiceCard } from "./types";

type ServiceCardProps = {
  card: ServiceCard;
  lang: string;
  onBook: (serviceId: number) => void;
  buildServiceLink: (serviceId: number) => string;
};

export default function ServiceCardItem({
  card,
  lang,
  onBook,
  buildServiceLink,
}: ServiceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--accent-strong)]/40 bg-[#0b0b0b] shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/35 to-black/95" />
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
            {lang === "vi" ? "Xem chi tiết" : "View details"}
          </a>
          <button
            type="button"
            onClick={() => onBook(card.id)}
            className="rounded-full bg-[#ff9f40] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1a1410] shadow-[0_12px_24px_rgba(255,159,64,0.35)]"
          >
            {lang === "vi" ? "Đặt lịch" : "Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
