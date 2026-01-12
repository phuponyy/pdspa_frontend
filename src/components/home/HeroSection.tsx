import Button from "@/components/common/Button";
import Container from "@/components/common/Container";
import HeroSlider from "@/components/home/HeroSlider";
import type { HeroSlide } from "@/types/page.types";

export default function HeroSection({
  badge,
  heading,
  subheading,
  imageUrl,
  images,
  slides,
  primaryCta,
  secondaryCta,
}: {
  badge?: string;
  heading: string;
  subheading: string;
  imageUrl?: string;
  images?: string[];
  slides?: HeroSlide[];
  primaryCta?: string;
  secondaryCta?: string;
}) {
  if (slides?.length || images?.length) {
    return (
      <section className="relative min-h-screen bg-black">
        <HeroSlider
          images={images || []}
          slides={slides}
          intervalMs={3000}
          className="home-hero-swiper"
        />
        {!slides?.length ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        ) : null}
        {!slides?.length ? (
          <Container className="pointer-events-none absolute inset-0 flex items-center">
            <div className="max-w-2xl space-y-6 text-white">
              {badge ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white">
                  {badge}
                </span>
              ) : null}
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                {heading}
              </h1>
              <p className="text-base leading-relaxed text-white/80 md:text-lg">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>{primaryCta || "Book now"}</Button>
                <Button variant="outline">
                  {secondaryCta || "Quick consult"}
                </Button>
              </div>
            </div>
          </Container>
        ) : null}
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden pb-16 pt-16">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          {badge ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,106,61,0.12)] px-4 py-1 text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              {badge}
            </span>
          ) : null}
          <h1 className="text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
            <span className="text-accent">{heading}</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[var(--ink-muted)] md:text-lg">
            {subheading}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button>{primaryCta || "Book now"}</Button>
            <Button variant="outline">{secondaryCta || "Quick consult"}</Button>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-[var(--line)] bg-white/80 p-4 text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)] md:grid-cols-4">
            <span>4.9 rating</span>
            <span>30+ rituals</span>
            <span>12 therapists</span>
            <span>Open daily</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-8 top-12 h-24 w-24 rounded-full bg-[rgba(255,182,64,0.3)] blur-2xl" />
          <div className="absolute -left-10 bottom-6 h-28 w-28 rounded-full bg-[rgba(255,106,61,0.25)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-[var(--line)] bg-white shadow-[var(--shadow)]">
            {images?.length ? (
              <HeroSlider images={images} intervalMs={3000} />
            ) : (
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={imageUrl || "/images/hero-placeholder.svg"}
                  alt="Spa hero"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="grid gap-3 border-t border-[var(--line)] p-6 text-sm text-[var(--ink-muted)]">
              <p className="text-base font-semibold text-[var(--ink)]">
                Signature rituals
              </p>
              <p>
                Crafted journeys combining aroma, warmth, and skilled pressure to
                reset mind and body.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
