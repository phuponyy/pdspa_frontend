import type { CmsPageStatus } from "../types";
import AdminButton from "@/components/admin/ui/AdminButton";

export type PageActionsProps = {
  status: CmsPageStatus;
  setStatus: (status: CmsPageStatus) => void;
  isSaving: boolean;
  onSave: () => void;
  setDirty: (value: boolean) => void;
};

export const PageActions = ({ status, setStatus, isSaving, onSave, setDirty }: PageActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
        value={status}
        onChange={(event) => {
          setDirty(true);
          setStatus(event.target.value as CmsPageStatus);
        }}
      >
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
      </select>
      <AdminButton onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </AdminButton>
    </div>
  );
};
