"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type AdminButtonProps = ButtonProps;

const AdminButtonComponent = ({ className, variant, ...props }: AdminButtonProps) => (
  <Button
    variant={variant}
    className={cn(
      "border-white/10 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
      !variant || variant === "default"
        ? "bg-[var(--accent-strong)] text-black hover:bg-[#ff7a4a]"
        : "",
      variant === "outline"
        ? "bg-white/5 text-white hover:bg-white/10"
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
