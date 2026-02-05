import { API_BASE_URL } from "@/lib/constants";
import AdminButton from "@/components/admin/ui/AdminButton";

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
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 shadow-[0_20px_50px_rgba(2,6,23,0.6)]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Thumbnail</p>
        <span className="text-[10px] text-white/50">Ảnh đại diện</span>
      </div>
      <div
        className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]"
        style={{ aspectRatio: "1 / 1" }}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl.startsWith("/") ? `${API_BASE_URL}${thumbnailUrl}` : thumbnailUrl}
            alt="Thumbnail"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/50">
            Chưa có ảnh
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AdminButton variant="outline" size="sm" onClick={onOpenMediaDialog}>
          Chọn từ Media
        </AdminButton>
        {onUploadFile ? (
          <label className="inline-flex cursor-pointer items-center rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white">
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
          <AdminButton variant="outline" size="sm" onClick={onClearThumbnail}>
            Xoá
          </AdminButton>
        ) : null}
      </div>
    </div>
  );
}
