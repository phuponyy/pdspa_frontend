import { getHomeGallery, updateHomeGallery } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import { resolveMediaUrl } from "@/components/admin/page-editor/utils";
import type {
  GalleryItem,
  GalleryState,
  PageEditorMediaTarget,
} from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export type PhotoGallerySectionProps = {
  activeLang: "vi" | "en";
  currentGallery: GalleryState;
  setGalleryByLang: Dispatch<SetStateAction<Record<string, GalleryState>>>;
  setIsDirty: (value: boolean) => void;
  setMediaTarget: (value: PageEditorMediaTarget | null) => void;
  setMediaDialogOpen: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

const createBlankItem = (): GalleryItem => ({
  imageUrl: "",
  caption: "",
});

export default function PhotoGallerySection({
  activeLang,
  currentGallery,
  setGalleryByLang,
  setIsDirty,
  setMediaTarget,
  setMediaDialogOpen,
  notify,
  handleError,
}: PhotoGallerySectionProps) {
  const items = currentGallery.items || [];

  return (
    <section
      id="gallery"
      className="rounded-[28px] border border-white/10 bg-[#0b1220] p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h10" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Photo Gallery
            </p>
            <p className="text-sm text-white/60">
              Quản lý hình ảnh hiển thị dưới Recovery section.
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          className="px-4 py-2 text-xs"
          onClick={() => {
            setIsDirty(true);
            setGalleryByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                items: [...(prev[activeLang]?.items ?? []), createBlankItem()],
              },
            }));
          }}
        >
          Thêm ảnh
        </AdminButton>
      </div>

      <div className="mt-5 grid gap-4">
        <AdminInput
          label="Heading"
          placeholder="Tiêu đề bộ sưu tập ảnh..."
          value={currentGallery.heading}
          onChange={(event) => {
            setIsDirty(true);
            setGalleryByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <AdminTextarea
          label="Description"
          placeholder="Mô tả ngắn cho gallery..."
          value={currentGallery.description}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setIsDirty(true);
            setGalleryByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], description: event.target.value },
            }));
          }}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((item, index) => {
            const previewUrl = item.imageUrl ? resolveMediaUrl(item.imageUrl) : "";
            return (
              <div
                key={`gallery-item-${index}`}
                className="rounded-2xl border border-white/10 bg-[#0f172a] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Image {index + 1}
                  </span>
                  <AdminButton
                    type="button"
                    className="px-2 py-1 text-[10px]"
                    onClick={() => {
                      setIsDirty(true);
                      setGalleryByLang((prev) => {
                        const next = [...(prev[activeLang]?.items ?? [])];
                        next.splice(index, 1);
                        return {
                          ...prev,
                          [activeLang]: { ...prev[activeLang], items: next },
                        };
                      });
                    }}
                  >
                    Xóa
                  </AdminButton>
                </div>

                <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={item.caption || `Gallery ${index + 1}`}
                      className="h-32 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-32 place-items-center text-xs text-white/60">
                      Chưa có ảnh
                    </div>
                  )}
                </div>

                <AdminInput
                  label="Image URL"
                  placeholder="/uploads/media/gallery.jpg"
                  value={item.imageUrl || ""}
                  onChange={(event) => {
                    setIsDirty(true);
                    setGalleryByLang((prev) => {
                      const next = [...(prev[activeLang]?.items ?? [])];
                      next[index] = { ...next[index], imageUrl: event.target.value };
                      return {
                        ...prev,
                        [activeLang]: { ...prev[activeLang], items: next },
                      };
                    });
                  }}
                />
                <AdminInput
                  label="Caption"
                  placeholder="Chú thích ảnh..."
                  value={item.caption || ""}
                  onChange={(event) => {
                    setIsDirty(true);
                    setGalleryByLang((prev) => {
                      const next = [...(prev[activeLang]?.items ?? [])];
                      next[index] = { ...next[index], caption: event.target.value };
                      return {
                        ...prev,
                        [activeLang]: { ...prev[activeLang], items: next },
                      };
                    });
                  }}
                />
                <div className="mt-2 flex justify-end">
                  <AdminButton
                    type="button"
                    className="px-4 py-2 text-xs"
                    onClick={() => {
                      setMediaTarget({ section: "gallery", index });
                      setMediaDialogOpen(true);
                    }}
                  >
                    Chọn từ Media
                  </AdminButton>
                </div>
              </div>
            );
          })}
        </div>

        <AdminButton
          onClick={async () => {
            try {
              const normalizedItems = (currentGallery.items || [])
                .map((item) => ({
                  imageUrl: item.imageUrl?.trim() || "",
                  caption: item.caption?.trim() || "",
                }))
                .filter((item) => item.imageUrl);
              await updateHomeGallery(undefined, activeLang, {
                heading: currentGallery.heading,
                description: currentGallery.description,
                items: normalizedItems,
              });
              const fresh = await getHomeGallery(undefined, activeLang);
              if (fresh) {
                setGalleryByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    heading: fresh.heading ?? "",
                    description: fresh.description ?? "",
                    items: Array.isArray(fresh.items)
                      ? fresh.items.map((item) => ({
                          imageUrl: item?.imageUrl ?? "",
                          caption: item?.caption ?? "",
                        }))
                      : [],
                  },
                }));
              }
              notify("Photo gallery updated.", "success");
              setIsDirty(false);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(storageKey);
              }
            } catch (err) {
              handleError(err);
            }
          }}
        >
          Save photo gallery
        </AdminButton>
      </div>
    </section>
  );
}
