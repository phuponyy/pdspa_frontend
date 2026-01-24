"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { deleteMedia, getMediaLibrary, updateMedia, uploadMedia } from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/common/ToastProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};

export default function MediaLibraryPage() {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cms-media"],
    queryFn: () => getMediaLibrary(undefined, 1, 30),
  });

  const items = data?.data?.items || [];
  const selected = items.find((item) => item.id === selectedId) || null;

  const handleDelete = async (id: number) => {
    try {
      await deleteMedia(undefined, id);
      await refetch();
      toast.push({ message: "Đã xoá ảnh.", type: "success" });
      if (selectedId === id) setSelectedId(null);
    } catch {
      toast.push({ message: "Xoá thất bại.", type: "error" });
    }
  };

  const handleReplace = async (id: number, file?: File | null) => {
    if (!file) return;
    try {
      await updateMedia(id, file);
      await refetch();
      toast.push({ message: "Đã cập nhật ảnh.", type: "success" });
    } catch {
      toast.push({ message: "Cập nhật thất bại.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Thư viện Media</h1>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                await uploadMedia(file);
                await refetch();
                toast.push({ message: "Đã tải ảnh.", type: "success" });
              } catch {
                toast.push({ message: "Upload thất bại.", type: "error" });
              }
              event.target.value = "";
            }}
          />
          <Button size="icon">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </label>
      </div>
      {isLoading ? (
        <Loading label="Loading media" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.length ? (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="h-full w-full"
                      aria-label={`View ${item.filename}`}
                    >
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate text-xs text-slate-400">
                      {item.filename}
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            await handleReplace(item.id, file);
                            event.target.value = "";
                          }}
                        />
                        <Button size="sm" variant="secondary">
                          Sửa
                        </Button>
                      </label>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="secondary">
                            Xoá
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Xoá ảnh?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ảnh sẽ bị xoá khỏi thư viện và không thể khôi phục.
                          </AlertDialogDescription>
                          <div className="mt-5 flex items-center justify-end gap-3">
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              Xoá ảnh
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-slate-400">Chưa có media.</p>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        {selected ? (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Media details</DialogTitle>
              <DialogDescription>Thông tin chi tiết về file đã upload.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                <img
                  src={selected.url}
                  alt={selected.filename}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 text-sm text-white/80">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Filename</p>
                  <p className="break-all text-white">{selected.filename}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Type</p>
                  <p className="text-white">{selected.mimeType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Size</p>
                  <p className="text-white">{formatBytes(selected.size)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Uploaded</p>
                  <p className="text-white">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">URL</p>
                  <p className="break-all text-white">{selected.url}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        await handleReplace(selected.id, file);
                        event.target.value = "";
                      }}
                    />
                    <Button size="sm" variant="secondary">
                      Replace
                    </Button>
                  </label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete media?</AlertDialogTitle>
                      <AlertDialogDescription>
                        File sẽ bị xoá vĩnh viễn khỏi hệ thống.
                      </AlertDialogDescription>
                      <div className="mt-5 flex items-center justify-end gap-3">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selected.id)}>
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
