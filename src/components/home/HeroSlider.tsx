"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

export default function HeroSlider({
  images,
  intervalMs = 5000,
}: {
  images: string[];
  intervalMs?: number;
}) {
  const safeImages = useMemo(() => images.filter(Boolean).slice(0, 10), [images]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeImages.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [safeImages.length, intervalMs]);

  if (!safeImages.length) return null;

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden">
      {safeImages.map((src, idx) => (
        <img
          key={`${src}-${idx}`}
          src={src}
          alt={`Hero slide ${idx + 1}`}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            idx === index ? "opacity-100" : "opacity-0"
          )}
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {safeImages.map((_, idx) => (
          <span
            key={`dot-${idx}`}
            className={cn(
              "h-2 w-2 rounded-full transition",
              idx === index
                ? "bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.2)]"
                : "bg-[rgba(255,255,255,0.5)]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
