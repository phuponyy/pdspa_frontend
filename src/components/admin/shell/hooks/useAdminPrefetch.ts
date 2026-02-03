import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getAdminOverview,
  getAdminRoles,
  getAdminServices,
  getAdminUsers,
  getCmsCategories,
  getCmsPosts,
  getCmsTags,
  getMediaFolders,
  getMediaTags,
} from "@/lib/api/admin";

export const useAdminPrefetch = (roleKey: string | undefined, permissions: string[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roleKey) return;
    const prefetch = <T,>(key: unknown[], fn: () => Promise<T>) =>
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: fn,
      });

    if (permissions.includes("view_dashboard")) {
      prefetch(["admin-overview"], () => getAdminOverview(undefined, {}));
    }
    if (permissions.includes("manage_posts")) {
      prefetch(["cms-posts", 1, 20], () => getCmsPosts(undefined, 1, 20));
      prefetch(["cms-categories"], () => getCmsCategories(undefined));
      prefetch(["cms-tags"], () => getCmsTags(undefined));
    }
    if (permissions.includes("manage_media")) {
      prefetch(["cms-media-folders"], () => getMediaFolders());
      prefetch(["cms-media-tags"], () => getMediaTags());
    }
    if (permissions.includes("manage_users")) {
      prefetch(["admin-roles"], () => getAdminRoles(undefined));
      prefetch(["admin-users"], () => getAdminUsers(undefined));
    }
    if (permissions.includes("manage_services")) {
      prefetch(["admin-services"], () => getAdminServices(undefined));
    }
  }, [permissions, queryClient, roleKey]);
};
