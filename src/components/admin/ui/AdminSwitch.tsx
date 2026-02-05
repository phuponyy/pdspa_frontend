"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";

export type AdminSwitchProps = React.ComponentPropsWithoutRef<typeof Switch>;

export default function AdminSwitch({ className, ...props }: AdminSwitchProps) {
  return (
    <Switch
      {...props}
      className={cn(
        "border border-white/10 bg-[#0b1220] data-[state=checked]:bg-[#ff8a4b] data-[state=checked]:text-white",
        className
      )}
    />
  );
}
