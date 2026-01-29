"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addSeoKeywordRank,
  crawlSeoKeywords,
  createSeoKeyword,
  deleteSeoKeyword,
  exportSeoKeywordsCsv,
  getSeoKeywordHistory,
  getSeoKeywords,
  getSeoKeywordSerpPreview,
  runSeoKeywordScan,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LineChart from "@/components/admin/charts/LineChart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/common/ToastProvider";
import type {
  SeoKeyword,
  SeoKeywordRank,
  SeoKeywordSerpPreviewItem,
} from "@/types/api.types";

export default function KeywordTrackingPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form, setForm] = useState({
    phrase: "",
    targetUrl: "",
    locale: "vi-VN",
    device: "desktop",
    notes: "",
  });
  const [autoConfig, setAutoConfig] = useState({
    lang: "vi",
    device: "desktop",
    includePosts: true,
    includePages: true,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["seo-keywords", page, pageSize, query],
    queryFn: () => getSeoKeywords(undefined, page, pageSize, query),
  });

  const keywords = data?.data?.items ?? [];
  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  const notify = (message: string, type: "success" | "error" | "info" = "info") =>
    toast.push({ message, type });

  const canSubmit = form.phrase.trim().length >= 2;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            SEO
          </p>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">
            Keyword Tracking & Rank History
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => runScan(false)} disabled={isScanning}>
            {isScanning ? "Scanning..." : "Auto fetch"}
          </Button>
          <Button
            variant="outline"
            className="!text-white !border-[var(--line)] hover:!bg-black/5"
            onClick={() => runScan(true)}
            disabled={isScanning}
          >
            Force scan
          </Button>
          <Button
            variant="outline"
            className="!text-white !border-[var(--line)] hover:!bg-black/5"
            onClick={() => exportCsv()}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <CardHeader className="pb-0">
          <CardTitle className="text-base !text-[var(--ink)]">Auto crawl từ CMS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
              Lang
              <select
                className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                value={autoConfig.lang}
                onChange={(event) =>
                  setAutoConfig((prev) => ({ ...prev, lang: event.target.value }))
                }
              >
                <option value="vi">vi</option>
                <option value="en">en</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
              Device
              <select
                className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                value={autoConfig.device}
                onChange={(event) =>
                  setAutoConfig((prev) => ({ ...prev, device: event.target.value }))
                }
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--ink-muted)]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoConfig.includePosts}
                  onChange={(event) =>
                    setAutoConfig((prev) => ({
                      ...prev,
                      includePosts: event.target.checked,
                    }))
                  }
                />
                Bài viết
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoConfig.includePages}
                  onChange={(event) =>
                    setAutoConfig((prev) => ({
                      ...prev,
                      includePages: event.target.checked,
                    }))
                  }
                />
                Trang
              </label>
            </div>
            <Button onClick={runCrawl} disabled={isCrawling}>
              {isCrawling ? "Crawling..." : "Auto crawl"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <CardHeader className="pb-0">
          <CardTitle className="text-base !text-[var(--ink)]">Thêm keyword</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[2fr_2fr_1fr_1fr]">
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
              Keyword
              <Input
                placeholder="Spa da nang"
                value={form.phrase}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phrase: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
              Target URL
              <Input
                placeholder="https://..."
                value={form.targetUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, targetUrl: event.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
              Locale
              <select
                className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                value={form.locale}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, locale: event.target.value }))
                }
              >
                <option value="vi-VN">vi-VN</option>
                <option value="en-US">en-US</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
              Device
              <select
                className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
                value={form.device}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, device: event.target.value }))
                }
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Notes
            <Input
              placeholder="Ghi chú mục tiêu..."
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
            />
          </label>
          <Button
            disabled={!canSubmit}
            onClick={async () => {
              try {
                await createSeoKeyword(undefined, {
                  phrase: form.phrase.trim(),
                  targetUrl: form.targetUrl.trim() || undefined,
                  locale: form.locale,
                  device: form.device,
                  notes: form.notes.trim() || undefined,
                });
                notify("Đã thêm keyword.", "success");
                setForm({
                  phrase: "",
                  targetUrl: "",
                  locale: "vi-VN",
                  device: "desktop",
                  notes: "",
                });
                refetch();
              } catch {
                notify("Không thể thêm keyword.", "error");
              }
            }}
          >
            Add keyword
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink-muted)] shadow-[var(--shadow)]">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          Search
          <Input
            placeholder="Find keyword..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          Per page
          <select
            className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--ink-muted)]">Loading keywords...</p>
      ) : keywords.length ? (
        <div className="space-y-4">
          {keywords.map((keyword) => (
            <KeywordRow
              key={keyword.id}
              keyword={keyword}
              onUpdated={refetch}
              notify={notify}
              onExport={exportCsv}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-muted)]">Chưa có keyword.</p>
      )}
    </div>
  );
}

function KeywordRow({
  keyword,
  onUpdated,
  notify,
  onExport,
}: {
  keyword: SeoKeyword;
  onUpdated: () => void | Promise<unknown>;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  onExport: (keywordId?: number) => Promise<void>;
}) {
  const latest = keyword.ranks?.[0];
  const [showHistory, setShowHistory] = useState(false);
  const [showSerp, setShowSerp] = useState(false);
  const [rankForm, setRankForm] = useState({
    position: latest?.position?.toString() || "",
    resultUrl: latest?.resultUrl || "",
    checkedAt: "",
  });
  const [history, setHistory] = useState<SeoKeywordRank[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [serpItems, setSerpItems] = useState<SeoKeywordSerpPreviewItem[]>([]);
  const [loadingSerp, setLoadingSerp] = useState(false);

  const chart = useMemo(() => {
    const sorted = [...history].reverse();
    return {
      labels: sorted.map((item) =>
        item.checkedAt ? new Date(item.checkedAt).toLocaleDateString() : ""
      ),
      values: sorted.map((item) => item.position ?? 0),
    };
  }, [history]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await getSeoKeywordHistory(undefined, keyword.id, 30);
      setHistory(response?.data?.items ?? []);
    } catch {
      notify("Không thể tải lịch sử.", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleToggleHistory = async () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next && history.length === 0) {
      await loadHistory();
    }
  };

  const normalizeUrl = (value?: string) => {
    if (!value) return null;
    try {
      const url = new URL(value);
      return {
        host: url.host.toLowerCase(),
        path: url.pathname.replace(/\/+$/, "") || "/",
      };
    } catch {
      return null;
    }
  };

  const isTargetResult = (link?: string) => {
    if (!keyword.targetUrl || !link) return false;
    const target = normalizeUrl(keyword.targetUrl);
    const result = normalizeUrl(link);
    if (!target || !result) return false;
    if (target.host !== result.host) return false;
    if (target.path === "/") return true;
    return result.path.startsWith(target.path);
  };

  const loadSerpPreview = async () => {
    setLoadingSerp(true);
    try {
      const response = await getSeoKeywordSerpPreview(undefined, keyword.id, 10);
      setSerpItems(response?.data?.items ?? []);
    } catch {
      notify("Không thể tải SERP preview.", "error");
    } finally {
      setLoadingSerp(false);
    }
  };

  const handleToggleSerp = async () => {
    const next = !showSerp;
    setShowSerp(next);
    if (next && serpItems.length === 0) {
      await loadSerpPreview();
    }
  };

  return (
    <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[220px] flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Keyword
            </p>
            <p className="text-base font-semibold text-[var(--ink)]">{keyword.phrase}</p>
            {keyword.targetUrl ? (
              <p className="text-xs text-[var(--ink-muted)]">{keyword.targetUrl}</p>
            ) : null}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            {keyword.locale} · {keyword.device}
          </div>
          <div className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            {keyword.isActive ? "Active" : "Paused"}
          </div>
          <div className="text-xs text-[var(--ink-muted)]">
            Latest: {latest?.position ?? "--"}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleToggleHistory()}
            >
              {showHistory ? "Hide history" : "Show history"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
              onClick={() => handleToggleSerp()}
            >
              {showSerp ? "Hide SERP" : "SERP preview"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
              onClick={() => onExport(keyword.id)}
            >
              Export CSV
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Delete keyword?</AlertDialogTitle>
                <AlertDialogDescription>
                  Lịch sử rank cũng sẽ bị xoá.
                </AlertDialogDescription>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await deleteSeoKeyword(undefined, keyword.id);
                        await onUpdated();
                        notify("Đã xoá keyword.", "success");
                      } catch {
                        notify("Không thể xoá keyword.", "error");
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_2fr_1fr_auto] lg:items-end">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Position
            <Input
              type="number"
              min={1}
              value={rankForm.position}
              onChange={(event) =>
                setRankForm((prev) => ({ ...prev, position: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Result URL
            <Input
              value={rankForm.resultUrl}
              onChange={(event) =>
                setRankForm((prev) => ({ ...prev, resultUrl: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Checked at
            <Input
              type="datetime-local"
              value={rankForm.checkedAt}
              onChange={(event) =>
                setRankForm((prev) => ({ ...prev, checkedAt: event.target.value }))
              }
            />
          </label>
          <Button
            onClick={async () => {
              try {
                await addSeoKeywordRank(undefined, keyword.id, {
                  position: rankForm.position ? Number(rankForm.position) : undefined,
                  resultUrl: rankForm.resultUrl || undefined,
                  checkedAt: rankForm.checkedAt || undefined,
                });
                notify("Đã thêm rank snapshot.", "success");
                setRankForm((prev) => ({ ...prev, checkedAt: "" }));
                await onUpdated();
                if (showHistory) {
                  await loadHistory();
                }
              } catch {
                notify("Không thể thêm rank.", "error");
              }
            }}
          >
            Add rank
          </Button>
        </div>

        {showHistory ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-4">
            {loadingHistory ? (
              <p className="text-sm text-[var(--ink-muted)]">Loading history...</p>
            ) : history.length ? (
              <div className="space-y-4">
                <LineChart
                  labels={chart.labels}
                  data={chart.values}
                  label="Rank position"
                  color="#f97316"
                />
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
                    >
                      <span>#{item.position ?? "--"}</span>
                      <span className="text-xs text-[var(--ink-muted)]">
                        {item.checkedAt}
                      </span>
                      <span className="truncate text-xs text-[var(--ink-muted)]">
                        {item.resultUrl ?? "-"}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                        {item.status ?? "UNKNOWN"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--ink-muted)]">Chưa có lịch sử.</p>
            )}
          </div>
        ) : null}

        {showSerp ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-4">
            {loadingSerp ? (
              <p className="text-sm text-[var(--ink-muted)]">Loading SERP preview...</p>
            ) : serpItems.length ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    SERP preview
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
                    onClick={loadSerpPreview}
                    disabled={loadingSerp}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="space-y-3">
                  {serpItems.map((item, index) => {
                    const highlight = isTargetResult(item.link);
                    return (
                      <div
                        key={`${item.link ?? "row"}-${index}`}
                        className={`flex flex-wrap items-start gap-3 rounded-2xl border px-3 py-3 text-sm ${
                          highlight
                            ? "border-[var(--accent-strong)] bg-[rgba(255,106,61,0.08)]"
                            : "border-[var(--line)] bg-white"
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-black/5 text-xs font-semibold text-[var(--ink-muted)]">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title || "SERP image"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            `#${item.position ?? index + 1}`
                          )}
                        </div>
                        <div className="min-w-[200px] flex-1">
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            {item.title || "No title"}
                          </p>
                          {item.link ? (
                            <p className="truncate text-xs text-[var(--ink-muted)]">
                              {item.link}
                            </p>
                          ) : null}
                          {item.snippet ? (
                            <p className="mt-1 text-xs text-[var(--ink-muted)]">
                              {item.snippet}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs text-[var(--ink-muted)]">
                          <span>#{item.position ?? index + 1}</span>
                          {item.source ? <span>{item.source}</span> : null}
                          {highlight ? (
                            <span className="rounded-full bg-[var(--accent-strong)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                              Your site
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--ink-muted)]">
                Chưa có dữ liệu SERP.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
