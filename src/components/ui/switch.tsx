"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }
>(({ className, checked = false, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    role="switch"
    aria-checked={checked}
    className={cn(
      "relative inline-flex h-7 w-12 items-center rounded-full border border-white/10 transition",
      checked ? "bg-[#2f7bff]" : "bg-white/10",
      className
    )}
    {...props}
  >
    <span
      className={cn(
        "inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition",
        checked ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
));

Switch.displayName = "Switch";
