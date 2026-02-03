import Button from "@/components/common/Button";
import { updateHomeSectionsOrder } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type { Dispatch, SetStateAction } from "react";

export type SectionOrderSectionProps = {
  sectionOrder: string[];
  draggingSection: string | null;
  setSectionOrder: Dispatch<SetStateAction<string[]>>;
  setDraggingSection: (value: string | null) => void;
  setIsDirty: (value: boolean) => void;
  isSavingOrder: boolean;
  setIsSavingOrder: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

export default function SectionOrderSection({
  sectionOrder,
  draggingSection,
  setSectionOrder,
  setDraggingSection,
  setIsDirty,
  isSavingOrder,
  setIsSavingOrder,
  notify,
  handleError,
}: SectionOrderSectionProps) {
  return (
    <section
      id="sections-order"
      className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Section Order
            </p>
            <p className="text-sm text-slate-500">
              Kéo hoặc đổi vị trí để sắp xếp thứ tự hiển thị trên trang chủ.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {sectionOrder.map((key, index) => (
          <div
            key={`section-order-${key}`}
            draggable
            onDragStart={() => setDraggingSection(key)}
            onDragEnd={() => setDraggingSection(null)}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggingSection || draggingSection === key) return;
              setIsDirty(true);
              setSectionOrder((prev) => {
                const next = prev.filter((item) => item !== draggingSection);
                const dropIndex = next.indexOf(key);
                next.splice(dropIndex, 0, draggingSection);
                return next;
              });
              setDraggingSection(null);
            }}
            className={`flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition ${
              draggingSection === key ? "border-[#ff9f40] bg-[#fff6eb]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#0f1722] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {index + 1}
              </span>
              <span className="font-semibold capitalize">
                {key.replace(/-/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="cursor-grab rounded-full border border-slate-200 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.18em] text-slate-500">
                Drag
              </span>
              <Button
                type="button"
                className="px-1.5 py-1 text-[9px] leading-none"
                disabled={index === 0}
                onClick={() => {
                  setIsDirty(true);
                  setSectionOrder((prev) => {
                    const next = [...prev];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    return next;
                  });
                }}
              >
                ↑
              </Button>
              <Button
                type="button"
                className="px-1.5 py-1 text-[9px] leading-none"
                disabled={index === sectionOrder.length - 1}
                onClick={() => {
                  setIsDirty(true);
                  setSectionOrder((prev) => {
                    const next = [...prev];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    return next;
                  });
                }}
              >
                ↓
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mt-5"
        disabled={isSavingOrder}
        onClick={async () => {
          try {
            setIsSavingOrder(true);
            const payload = sectionOrder.map((key, index) => ({
              key,
              order: index + 1,
            }));
            await updateHomeSectionsOrder(undefined, { items: payload });
            notify("Section order updated.", "success");
            setIsDirty(false);
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(storageKey);
            }
          } catch (err) {
            handleError(err);
          } finally {
            setIsSavingOrder(false);
          }
        }}
      >
        Save order
      </Button>
    </section>
  );
}
