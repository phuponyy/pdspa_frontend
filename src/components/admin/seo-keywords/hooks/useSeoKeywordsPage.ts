import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  crawlSeoKeywords,
  exportSeoKeywordsCsv,
  getSeoKeywords,
  runSeoKeywordScan,
} from "@/lib/api/admin";
import { useToast } from "@/components/common/ToastProvider";

export const useSeoKeywordsPage = () => {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [autoConfig, setAutoConfig] = useState({
    lang: "vi",
    device: "desktop",
    includePosts: true,
    includePages: true,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const notify = (message: string, type: "success" | "error" | "info" = "info") =>
    toast.push({ message, type });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["seo-keywords", page, pageSize, query],
    queryFn: () => getSeoKeywords(undefined, page, pageSize, query),
  });

  const keywords = data?.data?.items ?? [];
  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  const exportCsv = async (keywordId?: number) => {
    try {
      setIsExporting(true);
      const csv = await exportSeoKeywordsCsv(undefined, keywordId);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = keywordId ? `keyword-${keywordId}.csv` : "keyword-tracking.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify("Đã xuất CSV.", "success");
    } catch {
      notify("Không thể xuất CSV.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const runScan = async (force = false) => {
    try {
      setIsScanning(true);
      const response = await runSeoKeywordScan(undefined, { force });
      const summary = response?.data;
      if (summary) {
        notify(
          `Scan xong: ${summary.scanned} scanned, ${summary.improved} up, ${summary.dropped} down, ${summary.errors} errors.`,
          "success"
        );
      } else {
        notify("Đã chạy scan.", "success");
      }
      await refetch();
    } catch {
      notify("Không thể chạy scan.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  const runCrawl = async () => {
    try {
      setIsCrawling(true);
      const response = await crawlSeoKeywords(undefined, autoConfig);
      const data = response?.data;
      if (data) {
        notify(`Đã thêm ${data.created} keyword, bỏ qua ${data.skipped}.`, "success");
      } else {
        notify("Đã crawl keyword.", "success");
      }
      await refetch();
    } catch {
      notify("Không thể crawl keyword.", "error");
    } finally {
      setIsCrawling(false);
    }
  };

  return {
    query,
    setQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    autoConfig,
    setAutoConfig,
    isScanning,
    isCrawling,
    isExporting,
    keywords,
    totalPages,
    isLoading,
    refetch,
    notify,
    exportCsv,
    runScan,
    runCrawl,
  };
};
