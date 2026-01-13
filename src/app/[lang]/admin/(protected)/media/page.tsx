"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { getMediaLibrary, uploadMedia } from "@/lib/api/admin";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";

export default function MediaLibraryPage() {
  const token = useAuthStore((state) => state.token);

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
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Media
          </p>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">
            Media library
          </h1>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              await uploadMedia(token, file);
              await refetch();
              event.target.value = "";
            }}
          />
          <Button>Upload</Button>
        </label>
      </div>
      {isLoading ? (
        <Loading label="Loading media" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--mist)]">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 truncate text-xs text-[var(--ink-muted)]">
                  {item.filename}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">
              No media uploaded yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
