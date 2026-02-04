import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createCmsCategory,
  createCmsTag,
  getCmsCategories,
  getCmsTags,
} from "@/lib/api/admin";
import type { CmsCategory, CmsTag } from "@/types/api.types";

type TaxonomyHookParams = {
  initialCategoryIds: number[];
  initialTagIds: number[];
  handleError: (err: unknown) => void;
};

export const useCmsPostTaxonomy = ({
  initialCategoryIds,
  initialTagIds,
  handleError,
}: TaxonomyHookParams) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(initialCategoryIds);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialTagIds);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["cms-categories"],
    queryFn: () => getCmsCategories(undefined),
  });
  const tagsQuery = useQuery({
    queryKey: ["cms-tags"],
    queryFn: () => getCmsTags(undefined),
  });

  const categories = (categoriesQuery.data?.data || []) as CmsCategory[];
  const tags = (tagsQuery.data?.data || []) as CmsTag[];

  const filteredCategories = useMemo(() => {
    const normalized = categoryQuery.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [categories, categoryQuery]);

  const filteredTags = useMemo(() => {
    const normalized = tagQuery.trim().toLowerCase();
    if (!normalized) return tags;
    return tags.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [tags, tagQuery]);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };
  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const handleCreateCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const response = await createCmsCategory(undefined, { name });
      const id = response?.data?.id;
      if (id) {
        setSelectedCategoryIds((prev) => Array.from(new Set([...prev, id])));
        setNewCategory("");
        categoriesQuery.refetch();
      }
    } catch (err) {
      handleError(err);
    }
  };
  const handleCreateCategoryKey = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await handleCreateCategory();
  };

  const handleCreateTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    try {
      const response = await createCmsTag(undefined, { name });
      const id = response?.data?.id;
      if (id) {
        setSelectedTagIds((prev) => Array.from(new Set([...prev, id])));
        setNewTag("");
        tagsQuery.refetch();
      }
    } catch (err) {
      handleError(err);
    }
  };
  const handleCreateTagKey = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    await handleCreateTag();
  };

  return {
    categories,
    tags,
    filteredCategories,
    filteredTags,
    selectedCategoryIds,
    selectedTagIds,
    newCategory,
    newTag,
    categoryQuery,
    tagQuery,
    setNewCategory,
    setNewTag,
    setCategoryQuery,
    setTagQuery,
    toggleCategory,
    toggleTag,
    handleCreateCategory,
    handleCreateTag,
    handleCreateCategoryKey,
    handleCreateTagKey,
  };
};
