"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { HeroSlide } from "@/types/page.types";

export default function HeroSlider({
  images = [],
  slides,
  intervalMs = 3000,
  className,
}: {
  images: string[];
  slides?: HeroSlide[];
  intervalMs?: number;
  className?: string;
}) {
  const slideItems = useMemo(() => {
    if (slides?.length) {
      return slides.filter((slide) => slide?.imageUrl).slice(0, 10);
    }
    return images
      .filter(Boolean)
      .slice(0, 10)
      .map((src) => ({ imageUrl: src }));
  }, [images, slides]);

  if (!slideItems.length) return null;

  return (
    <Swiper
      className={className}
      modules={[Autoplay, EffectFade, Navigation, Pagination]}
      effect="fade"
      loop={slideItems.length > 1}
      autoplay={
        slideItems.length > 1
          ? { delay: intervalMs, disableOnInteraction: false }
          : false
      }
      navigation
      pagination={{ clickable: true }}
      fadeEffect={{ crossFade: true }}
    >
      {slideItems.map((slide, idx) => (
        <SwiperSlide key={`${slide.imageUrl}-${idx}`}>
          <div className="relative h-full w-full">
            <img
              src={slide.imageUrl}
              alt={`Hero slide ${idx + 1}`}
              className="h-full w-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            {(slide.heading || slide.subheading) && (
              <div className="pointer-events-none absolute inset-0 flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
                  <div className="max-w-2xl space-y-5 text-white">
                    {slide.heading ? (
                      <h2 className="text-4xl font-semibold leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] md:text-6xl">
                        {slide.heading}
                      </h2>
                    ) : null}
                    {slide.subheading ? (
                      <p className="text-base text-white/90 drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] md:text-xl">
                        {slide.subheading}
                      </p>
                    ) : null}
                    {(slide.primaryCta || slide.secondaryCta) && (
                      <div className="pointer-events-auto flex flex-wrap gap-3">
                        {slide.primaryCta ? (
                          <a
                            href={slide.primaryLink || "#"}
                            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6a3d,#ffb640)] px-7 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(255,106,61,0.5)] transition hover:brightness-110"
                            target={
                              slide.primaryLink?.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              slide.primaryLink?.startsWith("http")
                                ? "noreferrer"
                                : undefined
                            }
                          >
                            {slide.primaryCta}
                          </a>
                        ) : null}
                        {slide.secondaryCta ? (
                          <a
                            href={slide.secondaryLink || "#"}
                            className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:border-white hover:bg-white/20"
                            target={
                              slide.secondaryLink?.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              slide.secondaryLink?.startsWith("http")
                                ? "noreferrer"
                                : undefined
                            }
                          >
                            {slide.secondaryCta}
                          </a>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
