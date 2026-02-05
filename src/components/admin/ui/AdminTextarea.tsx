"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

export type AdminTextareaProps = React.ComponentPropsWithoutRef<typeof Textarea>;

export default function AdminTextarea({ className, ...props }: AdminTextareaProps) {
  return (
    <Textarea
      {...props}
      className={cn(
        "border-white/10 bg-[#141414] text-white placeholder:text-white/40 focus-visible:ring-[var(--accent-strong)]",
        className
      )}
    />
  );
}
