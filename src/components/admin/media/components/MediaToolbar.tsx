import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MediaFolder, MediaTag } from "@/types/api.types";

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
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#101010] p-4 text-white">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-9 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
        >
          <option value="all">All formats</option>
          <option value="image">Images</option>
          <option value="video">Video</option>
        </select>
        <select
          className="h-9 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <Input
          placeholder="Search media..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-9 min-w-[220px] bg-[#1a1a1a] text-white"
        />
        <select
          className="h-9 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
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
        </select>
        <select
          className="h-9 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-xs text-white/80"
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
        </select>
        <Button className="h-9" onClick={onUploadClick}>
          Upload
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="New folder name"
          value={newFolderName}
          onChange={(event) => setNewFolderName(event.target.value)}
          className="h-9 min-w-[200px] bg-[#1a1a1a] text-white"
        />
        <Button variant="outline" className="border-white/10 bg-white/5 text-white" onClick={onCreateFolder}>
          Add folder
        </Button>
        <Input
          placeholder="New tag name"
          value={newTagName}
          onChange={(event) => setNewTagName(event.target.value)}
          className="h-9 min-w-[200px] bg-[#1a1a1a] text-white"
        />
        <Button variant="outline" className="border-white/10 bg-white/5 text-white" onClick={onCreateTag}>
          Add tag
        </Button>
      </div>
    </div>
  );
};
