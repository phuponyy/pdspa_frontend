import AdminTextarea from "@/components/admin/ui/AdminTextarea";
import { getHomeReviews, updateHomeReviews } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type {
  PageEditorMediaTarget,
  ReviewItem,
  ReviewsState,
} from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export type ReviewsSectionProps = {
  activeLang: "vi" | "en";
  currentReviews: ReviewsState;
  ensureReviewItems: (items: ReviewItem[]) => ReviewItem[];
  setReviewsByLang: Dispatch<SetStateAction<Record<string, ReviewsState>>>;
  setIsDirty: (value: boolean) => void;
  setMediaTarget: (value: PageEditorMediaTarget | null) => void;
  setMediaDialogOpen: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

const toRating = (value: string | number | undefined) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 5;
  return Math.min(5, Math.max(0, parsed));
};

const createBlankReview = (): ReviewItem => ({
  name: "",
  contributions: "",
  rating: 5,
  review: "",
  visit: "",
  tag: "",
  avatarUrl: "",
});

export default function ReviewsSection({
  activeLang,
  currentReviews,
  ensureReviewItems,
  setReviewsByLang,
  setIsDirty,
  setMediaTarget,
  setMediaDialogOpen,
  notify,
  handleError,
}: ReviewsSectionProps) {
  const normalizedItems = ensureReviewItems(currentReviews.items || []);

  return (
    <section
      id="reviews"
      className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h4l3 7 4-14 3 7h4" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Reviews Section
            </p>
            <p className="text-sm text-slate-500">
              Quản lý đánh giá hiển thị dưới Recovery section.
            </p>
          </div>
        </div>
        <AdminButton
          type="button"
          className="px-4 py-2 text-xs"
          onClick={() => {
            setIsDirty(true);
            setReviewsByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                items: [...(prev[activeLang]?.items ?? []), createBlankReview()],
              },
            }));
          }}
        >
          Thêm review
        </AdminButton>
      </div>
      <div className="mt-5 grid gap-4">
        <AdminInput
          label="Heading"
          value={currentReviews.heading}
          onChange={(event) => {
            setIsDirty(true);
            setReviewsByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <AdminTextarea
          label="Description"
          value={currentReviews.description}
          onChange={(event) => {
            setIsDirty(true);
            setReviewsByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], description: event.target.value },
            }));
          }}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {normalizedItems.map((item, index) => (
            <div
              key={`review-item-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Review {index + 1}
                </span>
                <AdminButton
                  type="button"
                  className="px-2 py-1 text-[10px]"
                  onClick={() => {
                    setIsDirty(true);
                    setReviewsByLang((prev) => {
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
              <AdminInput
                label="Reviewer name"
                value={item.name || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setReviewsByLang((prev) => {
                    const next = ensureReviewItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], name: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminInput
                label="Contributions"
                value={item.contributions || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setReviewsByLang((prev) => {
                    const next = ensureReviewItems(prev[activeLang]?.items ?? []);
                    next[index] = {
                      ...next[index],
                      contributions: event.target.value,
                    };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminInput
                label="Rating (0-5)"
                type="number"
                min={0}
                max={5}
                value={String(item.rating ?? 5)}
                onChange={(event) => {
                  setIsDirty(true);
                  setReviewsByLang((prev) => {
                    const next = ensureReviewItems(prev[activeLang]?.items ?? []);
                    next[index] = {
                      ...next[index],
                      rating: toRating(event.target.value),
                    };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminTextarea
                label="Review content"
                value={item.review || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setReviewsByLang((prev) => {
                    const next = ensureReviewItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], review: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminInput
                label="Visit label"
                value={item.visit || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setReviewsByLang((prev) => {
                    const next = ensureReviewItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], visit: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminInput
                label="Tag"
                value={item.tag || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setReviewsByLang((prev) => {
                    const next = ensureReviewItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], tag: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <AdminInput
                label="Avatar URL"
                value={item.avatarUrl || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setReviewsByLang((prev) => {
                    const next = ensureReviewItems(prev[activeLang]?.items ?? []);
                    next[index] = { ...next[index], avatarUrl: event.target.value };
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
                    setMediaTarget({ section: "reviews", index });
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
              const normalized = (currentReviews.items || [])
                .filter((item) => item?.name || item?.review)
                .map((item) => ({
                  name: item?.name?.trim() || "",
                  contributions: item?.contributions?.trim() || "",
                  rating: toRating(item?.rating),
                  review: item?.review?.trim() || "",
                  visit: item?.visit?.trim() || "",
                  tag: item?.tag?.trim() || "",
                  avatarUrl: item?.avatarUrl?.trim() || "",
                }));
              await updateHomeReviews(undefined, activeLang, {
                heading: currentReviews.heading,
                description: currentReviews.description,
                items: normalized,
              });
              const fresh = await getHomeReviews(undefined, activeLang);
              if (fresh) {
                setReviewsByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    heading: fresh.heading ?? "",
                    description: fresh.description ?? "",
                    items: Array.isArray(fresh.items)
                      ? fresh.items.map((item) => ({
                          name: item?.name ?? "",
                          contributions: item?.contributions ?? "",
                          rating: item?.rating ?? 5,
                          review: item?.review ?? "",
                          visit: item?.visit ?? "",
                          tag: item?.tag ?? "",
                          avatarUrl: item?.avatarUrl ?? "",
                        }))
                      : [],
                  },
                }));
              }
              notify("Reviews section updated.", "success");
              setIsDirty(false);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(storageKey);
              }
            } catch (err) {
              handleError(err);
            }
          }}
        >
          Save reviews
        </AdminButton>
      </div>
    </section>
  );
}
