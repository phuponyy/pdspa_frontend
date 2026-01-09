"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeads } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/authStore";
import LeadTable from "@/components/admin/LeadTable";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";

export default function LeadsPage({ params }: { params: { lang: string } }) {
  const token = useAuthStore((state) => state.token);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page],
    queryFn: () => getLeads(token || "", page, limit),
    enabled: Boolean(token),
  });

  const payload = data?.data;
  const leads = Array.isArray(payload) ? payload : payload?.items || [];
  const total =
    (!Array.isArray(payload) && payload?.meta?.total) ?? leads.length;
  const maxPage = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
          Leads
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Customer inquiries
        </h1>
      </div>
      {isLoading ? (
        <Loading label="Loading leads" />
      ) : (
        <>
          <LeadTable lang={params.lang} leads={leads} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--ink-muted)]">
              Page {page} of {maxPage}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={page >= maxPage}
                onClick={() => setPage((prev) => Math.min(maxPage, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
