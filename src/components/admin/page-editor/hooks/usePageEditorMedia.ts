import { useState } from "react";
import type { PageEditorMediaTarget } from "@/components/admin/page-editor/types";

export const usePageEditorMedia = () => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<PageEditorMediaTarget | null>(null);

  return {
    mediaDialogOpen,
    setMediaDialogOpen,
    mediaTarget,
    setMediaTarget,
  };
};
