"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";

export type AdminSwitchProps = React.ComponentPropsWithoutRef<typeof Switch>;

export default function AdminSwitch({ className, ...props }: AdminSwitchProps) {
  return (
    <Switch
      {...props}
      className={cn(
        "data-[state=checked]:bg-[var(--accent-strong)] data-[state=checked]:text-black",
        className
      )}
    />
  );
}
