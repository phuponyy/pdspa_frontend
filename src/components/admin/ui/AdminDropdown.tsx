"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

export { DropdownMenu as AdminDropdownMenu, DropdownMenuTrigger as AdminDropdownMenuTrigger };

export function AdminDropdownMenuContent(
  props: React.ComponentPropsWithoutRef<typeof DropdownMenuContent>
) {
  return (
    <DropdownMenuContent
      {...props}
      className={cn(
        "border-white/10 bg-[#101826] text-white shadow-[0_16px_40px_rgba(0,0,0,0.4)]",
        props.className
      )}
    />
  );
}

export function AdminDropdownMenuItem(
  props: React.ComponentPropsWithoutRef<typeof DropdownMenuItem>
) {
  return (
    <DropdownMenuItem
      {...props}
      className={cn("focus:bg-white/10", props.className)}
    />
  );
}
