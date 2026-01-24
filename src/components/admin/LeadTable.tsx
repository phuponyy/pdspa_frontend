import Link from "next/link";
import StatusPill from "./StatusPill";
import type { Lead } from "@/types/lead.types";
import { formatDateTime } from "@/lib/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_ROUTES } from "@/lib/admin/constants";

export default function LeadTable({
  leads,
}: {
  leads: Lead[];
}) {
  return (
    <div className="space-y-4">
      {leads.length ? (
        leads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="flex items-center justify-between gap-4 py-5">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">
                  {lead.fullName}
                </h3>
                <p className="text-sm text-slate-400">{lead.phone}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <StatusPill status={lead.status} />
                  <span>{formatDateTime(lead.createdAt)}</span>
                </div>
              </div>
              <Link
                href={`${ADMIN_ROUTES.leads}/${lead.id}`}
                className="text-white/60 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-slate-400">Chưa có leads.</p>
      )}
    </div>
  );
}
