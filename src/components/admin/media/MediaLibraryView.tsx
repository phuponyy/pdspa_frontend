"use client";

import { Button } from "@/components/ui/button";
import Loading from "@/components/common/Loading";
import { MediaToolbar } from "./components/MediaToolbar";
import { MediaGrid } from "./components/MediaGrid";
import { MediaDetails } from "./components/MediaDetails";
import { BulkActionBar } from "./components/BulkActionBar";
import { useMediaLibrary } from "./hooks/useMediaLibrary";
import type { MediaItem } from "@/types/api.types";

export type MediaLibraryViewProps = {
  onPick?: (item: MediaItem) => void;
  pickLabel?: string;
};

export default function MediaLibraryView({ onPick, pickLabel }: MediaLibraryViewProps) {
  const media = useMediaLibrary();

  return (
    <div
      className={`relative space-y-6 rounded-[28px] border border-white/10 bg-[#0b0b0b] p-6 text-white ${
        media.isDragging ? "outline outline-2 outline-[var(--accent-strong)]" : ""
      }`}
      onDragEnter={media.onDragEnter}
      onDrop={media.onDrop}
      onDragOver={media.onDragOver}
      onDragLeave={media.onDragLeave}
    >
      {media.isDragging ? (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-[28px] bg-black/70 text-sm text-white/80">
          Thả ảnh vào đây để upload
        </div>
      ) : null}
      <input
        ref={media.uploadInputRef}
        type="file"
        hidden
        multiple
        accept="image/*"
        onChange={(event) => {
          if (event.target.files?.length) {
            media.uploadFiles(event.target.files);
            event.target.value = "";
          }
        }}
      />
      <input
        ref={media.replaceInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            media.handleReplace(file);
            event.target.value = "";
          }
        }}
      />

      <MediaToolbar
        query={media.query}
        setQuery={media.setQuery}
        sort={media.sort}
        setSort={media.setSort}
        format={media.format}
        setFormat={media.setFormat}
        folderFilter={media.folderFilter}
        setFolderFilter={media.setFolderFilter}
        tagFilter={media.tagFilter}
        setTagFilter={media.setTagFilter}
        folders={media.folders}
        tags={media.tags}
        newFolderName={media.newFolderName}
        setNewFolderName={media.setNewFolderName}
        newTagName={media.newTagName}
        setNewTagName={media.setNewTagName}
        onCreateFolder={media.handleCreateFolder}
        onCreateTag={media.handleCreateTag}
        onUploadClick={() => media.uploadInputRef.current?.click()}
        onBulkDelete={media.handleBulkDelete}
        selectedCount={media.selectedIds.length}
      />

      {media.isLoading ? (
        <Loading />
      ) : (
        <div className="relative">
          <div className="space-y-4">
            <MediaGrid
              items={media.items}
              selectedId={media.selectedId}
              onSelect={media.setSelectedId}
              selectedIds={media.selectedIds}
              onToggleSelect={media.toggleSelect}
              duplicateMap={media.duplicateMap}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
              <span>
                {media.totalItems} items · page {media.page}/{media.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => media.setPage(Math.max(1, media.page - 1))}
                  disabled={media.page <= 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => media.setPage(Math.min(media.totalPages, media.page + 1))}
                  disabled={media.page >= media.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>

            <BulkActionBar
              selectedCount={media.selectedIds.length}
              folders={media.folders}
              tags={media.tags}
              onBulkDelete={media.handleBulkDelete}
              onBulkDownload={media.handleBulkDownload}
              onBulkConvertWebp={media.handleBulkConvertWebp}
              onBulkMove={media.handleBulkMove}
              onBulkTag={media.handleBulkTag}
            />
          </div>

          {media.selected ? (
            <>
              <div
                className="fixed inset-0 z-30 bg-black/60"
                onClick={() => media.setSelectedId(null)}
              />
              <aside className="fixed right-0 top-0 z-40 h-full w-[360px] max-w-full border-l border-white/10 bg-[#0b0b0b] p-4 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                <MediaDetails
                  item={media.selected}
                  editedFilename={media.editedFilename}
                  setEditedFilename={media.setEditedFilename}
                  selectedFolderId={media.selectedFolderId}
                  setSelectedFolderId={media.setSelectedFolderId}
                  selectedTagIds={media.selectedTagIds}
                  setSelectedTagIds={media.setSelectedTagIds}
                  folders={media.folders}
                  tags={media.tags}
                  dimensions={media.selectedDimensions}
                  onPick={onPick}
                  pickLabel={pickLabel}
                  onSaveMeta={media.handleUpdateMeta}
                  onReplace={() => media.openReplace(media.selected?.id ?? 0)}
                  onConvertWebp={media.handleConvertWebp}
                  onDelete={() => media.handleDelete(media.selected?.id ?? 0)}
                  onDownload={() => media.selected && media.handleDownload(media.selected)}
                  onClose={() => media.setSelectedId(null)}
                />
              </aside>
            </>
          ) : null}
        </div>
      )}

    </div>
  );
}
