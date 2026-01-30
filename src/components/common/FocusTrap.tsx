"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

const focusableSelector =
  "a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex='-1'])";

export default function FocusTrap({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    );
    const target = focusables[0] || container;
    window.setTimeout(() => target.focus(), 0);
  }, [active]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!active || event.key !== "Tab") return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((item) => !item.hasAttribute("disabled"));
    if (!focusables.length) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const current = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (!current || current === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} tabIndex={-1}>
      {children}
    </div>
  );
}
