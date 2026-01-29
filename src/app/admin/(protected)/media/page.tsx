"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createMediaFolder,
  createMediaTag,
  deleteMedia,
  getMediaFolders,
  getMediaLibrary,
  getMediaTags,
  updateMedia,
  updateMediaMeta,
  uploadMedia,
} from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastProvider";
import { API_BASE_URL } from "@/lib/constants";
import type { MediaFolder, MediaTag } from "@/types/api.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};

const resolveMediaUrl = (url: string) =>
  url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

const resolveMediaPreview = (item: { url: string; variants?: { url: string; kind: string }[] }) => {
  const variant =
    item.variants?.find((v) => v.kind === "webp-320") ||
    item.variants?.find((v) => v.kind.startsWith("webp-"));
  return variant ? resolveMediaUrl(variant.url) : resolveMediaUrl(item.url);
};

export default function MediaLibraryPage() {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<number | "ALL">("ALL");
  const [tagFilter, setTagFilter] = useState<number | "ALL">("ALL");
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [tags, setTags] = useState<MediaTag[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<number | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [editedFilename, setEditedFilename] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isCropping, setIsCropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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
        const [folderRes, tagRes] = await Promise.all([
          getMediaFolders(),
          getMediaTags(),
        ]);
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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!items.length) return;
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(items.map((item) => item.id));
  };

  useEffect(() => {
    if (!selected) {
      setSelectedDimensions(null);
      setEditedFilename("");
      setSelectedFolderId(null);
      setSelectedTagIds([]);
      return;
    }
    setEditedFilename(selected.filename || "");
    setSelectedFolderId(selected.folder?.id ?? null);
    setSelectedTagIds(selected.tags?.map((item) => item.tagId) ?? []);
    let active = true;
    const loadDimensions = async () => {
      try {
        const response = await fetch(resolveMediaUrl(selected.url), {
          credentials: "include",
        });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          if (!active) return;
          setSelectedDimensions({ width: image.width, height: image.height });
          URL.revokeObjectURL(objectUrl);
        };
        image.onerror = () => {
          if (!active) return;
          setSelectedDimensions(null);
          URL.revokeObjectURL(objectUrl);
        };
        image.src = objectUrl;
      } catch {
        if (active) {
          setSelectedDimensions(null);
        }
      }
    };
    loadDimensions();
    return () => {
      active = false;
    };
  }, [selected]);

  useEffect(() => {
    if (!items.length && selectedIds.length) {
      setSelectedIds([]);
      return;
    }
    const ids = new Set(items.map((item) => item.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => ids.has(id));
      if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) {
        return prev;
      }
      return next;
    });
  }, [items, selectedIds.length]);

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedia(undefined, id);
      await refetch();
      toast.push({ message: "Đã xoá ảnh.", type: "success" });
      if (selectedId === id) setSelectedId(null);
    } catch {
      toast.push({ message: "Xoá thất bại.", type: "error" });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteMedia(undefined, id)));
      await refetch();
      setSelectedIds([]);
      toast.push({ message: "Đã xoá ảnh đã chọn.", type: "success" });
    } catch {
      toast.push({ message: "Xoá thất bại.", type: "error" });
    }
  };

  const handleReplace = async (id: number, file?: File | null) => {
    if (!file) return;
    if (!validateImage(file)) return;
    try {
      await updateMedia(id, file);
      await refetch();
      toast.push({ message: "Đã cập nhật ảnh.", type: "success" });
    } catch {
      toast.push({ message: "Cập nhật thất bại.", type: "error" });
    }
  };

  const handleSaveMeta = async (id: number) => {
    const trimmed = editedFilename.trim();
    if (!trimmed) {
      toast.push({ message: "Tên file không được để trống.", type: "error" });
      return;
    }
    try {
      await updateMediaMeta(id, {
        filename: trimmed,
        folderId: selectedFolderId,
        tagIds: selectedTagIds,
      });
      await refetch();
      toast.push({ message: "Đã lưu metadata.", type: "success" });
    } catch {
      toast.push({ message: "Lưu metadata thất bại.", type: "error" });
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => validateImage(file));
    if (!validFiles.length) return;
    try {
      const results = await Promise.all(validFiles.map((file) => uploadMedia(file)));
      await refetch();
      const duplicates = results.filter((item: any) => item?.duplicate).length;
      toast.push({ message: `Đã tải ${validFiles.length} ảnh.`, type: "success" });
      if (duplicates) {
        toast.push({ message: `${duplicates} ảnh trùng đã được bỏ qua.`, type: "info" });
      }
    } catch {
      toast.push({ message: "Upload thất bại.", type: "error" });
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      const response = await createMediaFolder(name);
      setFolders((prev) => [...prev, ...(response?.data ? [response.data] : [])]);
      setNewFolderName("");
      toast.push({ message: "Đã tạo folder.", type: "success" });
    } catch {
      toast.push({ message: "Không thể tạo folder.", type: "error" });
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const response = await createMediaTag(name);
      setTags((prev) => [...prev, ...(response?.data ? [response.data] : [])]);
      setNewTagName("");
      toast.push({ message: "Đã tạo tag.", type: "success" });
    } catch {
      toast.push({ message: "Không thể tạo tag.", type: "error" });
    }
  };

  const toggleTagSelection = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const cropToSquare = async () => {
    if (!selected) return;
    try {
      setIsCropping(true);
      const response = await fetch(resolveMediaUrl(selected.url), {
        credentials: "include",
      });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("load failed"));
        image.src = objectUrl;
      });
      const size = Math.min(image.width, image.height);
      const sx = Math.floor((image.width - size) / 2);
      const sy = Math.floor((image.height - size) / 2);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas not supported");
      ctx.drawImage(image, sx, sy, size, size, 0, 0, size, size);
      const outputType = selected.mimeType || blob.type || "image/jpeg";
      const croppedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (result) => resolve(result || blob),
          outputType,
          0.92
        );
      });
      const croppedFile = new File([croppedBlob], selected.filename || "media.jpg", {
        type: outputType,
      });
      URL.revokeObjectURL(objectUrl);
      await handleReplace(selected.id, croppedFile);
    } catch {
      toast.push({ message: "Không thể crop ảnh.", type: "error" });
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <div className="space-y-6">
      <input
        id="media-upload-input"
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          await handleUploadFiles(files);
          event.target.value = "";
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          const id = replaceTargetId ?? selectedId;
          if (id) {
            await handleReplace(id, file);
          }
          event.target.value = "";
          setReplaceTargetId(null);
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-white">Thư viện Media</h1>
        <div className="flex items-center gap-3">
          <label
            htmlFor="media-upload-input"
            className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
          >
            Tải ảnh
          </label>
          <Button
            size="icon"
            onClick={() => uploadInputRef.current?.click()}
            aria-label="Upload images"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </div>
      </div>
      <div
        className={`rounded-3xl border border-dashed px-6 py-8 text-center text-sm transition ${
          isDragging
            ? "border-[#ff9f40] bg-[#141b26] text-white"
            : "border-white/10 bg-[#0f1722] text-white/70"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (event) => {
          event.preventDefault();
          setIsDragging(false);
          const files = Array.from(event.dataTransfer.files ?? []);
          await handleUploadFiles(files);
        }}
      >
        <p className="text-base font-semibold text-white">
          Kéo & thả ảnh vào đây để upload nhiều ảnh
        </p>
        <p className="mt-2 text-xs text-white/60">
          Hoặc click nút + ở trên để chọn nhiều ảnh
        </p>
      </div>
      <div className="grid gap-3 rounded-3xl border border-white/10 bg-[#0f1722] p-4 text-sm text-white/70 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Search</p>
            <Input
              placeholder="Tìm theo tên file..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="mt-2"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
              Folder
              <select
                className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
                value={folderFilter}
                onChange={(event) => {
                  const value = event.target.value;
                  setFolderFilter(value === "ALL" ? "ALL" : Number(value));
                  setPage(1);
                }}
              >
                <option value="ALL" className="bg-[#0f1722] text-white">
                  Tất cả
                </option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id} className="bg-[#0f1722] text-white">
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
              Tag
              <select
                className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
                value={tagFilter}
                onChange={(event) => {
                  const value = event.target.value;
                  setTagFilter(value === "ALL" ? "ALL" : Number(value));
                  setPage(1);
                }}
              >
                <option value="ALL" className="bg-[#0f1722] text-white">
                  Tất cả
                </option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id} className="bg-[#0f1722] text-white">
                    {tag.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Tạo folder</p>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Tên folder..."
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
              />
              <Button size="sm" variant="secondary" onClick={handleCreateFolder}>
                Tạo
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Tạo tag</p>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Tên tag..."
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
              />
              <Button size="sm" variant="secondary" onClick={handleCreateTag}>
                Tạo
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#0f1722] px-4 py-3 text-sm text-white/70">
        <div>
          {totalItems ? (
            <span>
              Tổng <span className="text-white">{totalItems}</span> ảnh
            </span>
          ) : (
            <span>Chưa có media</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
            <input
              type="checkbox"
              checked={items.length > 0 && selectedIds.length === items.length}
              onChange={toggleSelectAll}
              className="h-4 w-4"
            />
            Chọn trang
          </label>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
            Hiển thị
            <select
              className="rounded-full border border-white/10 bg-transparent px-3 py-1 text-xs text-white"
              value={pageSize}
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
            >
              {[12, 24, 36, 48].map((size) => (
                <option key={size} value={size} className="bg-[#0f1722] text-white">
                  {size}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Trước
            </Button>
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
      {selectedIds.length ? (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-[#0f1722] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/70">
          <span>{selectedIds.length} đã chọn</span>
          <Button size="sm" variant="secondary" onClick={toggleSelectAll}>
            {selectedIds.length === items.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="secondary">
                Xoá đã chọn
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Xoá ảnh đã chọn?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn sắp xoá {selectedIds.length} ảnh. Thao tác này không thể hoàn tác.
              </AlertDialogDescription>
              <div className="mt-5 flex items-center justify-end gap-3">
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>Xoá</AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
      {isLoading ? (
        <Loading label="Loading media" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.length ? (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="h-full w-full"
                      aria-label={`View ${item.filename}`}
                    >
                      <img
                        src={resolveMediaPreview(item)}
                        alt={item.filename}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                    {item.checksum && (duplicateMap.get(item.checksum) ?? 0) > 1 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                        Duplicate
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="h-4 w-4"
                      />
                      <span className="min-w-0 flex-1 truncate">{item.filename}</span>
                    </label>
                  </div>
                  <div className="mt-1 space-y-1 text-[11px] text-slate-500">
                    {item.folder?.name ? (
                      <p className="truncate">Folder: {item.folder.name}</p>
                    ) : null}
                    {item.tags?.length ? (
                      <p className="truncate">
                        Tags: {item.tags.map((tag) => tag.tag.name).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setReplaceTargetId(item.id);
                          replaceInputRef.current?.click();
                        }}
                      >
                        Sửa
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="secondary">
                            Xoá
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Xoá ảnh?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ảnh sẽ bị xoá khỏi thư viện và không thể khôi phục.
                          </AlertDialogDescription>
                          <div className="mt-5 flex items-center justify-end gap-3">
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              Xoá ảnh
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-slate-400">Chưa có media.</p>
          )}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setReplaceTargetId(null);
          }
        }}
      >
        {selected ? (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Media details</DialogTitle>
              <DialogDescription>Thông tin chi tiết về file đã upload.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setReplaceTargetId(selected.id);
                    replaceInputRef.current?.click();
                  }}
                  className="group relative h-full w-full"
                  aria-label="Replace media"
                >
                  <img
                    src={resolveMediaUrl(selected.url)}
                    alt={selected.filename}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition group-hover:opacity-100">
                    Replace
                  </span>
                </button>
              </div>
              <div className="space-y-3 text-sm text-white/80">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Filename</p>
                  <p className="break-all text-white">{selected.filename}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Dimensions</p>
                  <p className="text-white">
                    {selectedDimensions
                      ? `${selectedDimensions.width} x ${selectedDimensions.height}px`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Type</p>
                  <p className="text-white">{selected.mimeType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Size</p>
                  <p className="text-white">{formatBytes(selected.size)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Uploaded</p>
                  <p className="text-white">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">URL</p>
                  <p className="break-all text-white">{selected.url}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Rename</p>
                  <input
                    type="text"
                    value={editedFilename}
                    onChange={(event) => setEditedFilename(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0f1722] px-3 py-2 text-sm text-white/80"
                    placeholder="Tên file"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Folder</p>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-[#0f1722] px-3 py-2 text-sm text-white/80"
                    value={selectedFolderId ?? ""}
                    onChange={(event) =>
                      setSelectedFolderId(event.target.value ? Number(event.target.value) : null)
                    }
                  >
                    <option value="" className="bg-[#0f1722] text-white">
                      Không chọn
                    </option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id} className="bg-[#0f1722] text-white">
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Tags</p>
                  <div className="max-h-28 space-y-2 overflow-auto rounded-lg border border-white/10 bg-[#0f1722] p-3 text-xs text-white/70">
                    {tags.length ? (
                      tags.map((tag) => (
                        <label key={tag.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedTagIds.includes(tag.id)}
                            onChange={() => toggleTagSelection(tag.id)}
                          />
                          <span>{tag.name}</span>
                        </label>
                      ))
                    ) : (
                      <span className="text-xs text-white/50">Chưa có tag</span>
                    )}
                  </div>
                </div>
                {selected.variants?.length ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Variants</p>
                    <div className="space-y-2 text-xs text-white/70">
                      {selected.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
                        >
                          <span className="uppercase tracking-[0.2em] text-white/50">
                            {variant.kind}
                          </span>
                          <span>
                            {variant.width && variant.height
                              ? `${variant.width}x${variant.height}`
                              : "-"}
                          </span>
                          <span>{formatBytes(variant.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSaveMeta(selected.id)}
                  disabled={!editedFilename.trim()}
                >
                  Lưu metadata
                </Button>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setReplaceTargetId(selected.id);
                      replaceInputRef.current?.click();
                    }}
                  >
                    Replace
                  </Button>
                  <Button size="sm" variant="secondary" onClick={cropToSquare} disabled={isCropping}>
                    {isCropping ? "Cropping..." : "Crop vuông"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete media?</AlertDialogTitle>
                      <AlertDialogDescription>
                        File sẽ bị xoá vĩnh viễn khỏi hệ thống.
                      </AlertDialogDescription>
                      <div className="mt-5 flex items-center justify-end gap-3">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selected.id)}>
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
