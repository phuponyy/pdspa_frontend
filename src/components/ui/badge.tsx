"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "success" | "warning" | "draft" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  draft: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  default: "bg-white/10 text-white/80 border-white/15",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
