"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { renderCmsHtml } from "@/lib/sanitize";
import { resolveMediaUrl } from "@/lib/media";
import type { GoodMassageContent } from "@/types/goodMassage.types";

type GoodMassageClientProps = {
  lang: "vi" | "en";
  content: GoodMassageContent;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function GoodMassageClient({ lang, content }: GoodMassageClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroImage = content.hero.heroImage ? resolveMediaUrl(content.hero.heroImage) : "";

  const galleryItems = useMemo(
    () => content.gallery.items.filter((item) => item.imageUrl),
    [content.gallery.items]
  );

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".gm-hero", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".gm-stat", {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".gm-stats",
          start: "top 85%",
        },
      });

      gsap.from(".gm-highlight", {
        opacity: 0,
        y: 32,
        stagger: 0.15,
        duration: 0.9,
        scrollTrigger: {
          trigger: ".gm-highlights",
          start: "top 85%",
        },
      });

      if (heroImage) {
        gsap.to(".gm-hero-image", {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: ".gm-hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (galleryItems.length) {
        ScrollTrigger.create({
          trigger: ".gm-gallery",
          start: "top 70%",
          end: "+=500",
          pin: ".gm-gallery-pin",
          pinSpacing: true,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [galleryItems.length, heroImage]);

  return (
    <div ref={rootRef} className="bg-black text-white">
      <section className="gm-hero relative overflow-hidden pb-16 pt-16 md:pb-20 md:pt-24">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[#ff9f40]">
              {content.hero.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              {content.hero.title}
            </h1>
            {content.hero.subtitle ? (
              <p className="text-base text-white/70 md:text-lg">
                {content.hero.subtitle}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="rounded-full bg-[linear-gradient(135deg,#ff6a3d,#ffb640)] px-6 py-3 text-sm uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(255,106,61,0.35)] hover:brightness-110"
                onClick={() => {
                  if (content.cta.primaryLink) {
                    window.location.href = content.cta.primaryLink;
                  }
                }}
              >
                {content.cta.primaryLabel || (lang === "vi" ? "Đặt lịch" : "Book now")}
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-10 top-8 h-32 w-32 rounded-full bg-[rgba(255,159,64,0.3)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0c0c] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={content.hero.title}
                  className="gm-hero-image h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[320px] w-full items-center justify-center text-sm text-white/40">
                  {lang === "vi" ? "Chưa có ảnh" : "No image"}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="gm-intro pb-10">
        <Container className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {content.intro.heading ? (
              <h2 className="text-2xl font-semibold text-white md:text-3xl">
                {content.intro.heading}
              </h2>
            ) : null}
            {content.intro.descriptionHtml ? (
              <div
                className="prose prose-invert max-w-none text-white/75"
                dangerouslySetInnerHTML={{
                  __html: renderCmsHtml(content.intro.descriptionHtml),
                }}
              />
            ) : null}
          </div>
          <div className="gm-stats grid gap-4 md:grid-cols-2">
            {content.stats.map((stat, idx) => (
              <div
                key={`${stat.label}-${idx}`}
                className="gm-stat rounded-2xl border border-white/10 bg-[#121212] p-5"
              >
                <p className="text-2xl font-semibold text-[#ffb35c]">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="gm-highlights pb-12">
        <Container className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#ff9f40]">
              Panda Spa
            </p>
            <h3 className="text-2xl font-semibold text-white md:text-3xl">
              {lang === "vi" ? "Điểm nổi bật" : "Highlights"}
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.highlights.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                className="gm-highlight overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="h-48 w-full overflow-hidden bg-black/40">
                  {item.imageUrl ? (
                    <img
                      src={resolveMediaUrl(item.imageUrl)}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="space-y-2 p-5">
                  <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                  {item.description ? (
                    <p className="text-sm text-white/70">{item.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="gm-gallery pb-12">
        <Container className="space-y-6">
          {content.gallery.title ? (
            <h3 className="text-2xl font-semibold text-white">{content.gallery.title}</h3>
          ) : null}
          <div className="gm-gallery-pin grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item, idx) => (
              <div
                key={`${item.imageUrl}-${idx}`}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f]"
              >
                <img
                  src={resolveMediaUrl(item.imageUrl)}
                  alt={item.caption || content.hero.title}
                  className="h-56 w-full object-cover"
                  loading="lazy"
                />
                {item.caption ? (
                  <p className="px-4 pb-4 pt-3 text-xs uppercase tracking-[0.2em] text-white/60">
                    {item.caption}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {content.faqHtml ? (
        <section className="pb-12">
          <Container>
            <div
              className="prose prose-invert max-w-none text-white/75"
              dangerouslySetInnerHTML={{ __html: renderCmsHtml(content.faqHtml) }}
            />
          </Container>
        </section>
      ) : null}

      <section className="pb-20">
        <Container>
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,153,64,0.2),rgba(0,0,0,0.9))] p-8 text-center md:p-12">
            {content.cta.title ? (
              <h3 className="text-2xl font-semibold text-white md:text-3xl">
                {content.cta.title}
              </h3>
            ) : null}
            {content.cta.description ? (
              <p className="mt-3 text-sm text-white/70 md:text-base">
                {content.cta.description}
              </p>
            ) : null}
            <div className="mt-6 flex justify-center">
              <Button
                className="px-6 py-3 text-sm uppercase tracking-[0.2em]"
                onClick={() => {
                  if (content.cta.primaryLink) {
                    window.location.href = content.cta.primaryLink;
                  }
                }}
              >
                {content.cta.primaryLabel || (lang === "vi" ? "Đặt lịch" : "Book now")}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
