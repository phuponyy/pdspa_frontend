"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getLead, updateLeadStatus } from "@/lib/api/admin";
import type { LeadStatus } from "@/types/lead.types";
import { formatDateTime } from "@/lib/utils/formatters";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "DONE"];

export default function LeadDetailPage() {
  const params = useParams<{ id?: string }>();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { data, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLead(undefined, id || ""),
    enabled: Boolean(id),
  });

  const lead = data?.data;
  const [status, setStatus] = useState<LeadStatus>("NEW");

  useEffect(() => {
    if (lead?.status) {
      setStatus(lead.status);
    }
  }, [lead?.status]);

  if (isLoading) {
    return <Loading label="Loading lead details" />;
  }

  if (!lead) {
    return <p className="text-sm text-[var(--ink-muted)]">Lead not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
          Lead detail
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          {lead.fullName}
        </h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Submitted {formatDateTime(lead.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--ink-muted)] shadow-[var(--shadow)]">
        <div className="flex justify-between">
          <span>Phone</span>
          <span className="font-semibold text-[var(--ink)]">{lead.phone}</span>
        </div>
        <div className="flex justify-between">
          <span>Email</span>
          <span className="font-semibold text-[var(--ink)]">
            {lead.email || "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Language</span>
          <span className="font-semibold text-[var(--ink)]">
            {lead.langCode || "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Note</span>
          <span className="font-semibold text-[var(--ink)]">
            {lead.note || "-"}
          </span>
        </div>
      </div>

      {lead.items?.length ? (
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Requested services
          </h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--ink-muted)]">
            {lead.items.map((item, index) => (
              <div
                key={`${item.serviceId}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--mist)] px-4 py-3"
              >
                <span>
                  {item.service?.key || `Service #${item.serviceId}`}{" "}
                  {item.priceOption?.code ? `(${item.priceOption.code})` : ""}
                </span>
                <span className="font-semibold text-[var(--ink)]">
                  Qty {item.qty}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Update status
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={async () => {
              await updateLeadStatus(undefined, lead.id, { status });
            }}
          >
            Save status
          </Button>
        </div>
      </div>
    </div>
  );
}
