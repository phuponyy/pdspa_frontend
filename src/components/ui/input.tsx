"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  endAdornment?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, endAdornment, ...props }, ref) => (
    <div className="relative w-full">
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-white/10 bg-[#1a2430] px-4 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7bff]",
          endAdornment ? "pr-11" : "",
          className
        )}
        {...props}
      />
      {endAdornment ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
          {endAdornment}
        </span>
      ) : null}
    </div>
  )
);

Input.displayName = "Input";
