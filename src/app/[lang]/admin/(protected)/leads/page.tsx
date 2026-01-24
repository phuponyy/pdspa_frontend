"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeads } from "@/lib/api/admin";
import LeadTable from "@/components/admin/LeadTable";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";

export default function LeadsPage() {
  const basePath = "/admin";
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page],
    queryFn: () => getLeads(undefined, page, limit),
  });

  const payload = data?.data;
  const leads = payload?.items || [];
  const total = payload?.pagination?.total ?? leads.length;
  const maxPage =
    payload?.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Quản lý Leads</h1>
      </div>
      {isLoading ? (
        <Loading label="Loading leads" />
      ) : (
        <>
          <LeadTable basePath={basePath} leads={leads} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {page} of {maxPage}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
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
