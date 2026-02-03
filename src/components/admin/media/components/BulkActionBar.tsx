import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { MediaFolder, MediaTag } from "@/types/api.types";

type BulkActionBarProps = {
  selectedCount: number;
  folders: MediaFolder[];
  tags: MediaTag[];
  onBulkDelete: () => void;
  onBulkDownload: () => void;
  onBulkMove: (folderId: number | null) => void;
  onBulkTag: (tagIds: number[]) => void;
};

export const BulkActionBar = ({
  selectedCount,
  folders,
  tags,
  onBulkDelete,
  onBulkDownload,
  onBulkMove,
  onBulkTag,
}: BulkActionBarProps) => {
  const [mode, setMode] = useState<"none" | "move" | "tag">("none");
  const [folderId, setFolderId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);

  const isTagActive = useMemo(() => new Set(tagIds), [tagIds]);

  if (!selectedCount) return null;

  return (
    <div className="sticky bottom-6 z-20 mx-auto w-full max-w-3xl rounded-full border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/80">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-strong)] text-xs font-semibold text-black">
            {selectedCount}
          </span>{" "}
          files selected
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setMode((prev) => (prev === "move" ? "none" : "move"))}
          >
            Move
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setMode((prev) => (prev === "tag" ? "none" : "tag"))}
          >
            Tag
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={onBulkDownload}
          >
            Download
          </Button>
          <Button type="button" className="h-9" onClick={onBulkDelete}>
            Delete
          </Button>
        </div>
      </div>
      {mode === "move" ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <select
            className="h-9 rounded-lg border border-white/10 bg-[#141414] px-3 text-white/80"
            value={folderId ?? ""}
            onChange={(event) =>
              setFolderId(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <Button type="button" className="h-9" onClick={() => onBulkMove(folderId)}>
            Apply move
          </Button>
        </div>
      ) : null}
      {mode === "tag" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/70">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`rounded-full border px-3 py-1 ${
                isTagActive.has(tag.id)
                  ? "border-[var(--accent-strong)] text-[var(--accent-strong)]"
                  : "border-white/10 text-white/70 hover:text-white"
              }`}
              onClick={() =>
                setTagIds(
                  isTagActive.has(tag.id)
                    ? tagIds.filter((value) => value !== tag.id)
                    : [...tagIds, tag.id]
                )
              }
            >
              {tag.name}
            </button>
          ))}
          <Button type="button" className="h-8 px-3 text-xs" onClick={() => onBulkTag(tagIds)}>
            Apply tags
          </Button>
        </div>
      ) : null}
    </div>
  );
};
