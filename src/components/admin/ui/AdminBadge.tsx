"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type AdminBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "success" | "warning" | "draft" | "default";
};

export default function AdminBadge({ className, ...props }: AdminBadgeProps) {
  return (
    <Badge
      className={cn(
        "text-white/90",
        props.variant === "success" ? "text-emerald-300" : "",
        props.variant === "warning" ? "text-amber-300" : "",
        props.variant === "draft" ? "text-slate-300" : "",
        className
      )}
      {...props}
    />
  );
}
