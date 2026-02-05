"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const AdminSelectComponent = ({ className, ...props }: AdminSelectProps) => (
  <select
    className={cn(
      "h-10 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff8a4b]",
      className
    )}
    {...props}
  />
);

export default AdminSelectComponent;
