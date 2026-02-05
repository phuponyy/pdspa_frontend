"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

export type AdminTextareaProps = React.ComponentPropsWithoutRef<typeof Textarea> & {
  label?: string;
};

export default function AdminTextarea({ className, label, ...props }: AdminTextareaProps) {
  return (
    <Textarea
      aria-label={props["aria-label"] ?? label}
      {...props}
      className={cn(
        "border border-white/10 bg-[#0b1220] text-white placeholder:text-white/60 focus-visible:ring-[#ff8a4b]",
        className
      )}
    />
  );
}
