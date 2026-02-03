import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Button from "@/components/common/Button";
import type { CmsPostTranslationState } from "@/components/admin/cms-post-form/types";

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
        <Input
          label="Title"
          value={current.title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <Input
          label="Slug"
          value={current.slug}
          onChange={(event) => onSlugChange(event.target.value)}
        />
        <Textarea
          label="Excerpt"
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
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
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
