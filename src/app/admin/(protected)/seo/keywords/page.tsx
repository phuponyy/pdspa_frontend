"use client";

import { useMemo, useState } from "react";
import { createSeoKeyword } from "@/lib/api/admin";
import { useSeoKeywordsPage } from "@/components/admin/seo-keywords/hooks/useSeoKeywordsPage";
import { KeywordHeader } from "@/components/admin/seo-keywords/components/KeywordHeader";
import { AutoCrawlCard } from "@/components/admin/seo-keywords/components/AutoCrawlCard";
import { AddKeywordCard } from "@/components/admin/seo-keywords/components/AddKeywordCard";
import { KeywordSearchBar } from "@/components/admin/seo-keywords/components/KeywordSearchBar";
import { KeywordRow } from "@/components/admin/seo-keywords/components/KeywordRow";

export default function KeywordTrackingPage() {
  const page = useSeoKeywordsPage();
  const [form, setForm] = useState({
    phrase: "",
    targetUrl: "",
    locale: "vi-VN",
    device: "desktop",
    notes: "",
  });

  const canSubmit = useMemo(() => form.phrase.trim().length >= 2, [form.phrase]);

  const handleCreateKeyword = async () => {
    try {
      await createSeoKeyword(undefined, {
        phrase: form.phrase.trim(),
        targetUrl: form.targetUrl.trim() || undefined,
        locale: form.locale,
        device: form.device,
        notes: form.notes.trim() || undefined,
      });
      page.notify("Đã thêm keyword.", "success");
      setForm({
        phrase: "",
        targetUrl: "",
        locale: "vi-VN",
        device: "desktop",
        notes: "",
      });
      page.refetch();
    } catch {
      page.notify("Không thể thêm keyword.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <KeywordHeader
        isScanning={page.isScanning}
        isExporting={page.isExporting}
        onScan={page.runScan}
        onExport={() => page.exportCsv()}
      />

      <AutoCrawlCard
        autoConfig={page.autoConfig}
        setAutoConfig={page.setAutoConfig}
        isCrawling={page.isCrawling}
        onCrawl={page.runCrawl}
      />

      <AddKeywordCard form={form} setForm={setForm} onSubmit={handleCreateKeyword} canSubmit={canSubmit} />

      <KeywordSearchBar
        query={page.query}
        setQuery={page.setQuery}
        page={page.page}
        totalPages={page.totalPages}
        pageSize={page.pageSize}
        setPage={page.setPage}
        setPageSize={page.setPageSize}
      />

      {page.isLoading ? (
        <p className="text-sm text-[var(--ink-muted)]">Loading keywords...</p>
      ) : page.keywords.length ? (
        <div className="space-y-4">
          {page.keywords.map((keyword) => (
            <KeywordRow
              key={keyword.id}
              keyword={keyword}
              onUpdated={page.refetch}
              notify={page.notify}
              onExport={page.exportCsv}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-muted)]">Chưa có keyword.</p>
      )}
    </div>
  );
}
