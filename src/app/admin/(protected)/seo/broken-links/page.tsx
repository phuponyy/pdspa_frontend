"use client";

import { useState } from "react";
import { scanBrokenLinks } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastProvider";
import type { BrokenLinkItem, BrokenLinksScanResponse } from "@/types/api.types";

type ScanResult = BrokenLinksScanResponse["data"] | null;

export default function BrokenLinksPage() {
  const toast = useToast();
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [includeExternal, setIncludeExternal] = useState(false);
  const [maxLinks, setMaxLinks] = useState(300);
  const [timeoutMs, setTimeoutMs] = useState(8000);
  const [concurrency, setConcurrency] = useState(6);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);
  const [error, setError] = useState<string | null>(null);

  const notify = (message: string, type: "success" | "error" | "info" = "info") =>
    toast.push({ message, type });

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const response = await scanBrokenLinks(undefined, {
        lang,
        includeDrafts,
        includeExternal,
        maxLinks,
        timeoutMs,
        concurrency,
      });
      setResult(response?.data ?? null);
      notify("Đã quét xong broken links.", "success");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể quét broken links. Vui lòng thử lại.";
      setError(message);
      notify(message, "error");
    } finally {
      setIsScanning(false);
    }
  };

  const brokenItems: BrokenLinkItem[] = result?.broken ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            SEO
          </p>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">
            Broken Links Scanner
          </h1>
        </div>
        <Button onClick={handleScan} disabled={isScanning}>
          {isScanning ? "Đang quét..." : "Quét ngay"}
        </Button>
      </div>

      <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium text-[var(--ink-muted)]">
              Ngôn ngữ
              <select
                value={lang}
                onChange={(event) => setLang(event.target.value as "vi" | "en")}
                className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
              >
                <option value="vi">VI</option>
                <option value="en">EN</option>
              </select>
            </label>
            <Input
              label="Giới hạn link"
              type="number"
              min={50}
              max={2000}
              value={maxLinks}
              onChange={(event) => setMaxLinks(Number(event.target.value || 0))}
            />
            <Input
              label="Timeout (ms)"
              type="number"
              min={1000}
              max={30000}
              value={timeoutMs}
              onChange={(event) => setTimeoutMs(Number(event.target.value || 0))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Concurrency"
              type="number"
              min={1}
              max={12}
              value={concurrency}
              onChange={(event) => setConcurrency(Number(event.target.value || 1))}
            />
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)]">
              <input
                type="checkbox"
                checked={includeDrafts}
                onChange={(event) => setIncludeDrafts(event.target.checked)}
              />
              Quét cả bản nháp
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)]">
              <input
                type="checkbox"
                checked={includeExternal}
                onChange={(event) => setIncludeExternal(event.target.checked)}
              />
              Quét link ngoài domain
            </label>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Tổng link
              </p>
              <p className="text-2xl font-semibold text-[var(--ink)]">
                {result.totalFound}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Đã kiểm tra
              </p>
              <p className="text-2xl font-semibold text-[var(--ink)]">
                {result.checked}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Broken links
              </p>
              <p className="text-2xl font-semibold text-rose-600">
                {result.brokenCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Bỏ qua (ngoài)
              </p>
              <p className="text-2xl font-semibold text-[var(--ink)]">
                {result.skipped.external}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {result ? (
        <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              <span>Broken links</span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
                {brokenItems.length}
              </span>
            </div>
            {brokenItems.length ? (
              <div className="space-y-3">
                {brokenItems.map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  >
                    <div className="min-w-[220px] flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                        URL
                      </p>
                      <p className="break-all font-semibold text-[var(--ink)]">
                        {item.url}
                      </p>
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                      {item.status ?? "ERR"}
                    </div>
                    <div className="text-xs text-[var(--ink-muted)]">
                      {item.sourceType} · {item.sourceTitle || "Unknown"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator === "undefined") return;
                        const fullUrl =
                          item.url.startsWith("http")
                            ? item.url
                            : `${result.baseUrl}${item.url}`;
                        navigator.clipboard?.writeText(fullUrl);
                        notify("Đã copy URL.", "success");
                      }}
                      className="ml-auto rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--ink-muted)]">
                Không phát hiện broken links.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
