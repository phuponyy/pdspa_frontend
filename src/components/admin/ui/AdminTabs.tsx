"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";

export { Tabs as AdminTabs, TabsContent as AdminTabsContent };

export function AdminTabsList(props: React.ComponentPropsWithoutRef<typeof TabsList>) {
  return (
    <TabsList
      {...props}
      className={cn(
        "bg-[#0b1220] text-white border border-white/10",
        props.className
      )}
    />
  );
}

export function AdminTabsTrigger(props: React.ComponentPropsWithoutRef<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      {...props}
      className={cn(
        "text-white/70 data-[state=active]:bg-[#ff8a4b] data-[state=active]:text-white",
        props.className
      )}
    />
  );
}
