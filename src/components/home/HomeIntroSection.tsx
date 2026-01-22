"use client";

import Container from "@/components/common/Container";

type HomeIntroProps = {
  heading: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  providerName?: string;
  listingName?: string;
  rating?: number;
  reviews?: number;
  rankText?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

export default function HomeIntroSection({
  heading,
  description,
  imageUrl,
  videoUrl,
  providerName = "Tripadvisor",
  listingName = "Panda Spa",
  rating = 5,
  reviews = 0,
  rankText = "",
  buttonLabel = "SPA DA NANG",
  buttonLink = "#",
}: HomeIntroProps) {
  const ratingDots = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  return (
    <section className="py-16">
      <Container className="space-y-10">
        <h2 className="text-center text-3xl font-semibold text-[var(--accent-strong)] md:text-4xl">
          {heading}
        </h2>
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="rounded-3xl bg-[#121212] p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-black">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 14l-1 4 4-2" />
                  <circle cx="9" cy="10" r="1.2" />
                  <circle cx="15" cy="10" r="1.2" />
                </svg>
              </span>
              <div>
                <p className="text-lg font-semibold">{providerName}</p>
                <p className="text-sm text-white/60">{listingName}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {ratingDots.map((filled, index) => (
                  <span
                    key={`rating-dot-${index}`}
                    className={`h-2.5 w-2.5 rounded-full ${filled ? "bg-emerald-400" : "bg-white/20"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-white/60">{reviews} reviews</span>
            </div>
            {rankText ? (
              <p className="mt-4 text-sm text-white/80">{rankText}</p>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[#0c0c0c] shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <img
              src={imageUrl || "/images/hero-placeholder.svg"}
              alt={heading}
              className="h-full w-full object-cover"
            />
            <a
              href={videoUrl || "#"}
              target={videoUrl ? "_blank" : undefined}
              rel={videoUrl ? "noreferrer" : undefined}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </a>
          </div>

          <div className="space-y-6 text-white/80">
            <p className="text-sm leading-relaxed md:text-base">{description}</p>
            <a
              href={buttonLink || "#"}
              className="inline-flex items-center rounded-full bg-[var(--accent-strong)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_16px_40px_rgba(255,106,61,0.4)]"
            >
              {buttonLabel}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
