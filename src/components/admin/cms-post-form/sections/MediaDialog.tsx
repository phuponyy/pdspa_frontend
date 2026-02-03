import Input from "@/components/common/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/constants";

export type MediaItem = { id: number | string; url: string; filename: string };

export type MediaDialogProps = {
  open: boolean;
  mediaQuery: string;
  mediaItems: MediaItem[];
  onOpenChange: (open: boolean) => void;
  onQueryChange: (value: string) => void;
  onSelect: (url: string) => void;
};

export default function MediaDialog({
  open,
  mediaQuery,
  mediaItems,
  onOpenChange,
  onQueryChange,
  onSelect,
}: MediaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn ảnh</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            label="Tìm ảnh"
            value={mediaQuery}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-auto md:grid-cols-3">
            {mediaItems.length ? (
              mediaItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className="group overflow-hidden rounded-xl border border-[var(--line)] bg-white"
                >
                  <img
                    src={item.url.startsWith("http") ? item.url : `${API_BASE_URL}${item.url}`}
                    alt={item.filename}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-2 text-left text-[10px] text-[var(--ink-muted)]">
                    {item.filename}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-xs text-[var(--ink-muted)]">Không có ảnh phù hợp.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
