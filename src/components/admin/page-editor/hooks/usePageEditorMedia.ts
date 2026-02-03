import { useState } from "react";
import { getMediaLibrary } from "@/lib/api/admin";
import { useAdminQuery } from "@/lib/api/adminHooks";

type MediaTarget = {
  section: "highlights" | "recovery" | "services";
  index: number;
};

export const usePageEditorMedia = () => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaQuery, setMediaQuery] = useState("");
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);

  const mediaQueryResult = useAdminQuery({
    queryKey: ["cms-media-library", mediaQuery],
    queryFn: () => getMediaLibrary(undefined, 1, 60, { q: mediaQuery }),
    enabled: mediaDialogOpen,
    staleTime: 30_000,
    toastOnError: false,
  });

  return {
    mediaDialogOpen,
    setMediaDialogOpen,
    mediaQuery,
    setMediaQuery,
    mediaTarget,
    setMediaTarget,
    mediaItems: mediaQueryResult.data?.data?.items ?? [],
  };
};
