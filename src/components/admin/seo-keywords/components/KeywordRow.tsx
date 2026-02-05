import { useMemo, useState } from "react";
import LineChart from "@/components/admin/charts/LineChart";
import { addSeoKeywordRank, deleteSeoKeyword, getSeoKeywordHistory, getSeoKeywordSerpPreview } from "@/lib/api/admin";
import type { SeoKeyword, SeoKeywordRank, SeoKeywordSerpPreviewItem } from "@/types/api.types";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import {
  AdminDialog,
  AdminDialogTrigger,
  AdminDialogContent,
  AdminDialogHeader,
  AdminDialogTitle,
  AdminDialogDescription,
  AdminDialogFooter,
  AdminAlertDialog,
  AdminAlertDialogTrigger,
  AdminAlertDialogAction,
  AdminAlertDialogCancel,
  AdminAlertDialogContent,
  AdminAlertDialogTitle,
  AdminAlertDialogDescription,
} from "@/components/admin/ui/AdminDialog";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

export type KeywordRowProps = {
  keyword: SeoKeyword;
  onUpdated: () => void | Promise<unknown>;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  onExport: (keywordId?: number) => Promise<void>;
};

export const KeywordRow = ({ keyword, onUpdated, notify, onExport }: KeywordRowProps) => {
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
      labels: sorted.map((item) => (item.checkedAt ? new Date(item.checkedAt).toLocaleDateString() : "")),
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
    <AdminCard className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
      <AdminCardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[220px] flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Keyword</p>
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
          <div className="text-xs text-[var(--ink-muted)]">Latest: {latest?.position ?? "--"}</div>
          <div className="ml-auto flex items-center gap-2">
            <AdminButton variant="secondary" size="sm" onClick={handleToggleHistory}>
              {showHistory ? "Hide history" : "Show history"}
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
              onClick={handleToggleSerp}
            >
              {showSerp ? "Hide SERP" : "SERP preview"}
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
              onClick={() => onExport(keyword.id)}
            >
              Export CSV
            </AdminButton>
            <AdminAlertDialog>
              <AdminAlertDialogTrigger asChild>
                <AdminButton
                  variant="outline"
                  size="sm"
                  className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
                >
                  Delete
                </AdminButton>
              </AdminAlertDialogTrigger>
              <AdminAlertDialogContent>
                <AdminAlertDialogTitle>Delete keyword?</AdminAlertDialogTitle>
                <AdminAlertDialogDescription>Lịch sử rank cũng sẽ bị xoá.</AdminAlertDialogDescription>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <AdminAlertDialogCancel>Cancel</AdminAlertDialogCancel>
                  <AdminAlertDialogAction
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
                  </AdminAlertDialogAction>
                </div>
              </AdminAlertDialogContent>
            </AdminAlertDialog>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_2fr_1fr_auto] lg:items-end">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Position
            <AdminInput
              type="number"
              min={1}
              value={rankForm.position}
              onChange={(event) => setRankForm((prev) => ({ ...prev, position: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Result URL
            <AdminInput
              value={rankForm.resultUrl}
              onChange={(event) => setRankForm((prev) => ({ ...prev, resultUrl: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Checked at
            <AdminInput
              type="datetime-local"
              value={rankForm.checkedAt}
              onChange={(event) => setRankForm((prev) => ({ ...prev, checkedAt: event.target.value }))}
            />
          </label>
          <AdminButton
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
          </AdminButton>
        </div>

        {showHistory ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-4">
            {loadingHistory ? (
              <p className="text-sm text-[var(--ink-muted)]">Loading history...</p>
            ) : history.length ? (
              <div className="space-y-4">
                <LineChart labels={chart.labels} data={chart.values} label="Rank position" color="#f97316" />
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
                    >
                      <span>#{item.position ?? "--"}</span>
                      <span className="text-xs text-[var(--ink-muted)]">{item.checkedAt}</span>
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
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">SERP preview</p>
                  <AdminButton
                    variant="outline"
                    size="sm"
                    className="!text-[var(--ink)] !border-[var(--line)] hover:!bg-black/5"
                    onClick={loadSerpPreview}
                    disabled={loadingSerp}
                  >
                    Refresh
                  </AdminButton>
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
                          <p className="text-sm font-semibold text-[var(--ink)]">{item.title || "No title"}</p>
                          {item.link ? (
                            <p className="truncate text-xs text-[var(--ink-muted)]">{item.link}</p>
                          ) : null}
                          {item.snippet ? (
                            <p className="mt-1 text-xs text-[var(--ink-muted)]">{item.snippet}</p>
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
              <p className="text-sm text-[var(--ink-muted)]">Chưa có dữ liệu SERP.</p>
            )}
          </div>
        ) : null}
      </AdminCardContent>
    </AdminCard>
  );
};
