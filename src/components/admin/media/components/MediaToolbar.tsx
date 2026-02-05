import type { MediaFolder, MediaTag } from "@/types/api.types";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminSelect from "@/components/admin/ui/AdminSelect";

export type MediaToolbarProps = {
  query: string;
  setQuery: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  format: string;
  setFormat: (value: string) => void;
  folderFilter: number | "ALL";
  setFolderFilter: (value: number | "ALL") => void;
  tagFilter: number | "ALL";
  setTagFilter: (value: number | "ALL") => void;
  folders: MediaFolder[];
  tags: MediaTag[];
  newFolderName: string;
  setNewFolderName: (value: string) => void;
  newTagName: string;
  setNewTagName: (value: string) => void;
  onCreateFolder: () => void;
  onCreateTag: () => void;
  onUploadClick: () => void;
  onBulkDelete: () => void;
  selectedCount: number;
};

export const MediaToolbar = ({
  query,
  setQuery,
  sort,
  setSort,
  format,
  setFormat,
  folderFilter,
  setFolderFilter,
  tagFilter,
  setTagFilter,
  folders,
  tags,
  newFolderName,
  setNewFolderName,
  newTagName,
  setNewTagName,
  onCreateFolder,
  onCreateTag,
  onUploadClick,
}: MediaToolbarProps) => {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#101010] p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
          <span className="text-white/50">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </span>
          <AdminInput
            placeholder="Search media..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 border-0 bg-transparent px-0 text-white placeholder:text-white/40 focus-visible:ring-0"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton
            variant="outline"
            className="h-9 border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={onUploadClick}
          >
            Upload
          </AdminButton>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Format</p>
          <AdminSelect
            className="mt-1 h-8 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
          >
            <option value="all">All formats</option>
            <option value="image">Images</option>
            <option value="video">Video</option>
          </AdminSelect>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Sort</p>
          <AdminSelect
            className="mt-1 h-8 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </AdminSelect>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Folder</p>
          <AdminSelect
            className="mt-1 h-8 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
            value={folderFilter}
            onChange={(event) =>
              setFolderFilter(event.target.value === "ALL" ? "ALL" : Number(event.target.value))
            }
          >
            <option value="ALL">All folders</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Tag</p>
          <AdminSelect
            className="mt-1 h-8 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
            value={tagFilter}
            onChange={(event) =>
              setTagFilter(event.target.value === "ALL" ? "ALL" : Number(event.target.value))
            }
          >
            <option value="ALL">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </AdminSelect>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
          <AdminInput
            placeholder="New folder name"
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            className="h-8 border-0 bg-transparent px-0 text-white placeholder:text-white/40 focus-visible:ring-0"
          />
          <AdminButton
            variant="outline"
            className="h-8 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
            onClick={onCreateFolder}
          >
            Add folder
          </AdminButton>
        </div>
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-3 py-2">
          <AdminInput
            placeholder="New tag name"
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            className="h-8 border-0 bg-transparent px-0 text-white placeholder:text-white/40 focus-visible:ring-0"
          />
          <AdminButton
            variant="outline"
            className="h-8 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
            onClick={onCreateTag}
          >
            Add tag
          </AdminButton>
        </div>
      </div>
    </div>
  );
};
