import { cn } from "@/lib/utils/cn";
import type { LeadStatus } from "@/types/lead.types";

const statusMap: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  CANCELED: "Canceled",
};

export default function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        status === "NEW" && "bg-[rgba(31,107,95,0.12)] text-[var(--jade)]",
        status === "CONTACTED" && "bg-[rgba(201,162,90,0.18)] text-[#8a6b2f]",
        status === "IN_PROGRESS" && "bg-[rgba(214,166,144,0.2)] text-[#9b5e49]",
        status === "DONE" && "bg-[rgba(63,114,82,0.2)] text-[#2f6f52]",
        status === "CANCELED" && "bg-[rgba(220,38,38,0.12)] text-[#b91c1c]"
      )}
    >
      {statusMap[status] || status}
    </span>
  );
}
