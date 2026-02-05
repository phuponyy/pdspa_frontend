import AdminSwitch from "@/components/admin/ui/AdminSwitch";

export type PageEditorSidebarProps = {
  sectionNav: { label: string; href: string }[];
  languages: readonly string[];
  activeLang: "vi" | "en";
  status: "DRAFT" | "PUBLISHED";
  isSavingStatus: boolean;
  onLangChange: (lang: "vi" | "en") => void;
  persistStatus: (status: "DRAFT" | "PUBLISHED") => void;
  children: React.ReactNode;
};

export default function PageEditorSidebar({
  sectionNav,
  languages,
  activeLang,
  status,
  isSavingStatus,
  onLangChange,
  persistStatus,
  children,
}: PageEditorSidebarProps) {
  return (
    <aside className="space-y-6">
      <div className="admin-panel p-5 text-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Điều hướng nhanh</p>
        <div className="mt-4 space-y-2">
          {sectionNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-3 py-2 text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 12h10" />
                  <path d="M12 7v10" />
                </svg>
              </span>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="admin-panel p-5 text-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Cấu hình trang chủ</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3 text-white/80">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3a15 15 0 0 1 0 18" />
                  <path d="M12 3a15 15 0 0 0 0 18" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Ngôn Ngữ</p>
                <p className="text-sm font-semibold text-white">Nội dung</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0f1722] p-1">
              {languages.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLangChange(code as "vi" | "en")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    activeLang === code
                      ? "bg-[#ff9f40] text-[#1a1410]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3 text-white/80">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Trạng thái</p>
                <p className="text-sm font-semibold text-white">{status}</p>
              </div>
            </div>
            <AdminSwitch
              checked={status === "PUBLISHED"}
              onCheckedChange={(checked) => {
                if (isSavingStatus) return;
                persistStatus(checked ? "PUBLISHED" : "DRAFT");
              }}
            />
          </div>
        </div>
      </div>

      {children}
    </aside>
  );
}
