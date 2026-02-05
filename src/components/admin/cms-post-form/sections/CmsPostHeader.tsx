import AdminButton from "@/components/admin/ui/AdminButton";

export type CmsPostHeaderProps = {
  languages: readonly string[];
  activeLang: string;
  langCode: string;
  onChangeLang: (lang: string) => void;
  onCloneFromPrimary: () => void;
};

export default function CmsPostHeader({
  languages,
  activeLang,
  langCode,
  onChangeLang,
  onCloneFromPrimary,
}: CmsPostHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {languages.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChangeLang(code)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              activeLang === code
                ? "bg-[var(--accent-strong)] text-white"
                : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
      {activeLang !== langCode ? (
        <AdminButton variant="outline" onClick={onCloneFromPrimary}>
          Clone from {langCode.toUpperCase()}
        </AdminButton>
      ) : null}
    </div>
  );
}
