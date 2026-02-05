import { getHomeMentions, updateHomeMentions } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import { resolveMediaUrl } from "@/components/admin/page-editor/utils";
import type {
  MentionsItem,
  MentionsState,
  PageEditorMediaTarget,
} from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export type MentionsSectionProps = {
  activeLang: "vi" | "en";
  currentMentions: MentionsState;
  setMentionsByLang: Dispatch<SetStateAction<Record<string, MentionsState>>>;
  setIsDirty: (value: boolean) => void;
  setMediaTarget: (value: PageEditorMediaTarget | null) => void;
  setMediaDialogOpen: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

const createBlankItem = (): MentionsItem => ({
  name: "",
  imageUrl: "",
  link: "",
});

export default function MentionsSection({
  activeLang,
  currentMentions,
  setMentionsByLang,
  setIsDirty,
  setMediaTarget,
  setMediaDialogOpen,
  notify,
  handleError,
}: MentionsSectionProps) {
  const items = currentMentions.items || [];

  return (
    <section
      id="mentions"
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
              <path d="M4 18h8" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Press Mentions
            </p>
            <p className="text-sm text-white/60">
              Logo báo chí hiển thị ngay dưới Reviews section.
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          className="px-4 py-2 text-xs"
          onClick={() => {
            setIsDirty(true);
            setMentionsByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                items: [...(prev[activeLang]?.items ?? []), createBlankItem()],
              },
            }));
          }}
        >
          Thêm logo
        </AdminButton>
      </div>

      <div className="mt-5 grid gap-4">
        <AdminInput
          label="Heading"
          placeholder="Tiêu đề press mentions..."
          value={currentMentions.heading}
          onChange={(event) => {
            setIsDirty(true);
            setMentionsByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <AdminTextarea
          label="Description"
          placeholder="Mô tả ngắn về báo chí/đối tác..."
          value={currentMentions.description}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setIsDirty(true);
            setMentionsByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                description: event.target.value,
              },
            }));
          }}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((item, index) => {
            const previewUrl = item.imageUrl ? resolveMediaUrl(item.imageUrl) : "";
            return (
              <div
                key={`mention-item-${index}`}
                className="rounded-2xl border border-white/10 bg-[#0f172a] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Logo {index + 1}
                  </span>
                  <AdminButton
                    type="button"
                    className="px-2 py-1 text-[10px]"
                    onClick={() => {
                      setIsDirty(true);
                      setMentionsByLang((prev) => {
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

                <div className="mb-3 grid h-28 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={item.name || `Mention ${index + 1}`}
                      className="h-14 w-auto max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-xs text-white/60">Chưa có ảnh</div>
                  )}
                </div>

                <AdminInput
                  label="Name"
                  placeholder="Tên báo/đối tác"
                  value={item.name || ""}
                  onChange={(event) => {
                    setIsDirty(true);
                    setMentionsByLang((prev) => {
                      const next = [...(prev[activeLang]?.items ?? [])];
                      next[index] = { ...next[index], name: event.target.value };
                      return {
                        ...prev,
                        [activeLang]: { ...prev[activeLang], items: next },
                      };
                    });
                  }}
                />
                <AdminInput
                  label="Image URL"
                  placeholder="/uploads/media/logo.png"
                  value={item.imageUrl || ""}
                  onChange={(event) => {
                    setIsDirty(true);
                    setMentionsByLang((prev) => {
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
                  label="Link (optional)"
                  placeholder="https://..."
                  value={item.link || ""}
                  onChange={(event) => {
                    setIsDirty(true);
                    setMentionsByLang((prev) => {
                      const next = [...(prev[activeLang]?.items ?? [])];
                      next[index] = { ...next[index], link: event.target.value };
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
                      setMediaTarget({ section: "mentions", index });
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
              const normalizedItems = (currentMentions.items || [])
                .map((item) => ({
                  name: item.name?.trim() || "",
                  imageUrl: item.imageUrl?.trim() || "",
                  link: item.link?.trim() || "",
                }))
                .filter((item) => item.imageUrl);
              await updateHomeMentions(undefined, activeLang, {
                heading: currentMentions.heading,
                description: currentMentions.description,
                items: normalizedItems,
              });
              const fresh = await getHomeMentions(undefined, activeLang);
              if (fresh) {
                setMentionsByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    heading: fresh.heading ?? "",
                    description: fresh.description ?? "",
                    items: Array.isArray(fresh.items)
                      ? fresh.items.map((item) => ({
                          name: item?.name ?? "",
                          imageUrl: item?.imageUrl ?? "",
                          link: item?.link ?? "",
                        }))
                      : [],
                  },
                }));
              }
              notify("Mentions section updated.", "success");
              setIsDirty(false);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(storageKey);
              }
            } catch (err) {
              handleError(err);
            }
          }}
        >
          Save mentions
        </AdminButton>
      </div>
    </section>
  );
}
