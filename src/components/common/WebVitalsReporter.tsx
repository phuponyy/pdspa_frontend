"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useMemo, useRef } from "react";
import { API_BASE_URL } from "@/lib/constants";

const getSessionId = () => {
  if (typeof window === "undefined") return "";
  const key = "rum_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, value);
  return value;
};

export default function WebVitalsReporter() {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  const endpoint = useMemo(() => `${API_BASE_URL}/rum/web-vitals`, []);

  useReportWebVitals((metric) => {
    if (isAdmin) return;
    const payload = {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: metric.navigationType,
      page: window.location.pathname,
      path: window.location.pathname,
      sessionId: sessionIdRef.current,
      device: window.innerWidth < 768 ? "mobile" : "desktop",
      connection: (navigator as Navigator & { connection?: { effectiveType?: string } })
        .connection?.effectiveType,
      lang: document.documentElement.lang || undefined,
    };

    try {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, blob);
      } else {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    } catch {
      // ignore reporting failures
    }
  });

  return null;
}
