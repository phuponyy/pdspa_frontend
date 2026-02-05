import { resolveMediaPreview } from "../utils";
import type { MediaItem } from "@/types/api.types";

export type MediaGridProps = {
  items: MediaItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  duplicateMap: Map<string, number>;
};

export const MediaGrid = ({
  items,
  selectedId,
  onSelect,
  selectedIds,
  onToggleSelect,
  duplicateMap,
}: MediaGridProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isChecked = selectedIds.includes(item.id);
        const duplicateCount = item.checksum ? duplicateMap.get(item.checksum) ?? 0 : 0;
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-[#262525] text-left transition ${
              isSelected ? "border-[var(--accent-strong)]" : "border-white/5 hover:border-white/20"
            }`}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(item.id);
              }
            }}
          >
            <div className="absolute left-3 top-3 z-10 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
              {item.mimeType?.split("/")[1] || "file"}
            </div>
            <div
              className={`absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                isChecked
                  ? "border-[var(--accent-strong)] bg-[var(--accent-strong)] text-black"
                  : "border-white/20 text-white/70"
              }`}
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onToggleSelect(item.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggleSelect(item.id);
                }
              }}
              aria-label="Toggle select"
            >
              {isChecked ? "✓" : ""}
            </div>
            {duplicateCount > 1 ? (
              <span className="absolute right-3 top-12 z-10 rounded-full bg-amber-500/90 px-2 py-1 text-[10px] font-semibold text-black">
                Duplicate
              </span>
            ) : null}
            <div className="relative">
              <img
                src={resolveMediaPreview(item)}
                alt={item.filename}
                className="h-44 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
            </div>
            <div className="space-y-1 p-3">
              <p className="line-clamp-1 text-sm font-semibold text-white">{item.filename}</p>
              <p className="text-xs text-white/50">{item.mimeType}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
