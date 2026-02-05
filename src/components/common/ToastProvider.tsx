"use client";

import { createContext, useContext, useMemo } from "react";
import { Toaster, toast } from "sonner";

type ToastType = "success" | "error" | "info";

type ToastOptions = {
  message: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastContextValue = {
  push: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const pushToast = ({ message, type = "info", durationMs = 3000 }: ToastOptions) => {
  const base = { duration: durationMs };
  if (type === "success") {
    toast.success(message, base);
    return;
  }
  if (type === "error") {
    toast.error(message, base);
    return;
  }
  toast(message, base);
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ToastContextValue>(() => ({ push: pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "border border-white/10 bg-[#0b1220] text-white shadow-[0_20px_50px_rgba(2,6,23,0.6)]",
            title: "text-white",
            description: "text-white/70",
            actionButton:
              "border border-[#ff8a4b] bg-white text-black hover:bg-[#fff1e8]",
            cancelButton: "bg-[#0b1220] text-white hover:bg-white/5",
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
