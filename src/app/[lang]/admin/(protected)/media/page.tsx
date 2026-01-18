"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { deleteMedia, getMediaLibrary, updateMedia, uploadMedia } from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/common/ToastProvider";

export default function MediaLibraryPage() {
  const token = useAuthStore((state) => state.token);
  const toast = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cms-media"],
    queryFn: () => getMediaLibrary(token || "", 1, 30),
    enabled: Boolean(token),
  });

  const items = data?.data?.items || [];

  if (!token) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">Please sign in.</p>
    );
  }

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
                await uploadMedia(token, file);
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
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
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
                            if (!file) return;
                            try {
                              await updateMedia(token, item.id, file);
                              await refetch();
                              toast.push({
                                message: "Đã cập nhật ảnh.",
                                type: "success",
                              });
                            } catch {
                              toast.push({
                                message: "Cập nhật thất bại.",
                                type: "error",
                              });
                            }
                            event.target.value = "";
                          }}
                        />
                        <Button size="sm" variant="secondary">
                          Sửa
                        </Button>
                      </label>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await deleteMedia(token, item.id);
                            await refetch();
                            toast.push({ message: "Đã xoá ảnh.", type: "success" });
                          } catch {
                            toast.push({ message: "Xoá thất bại.", type: "error" });
                          }
                        }}
                      >
                        Xoá
                      </Button>
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
    </div>
  );
}
