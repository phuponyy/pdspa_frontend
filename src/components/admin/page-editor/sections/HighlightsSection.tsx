import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import { getHomeHighlights, updateHomeHighlights } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type {
  PageEditorMediaTarget,
  RecoveryItem,
  RecoveryState,
} from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";

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
      className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16" />
              <path d="M4 12h12" />
              <path d="M4 18h8" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Highlights Section</p>
            <p className="text-sm text-slate-500">Phần minh hoạ nổi bật ngay dưới Intro.</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Input
          label="Heading"
          value={currentHighlights.heading}
          onChange={(event) => {
            setIsDirty(true);
            setHighlightsByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <Textarea
          label="Description"
          value={currentHighlights.description}
          onChange={(event) => {
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
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <Input
                label={`Card ${index + 1} title`}
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
              <Textarea
                label="Description"
                value={item.description || ""}
                onChange={(event) => {
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
              <Input
                label="Image URL"
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
                <Button
                  type="button"
                  className="px-4 py-2 text-xs"
                  onClick={() => {
                    setMediaTarget({ section: "highlights", index });
                    setMediaDialogOpen(true);
                  }}
                >
                  Chọn từ Media
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
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
        </Button>
      </div>
    </section>
  );
}
