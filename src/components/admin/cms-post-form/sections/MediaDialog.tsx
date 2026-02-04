import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MediaLibraryView from "@/components/admin/media/MediaLibraryView";
import type { MediaItem } from "@/types/api.types";

export type MediaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (item: MediaItem) => void;
  pickLabel?: string;
};

export default function MediaDialog({
  open,
  onOpenChange,
  onPick,
  pickLabel,
}: MediaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(1280px,96vw)] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Chọn ảnh từ Media</DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(92vh-76px)] overflow-y-auto px-6 pb-6">
          <MediaLibraryView
            onPick={(item) => {
              onPick(item);
              onOpenChange(false);
            }}
            pickLabel={pickLabel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
