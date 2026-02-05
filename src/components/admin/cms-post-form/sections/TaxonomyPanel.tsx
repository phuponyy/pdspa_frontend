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
      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 shadow-[0_20px_50px_rgba(2,6,23,0.6)]">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Danh mục</p>
          <span className="text-xs text-white/60">
            {selectedCategoryIds.length} đã chọn
          </span>
        </div>
        <div className="mt-2">
          <AdminInput
            label="Tìm danh mục"
            placeholder="Nhập kiếm danh mục..."
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
                      ? "bg-[#ff8a4b] text-white"
                      : "border border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {category.name}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-white/50">Không có danh mục phù hợp.</p>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <AdminInput
            label="Thêm danh mục mới"
            placeholder="Tạo Danh mục..."
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            onKeyDown={onCreateCategoryKey}
          />
          <AdminButton variant="outline" size="sm" onClick={onCreateCategory}>
            Thêm
          </AdminButton>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 shadow-[0_20px_50px_rgba(2,6,23,0.6)]">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Thẻ</p>
          <span className="text-xs text-white/60">
            {selectedTagIds.length} đã chọn
          </span>
        </div>
        <div className="mt-2">
          <AdminInput
            label="Tìm thẻ"
            placeholder="Tìm kiếm thẻ..."
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
                      ? "bg-[#ff8a4b] text-white"
                      : "border border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-white/50">Không có thẻ phù hợp.</p>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <AdminInput
            label="Thêm thẻ mới"
            placeholder="Tạo tags..."
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
