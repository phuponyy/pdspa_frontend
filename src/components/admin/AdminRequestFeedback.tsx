"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/common/ToastProvider";

type AdminRequestEvent = {
  phase: "start" | "end";
  id: string;
  method: string;
  path: string;
  ok?: boolean;
  status?: number;
};

export default function AdminRequestFeedback() {
  const toast = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const detail = (event as CustomEvent<AdminRequestEvent>).detail;
      if (!detail) return;
      if (detail.phase === "start") {
        setPendingCount((prev) => prev + 1);
        if (timerRef.current === null) {
          timerRef.current = window.setTimeout(() => {
            setShowLoading(true);
          }, 600);
        }
        return;
      }

      setPendingCount((prev) => Math.max(0, prev - 1));
      if (detail.ok === false) {
        return;
      }
    };

    window.addEventListener("admin-request", handleEvent as EventListener);
    return () => {
      window.removeEventListener("admin-request", handleEvent as EventListener);
    };
  }, [toast]);

  useEffect(() => {
    if (pendingCount === 0) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowLoading(false);
    }
  }, [pendingCount]);

  if (!showLoading) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#0f1722] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      Đang Tải...
    </div>
  );
}
