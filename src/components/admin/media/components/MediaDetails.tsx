import { Button } from "@/components/ui/button";
import { DeleteDialog } from "./DeleteDialog";
import { Input } from "@/components/ui/input";
import type { MediaFolder, MediaItem, MediaTag } from "@/types/api.types";
import { formatBytes, resolveMediaUrl } from "../utils";

export type MediaDetailsProps = {
  item: MediaItem | null;
  editedFilename: string;
  setEditedFilename: (value: string) => void;
  selectedFolderId: number | null;
  setSelectedFolderId: (value: number | null) => void;
  selectedTagIds: number[];
  setSelectedTagIds: (value: number[]) => void;
  folders: MediaFolder[];
  tags: MediaTag[];
  dimensions: { width: number; height: number } | null;
  onSaveMeta: () => void;
  onReplace: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onClose: () => void;
};

export const MediaDetails = ({
  item,
  editedFilename,
  setEditedFilename,
  selectedFolderId,
  setSelectedFolderId,
  selectedTagIds,
  setSelectedTagIds,
  folders,
  tags,
  dimensions,
  onSaveMeta,
  onReplace,
  onDelete,
  onDownload,
  onClose,
}: MediaDetailsProps) => {
  if (!item) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/60">
        Chọn một ảnh để xem chi tiết.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#101010] p-4 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Details</p>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white"
          onClick={onClose}
          aria-label="Close details"
        >
          ✕
        </button>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
        <img src={resolveMediaUrl(item.url)} alt={item.filename} className="h-52 w-full object-cover" />
        {dimensions ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 text-[10px] text-white/80">
            {dimensions.width}×{dimensions.height}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-[#151515] p-3 text-xs text-white/70">
          <p className="text-[10px] uppercase text-white/40">Size</p>
          <p className="mt-1 text-sm text-white">{formatBytes(item.size)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#151515] p-3 text-xs text-white/70">
          <p className="text-[10px] uppercase text-white/40">Format</p>
          <p className="mt-1 text-sm text-white">{item.mimeType}</p>
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-semibold text-white/70">Title</label>
        <Input
          value={editedFilename}
          onChange={(event) => setEditedFilename(event.target.value)}
          className="bg-[#141414] text-white"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-semibold text-white/70">Folder</label>
        <select
          className="h-10 rounded-xl border border-white/10 bg-[#141414] px-3 text-sm text-white/80"
          value={selectedFolderId ?? ""}
          onChange={(event) =>
            setSelectedFolderId(event.target.value ? Number(event.target.value) : null)
          }
        >
          <option value="">No folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-semibold text-white/70">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag.id}
              className={`rounded-full border px-3 py-1 text-xs ${
                selectedTagIds.includes(tag.id)
                  ? "border-[var(--accent-strong)] text-[var(--accent-strong)]"
                  : "border-white/10 text-white/60 hover:text-white"
              }`}
              onClick={() => {
                setSelectedTagIds(
                  selectedTagIds.includes(tag.id)
                    ? selectedTagIds.filter((value) => value !== tag.id)
                    : [...selectedTagIds, tag.id]
                );
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="w-full" onClick={onSaveMeta}>
          Save changes
        </Button>
        <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white" onClick={onDownload}>
          Download
        </Button>
        <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white" onClick={onReplace}>
          Replace
        </Button>
        <DeleteDialog onConfirm={onDelete}>
          <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white">
            Delete
          </Button>
        </DeleteDialog>
      </div>
    </div>
  );
};
