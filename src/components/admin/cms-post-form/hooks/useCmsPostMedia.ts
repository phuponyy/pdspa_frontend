import { useState } from "react";
import type { CmsPostTranslationState } from "@/components/admin/cms-post-form/types";
import { normalizeMediaUrl } from "@/components/admin/cms-post-form/utils/media";

type MediaTarget = "thumbnail" | "og";

type MediaHookParams = {
  onUpdateTranslation: (patch: Partial<CmsPostTranslationState>) => void;
};

export const useCmsPostMedia = ({ onUpdateTranslation }: MediaHookParams) => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>("thumbnail");

  const openMediaDialog = (target: MediaTarget) => {
    setMediaTarget(target);
    setMediaDialogOpen(true);
  };

  const handleSelectMedia = (url: string) => {
    const normalized = normalizeMediaUrl(url);
    if (mediaTarget === "thumbnail") {
      onUpdateTranslation({ thumbnailUrl: normalized });
    } else {
      onUpdateTranslation({ ogImage: normalized });
    }
    setMediaDialogOpen(false);
  };

  return {
    mediaDialogOpen,
    setMediaDialogOpen,
    openMediaDialog,
    handleSelectMedia,
    mediaTarget,
  };
};
