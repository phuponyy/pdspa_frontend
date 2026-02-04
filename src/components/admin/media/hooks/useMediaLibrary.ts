import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createMediaFolder,
  createMediaTag,
  deleteMedia,
  convertMediaToWebp,
  convertMediaToWebpBulk,
  getMediaFolders,
  getMediaLibrary,
  getMediaTags,
  updateMedia,
  updateMediaMeta,
  uploadMedia,
} from "@/lib/api/admin";
import { useToast } from "@/components/common/ToastProvider";
import type { MediaFolder, MediaItem, MediaTag } from "@/types/api.types";
import { resolveMediaUrl } from "../utils";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const useMediaLibrary = () => {
  const toast = useToast();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [format, setFormat] = useState("all");
  const [folderFilter, setFolderFilter] = useState<number | "ALL">("ALL");
  const [tagFilter, setTagFilter] = useState<number | "ALL">("ALL");

  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [tags, setTags] = useState<MediaTag[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editedFilename, setEditedFilename] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.push({ message: "File không đúng định dạng ảnh.", type: "error" });
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.push({ message: "Ảnh quá lớn (tối đa 10MB).", type: "error" });
      return false;
    }
    return true;
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cms-media", page, pageSize, query, folderFilter, tagFilter],
    queryFn: () =>
      getMediaLibrary(undefined, page, pageSize, {
        q: query || undefined,
        folderId: folderFilter === "ALL" ? undefined : folderFilter,
        tagId: tagFilter === "ALL" ? undefined : tagFilter,
      }),
  });

  const items = data?.data?.items || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const totalItems = data?.data?.pagination?.total || 0;

  const filteredItems = useMemo(() => {
    let list = [...items];
    if (format === "image") {
      list = list.filter((item) => item.mimeType?.startsWith("image/"));
    } else if (format === "video") {
      list = list.filter((item) => item.mimeType?.startsWith("video/"));
    }
    list.sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : a.id;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : b.id;
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
    return list;
  }, [items, format, sort]);

  const selected = items.find((item) => item.id === selectedId) || null;

  const duplicateMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      if (!item.checksum) return;
      map.set(item.checksum, (map.get(item.checksum) ?? 0) + 1);
    });
    return map;
  }, [items]);

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const [folderRes, tagRes] = await Promise.all([getMediaFolders(), getMediaTags()]);
        if (!active) return;
        setFolders(folderRes?.data ?? []);
        setTags(tagRes?.data ?? []);
      } catch {
        if (active) {
          setFolders([]);
          setTags([]);
        }
      }
    };
    loadMeta();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    setEditedFilename(selected.filename || "");
    setSelectedFolderId(selected.folder?.id ?? null);
    setSelectedTagIds(selected.tags?.map((tag) => tag.tagId) ?? []);
    setSelectedDimensions(
      selected.width && selected.height ? { width: selected.width, height: selected.height } : null
    );
  }, [selected?.id]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const openReplace = (id: number) => {
    setReplaceTargetId(id);
    replaceInputRef.current?.click();
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const valid = list.filter(validateImage);
    if (!valid.length) return;
    for (const file of valid) {
      await uploadMedia(file);
    }
    toast.push({ message: "Upload thành công", type: "success" });
    refetch();
  };

  const handleReplace = async (file: File) => {
    if (!replaceTargetId) return;
    if (!validateImage(file)) return;
    await updateMedia(replaceTargetId, file);
    toast.push({ message: "Đã thay ảnh", type: "success" });
    refetch();
  };

  const handleDelete = async (id: number) => {
    await deleteMedia(undefined, id);
    toast.push({ message: "Đã xoá ảnh", type: "success" });
    if (selectedId === id) {
      setSelectedId(null);
    }
    setSelectedIds((prev) => prev.filter((value) => value !== id));
    refetch();
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteMedia(undefined, id);
    }
    toast.push({ message: "Đã xoá các ảnh đã chọn", type: "success" });
    setSelectedIds([]);
    if (selectedId && selectedIds.includes(selectedId)) {
      setSelectedId(null);
    }
    refetch();
  };

  const handleBulkMove = async (folderId: number | null) => {
    for (const id of selectedIds) {
      await updateMediaMeta(id, { folderId });
    }
    toast.push({ message: "Đã cập nhật folder cho các ảnh đã chọn", type: "success" });
    refetch();
  };

  const handleBulkTag = async (tagIds: number[]) => {
    for (const id of selectedIds) {
      await updateMediaMeta(id, { tagIds });
    }
    toast.push({ message: "Đã cập nhật tag cho các ảnh đã chọn", type: "success" });
    refetch();
  };

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement("a");
    link.href = resolveMediaUrl(item.url);
    link.download = item.filename || "media";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDownload = () => {
    selectedIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is MediaItem => Boolean(item))
      .forEach((item) => handleDownload(item));
  };

  const handleBulkConvertWebp = async () => {
    const targets = selectedIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is MediaItem => Boolean(item))
      .filter(
        (item) =>
          item.mimeType === "image/jpeg" || item.mimeType === "image/png"
      );
    if (!targets.length) {
      toast.push({ message: "Không có ảnh JPEG/PNG để chuyển đổi.", type: "info" });
      return;
    }
    await convertMediaToWebpBulk(targets.map((item) => item.id));
    toast.push({ message: "Đã chuyển đổi WebP hàng loạt.", type: "success" });
    refetch();
  };

  const handleUpdateMeta = async () => {
    if (!selected) return;
    await updateMediaMeta(selected.id, {
      filename: editedFilename || undefined,
      folderId: selectedFolderId ?? null,
      tagIds: selectedTagIds,
    });
    toast.push({ message: "Đã cập nhật metadata", type: "success" });
    refetch();
  };

  const handleConvertWebp = async () => {
    if (!selected) return;
    if (selected.mimeType === "image/webp") {
      toast.push({ message: "Ảnh đã là WebP.", type: "info" });
      return;
    }
    if (selected.mimeType === "image/svg+xml" || selected.mimeType === "image/gif") {
      toast.push({ message: "Không hỗ trợ WebP cho SVG/GIF.", type: "error" });
      return;
    }
    if (!selected.mimeType?.startsWith("image/")) {
      toast.push({ message: "Định dạng không hỗ trợ.", type: "error" });
      return;
    }
    await convertMediaToWebp(selected.id);
    toast.push({ message: "Đã chuyển sang WebP.", type: "success" });
    refetch();
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const response = await createMediaFolder(name);
    setFolders((prev) => [response.data, ...prev]);
    setNewFolderName("");
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    const response = await createMediaTag(name);
    setTags((prev) => [response.data, ...prev]);
    setNewTagName("");
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) {
      uploadFiles(event.dataTransfer.files);
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  return {
    items: filteredItems,
    isLoading,
    totalPages,
    totalItems,
    selected,
    selectedId,
    setSelectedId,
    selectedIds,
    toggleSelect,
    setSelectedIds,
    page,
    setPage,
    pageSize,
    setPageSize,
    query,
    setQuery,
    sort,
    setSort,
    format,
    setFormat,
    folderFilter,
    setFolderFilter,
    tagFilter,
    setTagFilter,
    folders,
    tags,
    newFolderName,
    setNewFolderName,
    newTagName,
    setNewTagName,
    uploadInputRef,
    replaceInputRef,
    replaceTargetId,
    setReplaceTargetId,
    editedFilename,
    setEditedFilename,
    selectedFolderId,
    setSelectedFolderId,
    selectedTagIds,
    setSelectedTagIds,
    selectedDimensions,
    isDragging,
    setIsDragging,
    duplicateMap,
    refetch,
    openReplace,
    uploadFiles,
    handleReplace,
    handleDelete,
    handleBulkDelete,
    handleUpdateMeta,
    handleCreateFolder,
    handleCreateTag,
    handleBulkMove,
    handleBulkTag,
    handleDownload,
    handleBulkDownload,
    handleBulkConvertWebp,
    handleConvertWebp,
    onDrop,
    onDragOver,
    onDragLeave,
  };
};
