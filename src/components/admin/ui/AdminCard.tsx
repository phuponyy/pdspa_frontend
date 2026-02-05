"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export type AdminCardProps = React.ComponentPropsWithoutRef<typeof Card>;

export function AdminCard({ className, ...props }: AdminCardProps) {
  return (
    <Card
      {...props}
      className={cn(
        "border border-white/10 bg-[#0b1220] text-white shadow-[0_20px_60px_rgba(2,6,23,0.55)]",
        className
      )}
    />
  );
}

export { CardContent as AdminCardContent, CardHeader as AdminCardHeader, CardTitle as AdminCardTitle };
