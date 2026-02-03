import Cropper from "react-easy-crop";
import FocusTrap from "@/components/common/FocusTrap";

export type CropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (value: { x: number; y: number }) => void;
  onZoomChange: (value: number) => void;
  onCropComplete: (areaPixels: { width: number; height: number; x: number; y: number }) => void;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
};

export default function CropDialog({
  open,
  imageSrc,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onSave,
}: CropDialogProps) {
  if (!open || !imageSrc) return null;
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 p-6">
      <FocusTrap active={open}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Crop thumbnail"
          className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f1722] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Crop thumbnail (1:1)
          </div>
          <div className="relative h-[420px] w-full bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={(_, croppedAreaPixels) => onCropComplete(croppedAreaPixels)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <label className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => onZoomChange(Number(event.target.value))}
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-full bg-[#ff9f40] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1410]"
              >
                Crop & save
              </button>
            </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
