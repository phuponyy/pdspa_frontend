import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

export type AutoCrawlCardProps = {
  autoConfig: {
    lang: string;
    device: string;
    includePosts: boolean;
    includePages: boolean;
  };
  setAutoConfig: (value: {
    lang: string;
    device: string;
    includePosts: boolean;
    includePages: boolean;
  }) => void;
  isCrawling: boolean;
  onCrawl: () => void;
};

export const AutoCrawlCard = ({ autoConfig, setAutoConfig, isCrawling, onCrawl }: AutoCrawlCardProps) => {
  return (
    <AdminCard className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
      <AdminCardHeader className="pb-0">
        <AdminCardTitle className="text-base !text-[var(--ink)]">Auto crawl từ CMS</AdminCardTitle>
      </AdminCardHeader>
      <AdminCardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Lang
            <select
              className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
              value={autoConfig.lang}
              onChange={(event) => setAutoConfig({ ...autoConfig, lang: event.target.value })}
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
              onChange={(event) => setAutoConfig({ ...autoConfig, device: event.target.value })}
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
                onChange={(event) => setAutoConfig({ ...autoConfig, includePosts: event.target.checked })}
              />
              Bài viết
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoConfig.includePages}
                onChange={(event) => setAutoConfig({ ...autoConfig, includePages: event.target.checked })}
              />
              Trang
            </label>
          </div>
          <AdminButton onClick={onCrawl} disabled={isCrawling}>
            {isCrawling ? "Crawling..." : "Auto crawl"}
          </AdminButton>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
};
