import Button from "@/components/common/Button";
import type { CmsPageStatus } from "../types";

export type FloatingBarProps = {
  show: boolean;
  languages: string[];
  activeLang: string;
  status: CmsPageStatus;
  isDirty: boolean;
  isSaving: boolean;
  currentTitle: string;
  onChangeLang: (code: string) => void;
  onSetStatus: (status: CmsPageStatus) => void;
  onSave: () => void;
};

export const FloatingBar = ({
  show,
  languages,
  activeLang,
  status,
  isDirty,
  isSaving,
  currentTitle,
  onChangeLang,
  onSetStatus,
  onSave,
}: FloatingBarProps) => {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[120] w-[92vw] max-w-5xl -translate-x-1/2 transition-all duration-300 ${
        show ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[#0f1722]/95 px-5 py-3 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
            {activeLang.toUpperCase()} · {status === "PUBLISHED" ? "Published" : "Draft"}
          </p>
          <p className="truncate text-sm font-semibold text-white">
            {currentTitle || "Untitled page"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {languages.map((code) => (
              <button
                key={`float-lang-${code}`}
                type="button"
                onClick={() => onChangeLang(code)}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  activeLang === code
                    ? "bg-[#ff9f40] text-[#1a1410]"
                    : "border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            <button
              type="button"
              onClick={() => onSetStatus("DRAFT")}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                status === "DRAFT"
                  ? "bg-white text-[#0f1722]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => onSetStatus("PUBLISHED")}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                status === "PUBLISHED"
                  ? "bg-[#ff9f40] text-[#1a1410]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Publish
            </button>
          </div>
          {isDirty ? (
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
              Unsaved
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
              Saved
            </span>
          )}
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};
