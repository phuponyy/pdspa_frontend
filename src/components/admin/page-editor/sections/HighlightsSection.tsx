import { getHomeHighlights, updateHomeHighlights } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type {
  PageEditorMediaTarget,
  RecoveryItem,
  RecoveryState,
} from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export type HighlightsSectionProps = {
  activeLang: "vi" | "en";
  currentHighlights: RecoveryState;
  ensureRecoveryItems: (items: RecoveryItem[]) => RecoveryItem[];
  setHighlightsByLang: Dispatch<SetStateAction<Record<string, RecoveryState>>>;
  setIsDirty: (value: boolean) => void;
  setMediaTarget: (value: PageEditorMediaTarget | null) => void;
  setMediaDialogOpen: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

export default function HighlightsSection({
  activeLang,
  currentHighlights,
  ensureRecoveryItems,
  setHighlightsByLang,
  setIsDirty,
  setMediaTarget,
  setMediaDialogOpen,
  notify,
  handleError,
}: HighlightsSectionProps) {
  return (
    <section
      id="highlights"
      className="rounded-[28px] border border-white/10 bg-[#0b1220] p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16" />
              <path d="M4 12h12" />
              <path d="M4 18h8" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Highlights Section</p>
            <p className="text-sm text-white/60">Phần minh hoạ nổi bật ngay dưới Intro.</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <AdminInput
          label="Heading"
          placeholder="Tiêu đề điểm nổi bật..."
          value={currentHighlights.heading}
          onChange={(event) => {
            setIsDirty(true);
            setHighlightsByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <AdminTextarea
          label="Description"
          placeholder="Mô tả ngắn cho phần highlights..."
          value={currentHighlights.description}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setIsDirty(true);
            setHighlightsByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], description: event.target.value },
            }));
          }}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {ensureRecoveryItems(currentHighlights.items).map((item, index) => (
            <div
              key={`highlight-item-${index}`}
              className="rounded-2xl border border-white/10 bg-[#0f172a] p-4"
            >
              <AdminInput
                label={`AdminCard ${index + 1} title`}
                placeholder="Tiêu đề thẻ..."
                value={item.title || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setHighlightsByLang((prev) => {
                    const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], title: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminTextarea
                label="Description"
                placeholder="Nội dung mô tả..."
                value={item.description || ""}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setIsDirty(true);
                  setHighlightsByLang((prev) => {
                    const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], description: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminInput
                label="Image URL"
                placeholder="/uploads/media/highlight.jpg"
                value={item.imageUrl || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setHighlightsByLang((prev) => {
                    const next = ensureRecoveryItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], imageUrl: event.target.value };
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
                    setMediaTarget({ section: "highlights", index });
                    setMediaDialogOpen(true);
                  }}
                >
                  Chọn từ Media
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
        <AdminButton
          onClick={async () => {
            try {
              const normalizedItems = (currentHighlights.items || [])
                .slice(0, 3)
                .map((item) => ({
                  title: item.title?.trim() || "",
                  description: item.description?.trim() || "",
                  imageUrl: item.imageUrl?.trim() || "",
                }));
              await updateHomeHighlights(undefined, activeLang, {
                heading: currentHighlights.heading,
                description: currentHighlights.description,
                items: normalizedItems,
              });
              const fresh = await getHomeHighlights(undefined, activeLang);
              if (fresh) {
                setHighlightsByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    heading: fresh.heading ?? "",
                    description: fresh.description ?? "",
                    items: Array.isArray(fresh.items)
                      ? fresh.items.map((item) => ({
                          title: item?.title ?? "",
                          description: item?.description ?? "",
                          imageUrl: item?.imageUrl ?? "",
                        }))
                      : [],
                  },
                }));
              }
              notify("Highlights section updated.", "success");
              setIsDirty(false);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(storageKey);
              }
            } catch (err) {
              handleError(err);
            }
          }}
        >
          Save highlights
        </AdminButton>
      </div>
    </section>
  );
}
