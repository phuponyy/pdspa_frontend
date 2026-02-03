import { useEffect, useRef, useState } from "react";

export const useHeaderScroll = (enabled: boolean) => {
  const [hideTopBar, setHideTopBar] = useState(false);
  const lastScroll = useRef(0);
  const lastToggle = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        const current = Math.max(window.scrollY, 0);
        const isScrollingDown = current > lastScroll.current;
        const distance = Math.abs(current - lastToggle.current);

        if (current < 120) {
          setHideTopBar(false);
          lastToggle.current = current;
        } else if (distance > 80) {
          setHideTopBar(isScrollingDown);
          lastToggle.current = current;
        }

        lastScroll.current = current;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  return hideTopBar;
};
