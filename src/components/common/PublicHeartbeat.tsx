"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { API_BASE_URL } from "@/lib/constants";

const getSessionId = () => {
  if (typeof window === "undefined") return uuidv4();
  const existing = sessionStorage.getItem("public_live_session");
  if (existing) return existing;
  const id = uuidv4();
  sessionStorage.setItem("public_live_session", id);
  return id;
};

const getSource = () => {
  if (typeof window === "undefined") return "direct";
  if (!document.referrer) return "direct";
  try {
    return new URL(document.referrer).hostname || "referrer";
  } catch {
    return "referrer";
  }
};

const getUtm = () => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
  };
};

const getConsent = () => {
  if (typeof window === "undefined") return true;
  const value = window.localStorage.getItem("pdspa_analytics_consent");
  if (!value) return true;
  return value === "granted" || value === "true";
};

export default function PublicHeartbeat() {
  const pathname = usePathname();
  const [sessionId] = useState(getSessionId);
  const source = useMemo(getSource, []);
  const utm = useMemo(getUtm, []);
  const lastPathRef = useRef<string>("");
  const lastTsRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!pathname || pathname.includes("/admin")) return;

    const sendHeartbeat = () => {
      const now = Date.now();
      if (lastPathRef.current !== pathname) {
        lastPathRef.current = pathname;
        lastTsRef.current = now;
      }
      const payload = {
        sessionId,
        page: window.location.pathname,
        source,
        device: window.innerWidth > 768 ? "Desktop" : "Mobile",
        referrer: document.referrer
          ? (() => {
              try {
                return new URL(document.referrer).hostname || undefined;
              } catch {
                return undefined;
              }
            })()
          : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        consent: getConsent(),
        timeOnPageSec: Math.floor((now - lastTsRef.current) / 1000),
        ...utm,
      };
      fetch(`${API_BASE_URL}/live/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "omit",
        keepalive: true,
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10000);
    return () => clearInterval(interval);
  }, [pathname, sessionId, source, utm]);

  return null;
}
