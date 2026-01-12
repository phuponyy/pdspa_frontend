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
        "rounded-full px-3 py-1 text-xs font-semibold",
        status === "NEW" && "bg-[rgba(255,106,61,0.12)] text-[#b84522]",
        status === "CONTACTED" && "bg-[rgba(255,182,64,0.22)] text-[#a86712]",
        status === "DONE" && "bg-[rgba(34,197,94,0.12)] text-[#166534]"
      )}
    >
      {statusMap[status] || status}
    </span>
  );
}
