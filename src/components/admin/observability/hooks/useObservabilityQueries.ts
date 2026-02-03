import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getLighthouseReports,
  getObservabilitySummary,
  getWebVitalsSummary,
} from "@/lib/api/admin";

export const useObservabilityQueries = (
  rumRange: "7d" | "14d" | "30d",
  labRange: "7d" | "30d" | "90d"
) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-observability"],
    queryFn: () => getObservabilitySummary(undefined),
    refetchInterval: 15000,
  });
  const rumQuery = useQuery({
    queryKey: ["admin-web-vitals", rumRange],
    queryFn: () => getWebVitalsSummary(undefined, rumRange),
    refetchInterval: 60000,
  });
  const labQuery = useQuery({
    queryKey: ["admin-lighthouse", labRange],
    queryFn: () => getLighthouseReports(undefined, labRange),
    refetchInterval: 120000,
  });

  const summary = data?.data;
  const topSlow = useMemo(() => summary?.topSlow ?? [], [summary?.topSlow]);
  const rum = rumQuery.data?.data;
  const lighthouse = labQuery.data?.data || [];

  return {
    summary,
    isLoading,
    topSlow,
    rum,
    lighthouse,
  };
};
