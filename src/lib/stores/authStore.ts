"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  hydrated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
  setHydrated: () => void;
};

const ONE_DAY_SECONDS = 60 * 60 * 24;

const setAuthCookie = (token: string | null) => {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  if (!token) {
    document.cookie = `pd2_token=; Max-Age=0; path=/; SameSite=Strict${secure}`;
    return;
  }
  document.cookie = `pd2_token=${token}; Max-Age=${ONE_DAY_SECONDS}; path=/; SameSite=Strict${secure}`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      hydrated: false,
      setToken: (token) => {
        set({ token });
        setAuthCookie(token);
      },
      clearToken: () => {
        set({ token: null });
        setAuthCookie(null);
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "pd2-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
