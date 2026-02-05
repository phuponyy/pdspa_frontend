import type { CmsCategory, CmsTag } from "@/types/api.types";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";

export type TaxonomyPanelProps = {
  categories: CmsCategory[];
  tags: CmsTag[];
  selectedCategoryIds: number[];
  selectedTagIds: number[];
  filteredCategories: CmsCategory[];
  filteredTags: CmsTag[];
  newCategory: string;
  newTag: string;
  categoryQuery: string;
  tagQuery: string;
  setCategoryQuery: (value: string) => void;
  setTagQuery: (value: string) => void;
  setNewCategory: (value: string) => void;
  setNewTag: (value: string) => void;
  onToggleCategory: (id: number) => void;
  onToggleTag: (id: number) => void;
  onCreateCategory: () => void;
  onCreateTag: () => void;
  onCreateCategoryKey: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onCreateTagKey: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function TaxonomyPanel({
  selectedCategoryIds,
  selectedTagIds,
  filteredCategories,
  filteredTags,
  newCategory,
  newTag,
  categoryQuery,
  tagQuery,
  setCategoryQuery,
  setTagQuery,
  setNewCategory,
  setNewTag,
  onToggleCategory,
  onToggleTag,
  onCreateCategory,
  onCreateTag,
  onCreateCategoryKey,
  onCreateTagKey,
}: TaxonomyPanelProps) {
  return (
    <>
      <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Danh mục</p>
          <span className="text-xs text-[var(--ink-muted)]">
            {selectedCategoryIds.length} đã chọn
          </span>
        </div>
        <div className="mt-2">
          <AdminInput
            label="Tìm danh mục"
            value={categoryQuery}
            onChange={(event) => setCategoryQuery(event.target.value)}
          />
        </div>
        <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-auto">
          {filteredCategories.length ? (
            filteredCategories.map((category) => {
              const active = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onToggleCategory(category.id)}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                    active
                      ? "bg-[var(--accent-strong)] text-white"
                      : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {category.name}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-[var(--ink-muted)]">Không có danh mục phù hợp.</p>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <AdminInput
            label="Thêm danh mục mới"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            onKeyDown={onCreateCategoryKey}
          />
          <AdminButton variant="outline" size="sm" onClick={onCreateCategory}>
            Thêm
          </AdminButton>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Thẻ</p>
          <span className="text-xs text-[var(--ink-muted)]">
            {selectedTagIds.length} đã chọn
          </span>
        </div>
        <div className="mt-2">
          <AdminInput
            label="Tìm thẻ"
            value={tagQuery}
            onChange={(event) => setTagQuery(event.target.value)}
          />
        </div>
        <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-auto">
          {filteredTags.length ? (
            filteredTags.map((tag) => {
              const active = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                    active
                      ? "bg-[var(--accent-strong)] text-white"
                      : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-[var(--ink-muted)]">Không có thẻ phù hợp.</p>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <AdminInput
            label="Thêm thẻ mới"
            value={newTag}
            onChange={(event) => setNewTag(event.target.value)}
            onKeyDown={onCreateTagKey}
          />
          <AdminButton variant="outline" size="sm" onClick={onCreateTag}>
            Thêm
          </AdminButton>
        </div>
      </div>
    </>
  );
}
