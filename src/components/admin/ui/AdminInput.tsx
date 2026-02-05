"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const AdminInputComponent = ({ className, label, ...props }: AdminInputProps) => (
  <Input
    aria-label={props["aria-label"] ?? label}
    className={cn(
      "h-10 border border-white/10 bg-[#0b1220] text-white placeholder:text-white/60 focus-visible:ring-[#ff8a4b]",
      className
    )}
    {...props}
  />
);

export default AdminInputComponent;
