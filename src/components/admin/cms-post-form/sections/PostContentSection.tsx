import type { CmsPostTranslationState } from "@/components/admin/cms-post-form/types";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export type PostContentSectionProps = {
  current: CmsPostTranslationState;
  status: "DRAFT" | "PUBLISHED";
  isSaving: boolean;
  slugEdited: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onStatusChange: (value: "DRAFT" | "PUBLISHED") => void;
  onSave: () => void;
  editor: React.ReactNode;
};

export default function PostContentSection({
  current,
  status,
  isSaving,
  slugEdited,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onContentChange,
  onStatusChange,
  onSave,
  editor,
}: PostContentSectionProps) {
  return (
    <div className="self-start rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
      <div className="grid gap-4">
        <AdminInput
          label="Title"
          placeholder="Nhập tiêu đề bài viết..."
          value={current.title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <AdminInput
          label="Slug"
          placeholder="tu-khoa-bai-viet"
          value={current.slug}
          onChange={(event) => onSlugChange(event.target.value)}
        />
        <AdminTextarea
          label="Excerpt"
          placeholder="Mô tả ngắn hiển thị ở danh sách và SEO..."
          value={current.excerpt}
          onChange={(event) => onExcerptChange(event.target.value)}
        />
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--ink)]">Content</p>
          {editor}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as "DRAFT" | "PUBLISHED")}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <AdminButton onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </AdminButton>
        </div>
        {slugEdited ? null : (
          <p className="text-xs text-[var(--ink-muted)]">
            Slug sẽ tự động theo Title cho đến khi bạn sửa thủ công.
          </p>
        )}
      </div>
    </div>
  );
}
