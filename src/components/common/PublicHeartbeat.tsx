"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function PublicHeartbeat() {
  const pathname = usePathname();
  const [sessionId] = useState(getSessionId);
  const source = useMemo(getSource, []);

  useEffect(() => {
    if (!pathname || pathname.includes("/admin")) return;

    const sendHeartbeat = () => {
      const payload = {
        sessionId,
        page: window.location.pathname,
        source,
        device: window.innerWidth > 768 ? "Desktop" : "Mobile",
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
  }, [pathname, sessionId, source]);

  return null;
}
