"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  endAdornment?: React.ReactNode;
};

const AdminInputComponent = ({ className, label, error, endAdornment, ...props }: AdminInputProps) => (
  <Input
    aria-label={props["aria-label"] ?? label}
    aria-invalid={Boolean(error) || props["aria-invalid"]}
    className={cn(
      "h-10 border border-white/10 bg-[#0b1220] text-white placeholder:text-white/60 focus-visible:ring-[#ff8a4b]",
      error ? "border-red-500/70 focus-visible:ring-red-400/70" : "",
      className
    )}
    endAdornment={endAdornment}
    {...props}
  />
);

export default AdminInputComponent;
