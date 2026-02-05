import AdminButton from "@/components/admin/ui/AdminButton";

export type KeywordHeaderProps = {
  isScanning: boolean;
  isExporting: boolean;
  onScan: (force: boolean) => void;
  onExport: () => void;
};

export const KeywordHeader = ({ isScanning, isExporting, onScan, onExport }: KeywordHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">SEO</p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Keyword Tracking & Rank History</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AdminButton variant="secondary" onClick={() => onScan(false)} disabled={isScanning}>
          {isScanning ? "Scanning..." : "Auto fetch"}
        </AdminButton>
        <AdminButton
          variant="outline"
          className="!text-white !border-[var(--line)] hover:!bg-black/5"
          onClick={() => onScan(true)}
          disabled={isScanning}
        >
          Force scan
        </AdminButton>
        <AdminButton
          variant="outline"
          className="!text-white !border-[var(--line)] hover:!bg-black/5"
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </AdminButton>
      </div>
    </div>
  );
};
