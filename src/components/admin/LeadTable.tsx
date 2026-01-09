import Link from "next/link";
import StatusPill from "./StatusPill";
import type { Lead } from "@/types/lead.types";
import { formatDateTime } from "@/lib/utils/formatters";

export default function LeadTable({
  lang,
  leads,
}: {
  lang: string;
  leads: Lead[];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[var(--mist)] text-left text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          <tr>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Phone</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Created</th>
            <th className="px-6 py-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.length ? (
            leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t border-[var(--line)] text-[var(--ink-muted)]"
              >
                <td className="px-6 py-4 text-[var(--ink)]">
                  {lead.fullName}
                </td>
                <td className="px-6 py-4">{lead.phone}</td>
                <td className="px-6 py-4">
                  <StatusPill status={lead.status} />
                </td>
                <td className="px-6 py-4">{formatDateTime(lead.createdAt)}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/${lang}/admin/leads/${lead.id}`}
                    className="text-[var(--jade)] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-6 py-6 text-[var(--ink-muted)]" colSpan={5}>
                No leads found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
