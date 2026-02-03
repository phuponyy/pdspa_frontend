import { Button } from "@/components/ui/button";

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
        <Button variant="secondary" onClick={() => onScan(false)} disabled={isScanning}>
          {isScanning ? "Scanning..." : "Auto fetch"}
        </Button>
        <Button
          variant="outline"
          className="!text-white !border-[var(--line)] hover:!bg-black/5"
          onClick={() => onScan(true)}
          disabled={isScanning}
        >
          Force scan
        </Button>
        <Button
          variant="outline"
          className="!text-white !border-[var(--line)] hover:!bg-black/5"
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
    </div>
  );
};
