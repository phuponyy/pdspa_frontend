import { cn } from "@/lib/utils/cn";
import type { LeadStatus } from "@/types/lead.types";

const statusMap: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  DONE: "Done",
};

export default function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        status === "NEW" && "border-sky-500/30 bg-sky-500/15 text-sky-200",
        status === "CONTACTED" && "border-amber-500/30 bg-amber-500/15 text-amber-200",
        status === "DONE" && "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
      )}
    >
      {statusMap[status] || status}
    </span>
  );
}
