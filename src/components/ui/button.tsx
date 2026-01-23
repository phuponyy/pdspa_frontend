"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

const baseStyles =
  "inline-flex cursor-pointer items-center justify-center rounded-2xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7bff] disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-[#2f7bff] text-white shadow-[0_10px_30px_rgba(47,123,255,0.35)] hover:bg-[#2a6fe6]",
  secondary: "bg-[#1f2b3a] text-white hover:bg-[#243245]",
  outline: "border border-white/10 bg-transparent text-white hover:bg-white/5",
  ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-5",
  icon: "h-10 w-10",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
