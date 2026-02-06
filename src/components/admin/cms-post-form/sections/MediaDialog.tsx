import MediaLibraryView from "@/components/admin/media/MediaLibraryView";
import type { MediaItem } from "@/types/api.types";
import { AdminDialog, AdminDialogContent, AdminDialogHeader, AdminDialogTitle } from "@/components/admin/ui/AdminDialog";

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
    <AdminDialog open={open} onOpenChange={onOpenChange}>
      <AdminDialogContent className="max-h-[92vh] w-[min(1280px,96vw)] overflow-hidden p-0">
        <AdminDialogHeader className="px-6 pt-6">
          <AdminDialogTitle>Chọn ảnh từ Media</AdminDialogTitle>
        </AdminDialogHeader>
        <div className="max-h-[calc(92vh-76px)] overflow-y-auto px-6 pb-6">
          <MediaLibraryView
            onPick={(item) => {
              onPick(item);
              onOpenChange(false);
            }}
            pickLabel={pickLabel}
          />
        </div>
      </AdminDialogContent>
    </AdminDialog>
  );
}
