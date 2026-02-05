"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type AdminButtonProps = ButtonProps;

const AdminButtonComponent = ({ className, variant, ...props }: AdminButtonProps) => (
  <Button
    variant={variant}
    className={cn(
      "border border-[#1f2937] shadow-[0_12px_30px_rgba(2,6,23,0.55)]",
      !variant || variant === "default"
        ? "bg-gradient-to-r from-[#ff8a4b] via-[#ff7a3d] to-[#ff6a2b] text-white hover:brightness-110"
        : "",
      variant === "outline"
        ? "bg-[#0f172a] text-white hover:bg-[#111827]"
        : "",
      variant === "ghost"
        ? "text-white/80 hover:bg-white/5 hover:text-white"
        : "",
      className
    )}
    {...props}
  />
);

export default AdminButtonComponent;
