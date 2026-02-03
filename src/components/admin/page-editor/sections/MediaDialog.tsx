import Button from "@/components/common/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { normalizeMediaUrl, resolveMediaUrl } from "@/components/admin/page-editor/utils";
import type { RecoveryItem, RecoveryState, ServicesState } from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";

type MediaTarget = {
  section: "highlights" | "recovery" | "services";
  index: number;
} | null;

type MediaItem = {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
};

export type MediaDialogProps = {
  activeLang: "vi" | "en";
  mediaDialogOpen: boolean;
  mediaQuery: string;
  mediaItems: MediaItem[];
  mediaTarget: MediaTarget;
  setMediaDialogOpen: (value: boolean) => void;
  setMediaQuery: (value: string) => void;
  setMediaTarget: (value: MediaTarget) => void;
  setHighlightsByLang: Dispatch<SetStateAction<Record<string, RecoveryState>>>;
  setServicesByLang: Dispatch<SetStateAction<Record<string, ServicesState>>>;
  setRecoveryByLang: Dispatch<SetStateAction<Record<string, RecoveryState>>>;
  ensureRecoveryItems: (items: RecoveryItem[]) => RecoveryItem[];
  setIsDirty: (value: boolean) => void;
};

export default function MediaDialog({
  activeLang,
  mediaDialogOpen,
  mediaQuery,
  mediaItems,
  mediaTarget,
  setMediaDialogOpen,
  setMediaQuery,
  setMediaTarget,
  setHighlightsByLang,
  setServicesByLang,
  setRecoveryByLang,
  ensureRecoveryItems,
  setIsDirty,
}: MediaDialogProps) {
  return (
    <Dialog
      open={mediaDialogOpen}
      onOpenChange={(open) => {
        setMediaDialogOpen(open);
        if (!open) {
          setMediaTarget(null);
          setMediaQuery("");
        }
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn ảnh từ Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tìm kiếm ảnh..."
            value={mediaQuery}
            onChange={(event) => setMediaQuery(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700"
          />
          <div className="grid max-h-[420px] gap-3 overflow-y-auto md:grid-cols-3">
            {mediaItems.length ? (
              mediaItems.map((item) => {
                const url = resolveMediaUrl(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!mediaTarget) return;
                      const nextUrl = normalizeMediaUrl(item.url);
                      if (mediaTarget.section === "highlights") {
                        setHighlightsByLang((prev) => {
                          const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                          next[mediaTarget.index] = {
                            ...next[mediaTarget.index],
                            imageUrl: nextUrl,
                          };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], items: next },
                          };
                        });
                      } else if (mediaTarget.section === "services") {
                        setServicesByLang((prev) => {
                          const next = [...(prev[activeLang]?.items ?? [])];
                          if (next[mediaTarget.index]) {
                            next[mediaTarget.index] = {
                              ...next[mediaTarget.index],
                              imageUrl: nextUrl,
                            };
                          }
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], items: next },
                          };
                        });
                      } else {
                        setRecoveryByLang((prev) => {
                          const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                          next[mediaTarget.index] = {
                            ...next[mediaTarget.index],
                            imageUrl: nextUrl,
                          };
                          return {
                            ...prev,
                            [activeLang]: { ...prev[activeLang], items: next },
                          };
                        });
                      }
                      setIsDirty(true);
                      setMediaDialogOpen(false);
                    }}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-[#ff9f40]"
                  >
                    <div className="h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src={url}
                        alt={item.filename}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 text-xs text-slate-600">
                      <p className="line-clamp-1 font-semibold text-slate-800">
                        {item.filename}
                      </p>
                      <p className="line-clamp-1">{item.mimeType}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">Không có ảnh.</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => setMediaDialogOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
