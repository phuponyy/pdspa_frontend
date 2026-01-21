"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { LiveResponse } from "@/types/admin-dashboard.types";
import { API_BASE_URL } from "@/lib/constants";
import { getAdminLive } from "@/lib/api/admin";

export const useAdminLive = () => {
  const [snapshot, setSnapshot] = useState<LiveResponse | null>(null);

  const socket = useMemo(() => {
    if (typeof window === "undefined") return null;
    return io(`${API_BASE_URL}/admin-live`, {
      transports: ["websocket"],
      withCredentials: true,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSnapshot = () => {
      getAdminLive(undefined)
        .then((data) => {
          if (isMounted) setSnapshot(data);
        })
        .catch(() => {});
    };
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data: LiveResponse) => setSnapshot(data);
    socket.on("live:update", handleUpdate);
    return () => {
      socket.off("live:update", handleUpdate);
      socket.disconnect();
    };
  }, [socket]);

  const sendHeartbeat = (payload: {
    sessionId: string;
    page?: string;
    source?: string;
    device?: string;
    location?: string;
  }) => {
    if (!socket) return;
    socket.emit("heartbeat", payload);
  };

  return { snapshot, sendHeartbeat, socket: socket as Socket | null };
};
