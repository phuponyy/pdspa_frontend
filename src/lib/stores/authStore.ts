"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

const setAuthCookie = (token: string | null) => {
  if (typeof document === "undefined") return;
  if (!token) {
    document.cookie = "pd2_token=; Max-Age=0; path=/; SameSite=Lax";
    return;
  }
  document.cookie = `pd2_token=${token}; path=/; SameSite=Lax`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => {
        set({ token });
        setAuthCookie(token);
      },
      clearToken: () => {
        set({ token: null });
        setAuthCookie(null);
      },
    }),
    {
      name: "pd2-auth",
    }
  )
);
