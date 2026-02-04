import Button from "@/components/common/Button";
import { API_BASE_URL } from "@/lib/constants";

export type ThumbnailPanelProps = {
  thumbnailUrl: string | null | undefined;
  onOpenMediaDialog: () => void;
  onUploadFile?: (file: File) => void;
  onClearThumbnail: () => void;
};

export default function ThumbnailPanel({
  thumbnailUrl,
  onOpenMediaDialog,
  onUploadFile,
  onClearThumbnail,
}: ThumbnailPanelProps) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Thumbnail</p>
        <span className="text-[10px] text-[var(--ink-muted)]">Ảnh đại diện</span>
      </div>
      <div
        className="mt-3 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--mist)]"
        style={{ aspectRatio: "1 / 1" }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl.startsWith("/") ? `${API_BASE_URL}${thumbnailUrl}` : thumbnailUrl}
            alt="Thumbnail"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--ink-muted)]">
            Chưa có ảnh
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenMediaDialog}>
          Chọn từ Media
        </Button>
        {onUploadFile ? (
          <label className="inline-flex cursor-pointer items-center rounded-full border border-[var(--line)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Upload ảnh
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const inputEl = event.currentTarget;
                const file = inputEl.files?.[0];
                if (!file) return;
                inputEl.value = "";
                onUploadFile(file);
              }}
            />
          </label>
        ) : null}
        {thumbnailUrl ? (
          <Button variant="outline" size="sm" onClick={onClearThumbnail}>
            Xoá
          </Button>
        ) : null}
      </div>
    </div>
  );
}
