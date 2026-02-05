"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const AdminInputComponent = ({ className, ...props }: AdminInputProps) => (
  <Input
    className={cn(
      "h-10 border-white/10 bg-[#141414] text-white placeholder:text-white/40 focus-visible:ring-[var(--accent-strong)]",
      className
    )}
    {...props}
  />
);

export default AdminInputComponent;
