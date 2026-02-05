import dynamic from "next/dynamic";
import { slugify } from "../slugify";
import type { CmsPageTranslation } from "../types";
import AdminInput from "@/components/admin/ui/AdminInput";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--ink-muted)]">
      Loading editor...
    </div>
  ),
});

export type ContentSectionProps = {
  activeLang: string;
  current: CmsPageTranslation;
  slugEdited: Record<string, boolean>;
  setSlugEdited: (value: Record<string, boolean>) => void;
  onChange: (next: Partial<CmsPageTranslation>) => void;
  setDirty: (value: boolean) => void;
};

export const ContentSection = ({
  activeLang,
  current,
  slugEdited,
  setSlugEdited,
  onChange,
  setDirty,
}: ContentSectionProps) => {
  return (
    <div className="grid gap-4">
      <AdminInput
        label="Title"
        value={current.title}
        onChange={(event) => {
          const nextTitle = event.target.value;
          setDirty(true);
          onChange({
            title: nextTitle,
            slug: slugEdited[activeLang] ? current.slug : slugify(nextTitle),
          });
        }}
      />
      <AdminInput
        label="Slug"
        value={current.slug}
        onChange={(event) => {
          setDirty(true);
          setSlugEdited({ ...slugEdited, [activeLang]: true });
          onChange({ slug: event.target.value });
        }}
      />
      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--ink)]">Content</p>
        <RichTextEditor
          value={current.content}
          onChange={(value) => {
            setDirty(true);
            onChange({ content: value });
          }}
        />
      </div>
    </div>
  );
};
