"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useToast } from "@/components/common/ToastProvider";
import type { CmsCategory, CmsPost, CmsTag } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  createCmsCategory,
  createCmsTag,
  getCmsCategories,
  getCmsTags,
  getMediaLibrary,
  uploadMedia,
} from "@/lib/api/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/constants";
import Cropper from "react-easy-crop";

export default function CmsPostForm({
  initial,
  langCode,
  onSave,
}: {
  initial?: CmsPost;
  langCode: string;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const languages = useMemo(() => ["vi", "en"], []);
  const searchParams = useSearchParams();
  const initialLang =
    searchParams.get("lang") && languages.includes(searchParams.get("lang") || "")
      ? (searchParams.get("lang") as string)
      : langCode;
  const [activeLang, setActiveLang] = useState(initialLang);
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const [translations, setTranslations] = useState<Record<string, {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
  }>>(() => {
    const base: Record<string, {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
    }> = {};
    languages.forEach((code) => {
      base[code] = { title: "", slug: "", excerpt: "", content: "" };
    });
    initial?.translations?.forEach((t) => {
      const code = t.language?.code || langCode;
      if (!base[code]) return;
      base[code] = {
        title: t.title || "",
        slug: t.slug || "",
        excerpt: t.excerpt || "",
        content:
          typeof t.content === "string"
            ? t.content
            : JSON.stringify(t.content || ""),
      };
    });
    return base;
  });
  const [slugEdited, setSlugEdited] = useState<Record<string, boolean>>(() => {
    const base: Record<string, boolean> = {};
    languages.forEach((code) => {
      const hasSlug =
        initial?.translations?.some(
          (t) => (t.language?.code || langCode) === code && t.slug
        ) ?? false;
      base[code] = hasSlug;
    });
    return base;
  });
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status || "DRAFT"
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initial?.categories?.map((item) => item.id) || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initial?.tags?.map((item) => item.id) || []
  );
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const normalizeMediaUrl = (url: string) =>
    url.startsWith(API_BASE_URL) ? url.replace(API_BASE_URL, "") : url;
  const resolveMediaUrl = (url: string) =>
    url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    initial?.thumbnailUrl ? normalizeMediaUrl(initial.thumbnailUrl) : null
  );
  const [mediaQuery, setMediaQuery] = useState("");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [thumbCropOpen, setThumbCropOpen] = useState(false);
  const [thumbCropSrc, setThumbCropSrc] = useState<string | null>(null);
  const [thumbCrop, setThumbCrop] = useState({ x: 0, y: 0 });
  const [thumbZoom, setThumbZoom] = useState(1);
  const thumbAreaRef = useRef<{ width: number; height: number; x: number; y: number } | null>(
    null
  );
  const thumbFileNameRef = useRef("thumbnail.jpg");
  const [isDirty, setIsDirty] = useState(false);
  const storageKey = `cms-post-draft-${initial?.id ?? "new"}`;
  const toast = useToast();

  const categoriesQuery = useQuery({
    queryKey: ["cms-categories"],
    queryFn: () => getCmsCategories(undefined),
  });
  const tagsQuery = useQuery({
    queryKey: ["cms-tags"],
    queryFn: () => getCmsTags(undefined),
  });
  const mediaQueryResult = useQuery({
    queryKey: ["cms-media-library"],
    queryFn: () => getMediaLibrary(undefined, 1, 60),
  });
  const categories = (categoriesQuery.data?.data || []) as CmsCategory[];
  const tags = (tagsQuery.data?.data || []) as CmsTag[];
  const filteredCategories = useMemo(() => {
    const normalized = categoryQuery.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((item) =>
      item.name.toLowerCase().includes(normalized)
    );
  }, [categories, categoryQuery]);
  const filteredTags = useMemo(() => {
    const normalized = tagQuery.trim().toLowerCase();
    if (!normalized) return tags;
    return tags.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [tags, tagQuery]);
  const mediaItems = mediaQueryResult.data?.data?.items || [];
  const filteredMedia = useMemo(() => {
    const normalized = mediaQuery.trim().toLowerCase();
    if (!normalized) return mediaItems;
    return mediaItems.filter((item) =>
      item.filename.toLowerCase().includes(normalized)
    );
  }, [mediaItems, mediaQuery]);

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedBlob = useCallback(async (imageSrc: string) => {
    const area = thumbAreaRef.current;
    if (!area) return null;
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = area.width;
    canvas.height = area.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(
      image,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      area.width,
      area.height
    );
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });
  }, []);

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message: text, type });
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.", "error");
      return;
    }
    notify("Unable to reach the server. Please try again.", "error");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.get("lang")) {
      url.searchParams.set("lang", activeLang);
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeLang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        translations: typeof translations;
        status: "DRAFT" | "PUBLISHED";
        activeLang: string;
      };
      if (parsed?.translations) {
        setTranslations(parsed.translations);
      }
      if (parsed?.status) {
        setStatus(parsed.status);
      }
      if (parsed?.activeLang && languages.includes(parsed.activeLang)) {
        setActiveLang(parsed.activeLang);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, languages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ translations, status, activeLang })
    );
  }, [translations, status, activeLang, isDirty, storageKey]);

  const current = translations[activeLang] || {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {languages.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setActiveLang(code);
                if (typeof window !== "undefined") {
                  const url = new URL(window.location.href);
                  url.searchParams.set("lang", code);
                  window.history.replaceState(null, "", url.toString());
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                activeLang === code
                  ? "bg-[var(--accent-strong)] text-white"
                  : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        {activeLang !== langCode ? (
          <Button
            variant="outline"
            onClick={() => {
              const primary = translations[langCode];
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...primary },
              }));
            }}
          >
            Clone from {langCode.toUpperCase()}
          </Button>
        ) : null}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <div className="grid gap-4">
          <Input
            label="Title"
            value={current.title}
            onChange={(event) => {
              setIsDirty(true);
              const nextTitle = event.target.value;
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], title: nextTitle },
              }));
              if (!slugEdited[activeLang]) {
                setTranslations((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], slug: slugify(nextTitle) },
                }));
              }
            }}
          />
          <Input
            label="Slug"
            value={current.slug}
            onChange={(event) => {
              setIsDirty(true);
              setSlugEdited((prev) => ({ ...prev, [activeLang]: true }));
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], slug: event.target.value },
              }));
            }}
          />
          <Textarea
            label="Excerpt"
            value={current.excerpt}
            onChange={(event) => {
              setIsDirty(true);
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], excerpt: event.target.value },
              }));
            }}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--ink)]">
              Content
            </p>
            <RichTextEditor
              value={current.content}
              onChange={(value) => {
                setIsDirty(true);
                setTranslations((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], content: value },
                }));
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
              value={status}
              onChange={(event) => {
                setIsDirty(true);
                setStatus(event.target.value as "DRAFT" | "PUBLISHED");
              }}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <Button
              onClick={async () => {
                try {
                  await onSave({
                    status,
                    categoryIds: selectedCategoryIds,
                    tagIds: selectedTagIds,
                    thumbnailUrl,
                    translations: [
                      {
                        langCode: activeLang,
                        title: current.title,
                        slug: current.slug,
                        excerpt: current.excerpt,
                        content: current.content,
                      },
                    ],
                  });
                  notify("Saved.", "success");
                  setIsDirty(false);
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(storageKey);
                  }
                } catch (err) {
                  handleError(err);
                }
              }}
            >
              Save
            </Button>
          </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Danh mục
              </p>
              <span className="text-xs text-[var(--ink-muted)]">
                {selectedCategoryIds.length} đã chọn
              </span>
            </div>
            <div className="mt-2">
              <Input
                label="Tìm danh mục"
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
              />
            </div>
            <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-auto">
              {filteredCategories.length ? (
                filteredCategories.map((category) => {
                  const active = selectedCategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryIds((prev) =>
                          active
                            ? prev.filter((id) => id !== category.id)
                            : [...prev, category.id]
                        )
                      }
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                        active
                          ? "bg-[var(--accent-strong)] text-white"
                          : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-[var(--ink-muted)]">Không có danh mục phù hợp.</p>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                label="Thêm danh mục mới"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                onKeyDown={async (event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
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
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
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
                }}
              >
                Thêm
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Thẻ
              </p>
              <span className="text-xs text-[var(--ink-muted)]">
                {selectedTagIds.length} đã chọn
              </span>
            </div>
            <div className="mt-2">
              <Input
                label="Tìm thẻ"
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
              />
            </div>
            <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-auto">
              {filteredTags.length ? (
                filteredTags.map((tag) => {
                  const active = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTagIds((prev) =>
                          active
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                        active
                          ? "bg-[var(--accent-strong)] text-white"
                          : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-[var(--ink-muted)]">Không có thẻ phù hợp.</p>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                label="Thêm thẻ mới"
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={async (event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
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
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
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
                }}
              >
                Thêm
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Thumbnail
              </p>
              <span className="text-[10px] text-[var(--ink-muted)]">
                Ảnh đại diện
              </span>
            </div>
            <div
              className="mt-3 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--mist)]"
              style={{ aspectRatio: "1 / 1" }}
            >
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl.startsWith("/") ? `${API_BASE_URL}${thumbnailUrl}` : thumbnailUrl}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--ink-muted)]">
                  Chưa có ảnh
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Chọn từ Media
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Chọn ảnh</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      label="Tìm ảnh"
                      value={mediaQuery}
                      onChange={(event) => setMediaQuery(event.target.value)}
                    />
                    <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-auto md:grid-cols-3">
                      {filteredMedia.length ? (
                        filteredMedia.map((item) => {
                          const url = item.url;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setThumbnailUrl(normalizeMediaUrl(url));
                                setMediaDialogOpen(false);
                              }}
                              className="group overflow-hidden rounded-xl border border-[var(--line)] bg-white"
                            >
                              <img
                                src={resolveMediaUrl(url)}
                                alt={item.filename}
                                className="h-28 w-full object-cover"
                              />
                              <div className="p-2 text-left text-[10px] text-[var(--ink-muted)]">
                                {item.filename}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-[var(--ink-muted)]">Không có ảnh phù hợp.</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <label className="inline-flex cursor-pointer items-center rounded-full border border-[var(--line)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Upload ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const inputEl = event.currentTarget;
                    const file = inputEl.files?.[0];
                    if (!file) return;
                    inputEl.value = "";
                    thumbFileNameRef.current = file.name || "thumbnail.jpg";
                    const reader = new FileReader();
                    reader.onload = () => {
                      setThumbCropSrc(reader.result as string);
                      setThumbCrop({ x: 0, y: 0 });
                      setThumbZoom(1);
                      setThumbCropOpen(true);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {thumbnailUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setThumbnailUrl(null)}
                >
                  Xoá
                </Button>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
      {thumbCropOpen && thumbCropSrc ? (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f1722] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Crop thumbnail (1:1)
            </div>
            <div className="relative h-[420px] w-full bg-black">
              <Cropper
                image={thumbCropSrc}
                crop={thumbCrop}
                zoom={thumbZoom}
                aspect={1}
                onCropChange={setThumbCrop}
                onZoomChange={setThumbZoom}
                onCropComplete={(_, croppedAreaPixels) => {
                  thumbAreaRef.current = croppedAreaPixels;
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <label className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={thumbZoom}
                  onChange={(event) => setThumbZoom(Number(event.target.value))}
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setThumbCropOpen(false);
                    setThumbCropSrc(null);
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!thumbCropSrc) return;
                    try {
                      const blob = await getCroppedBlob(thumbCropSrc);
                      if (!blob) throw new Error("Crop failed");
                      const response = await uploadMedia(
                        new File([blob], thumbFileNameRef.current, { type: "image/jpeg" })
                      );
                      const url = response?.data?.url;
                      if (url) {
                        setThumbnailUrl(normalizeMediaUrl(url));
                      }
                      setThumbCropOpen(false);
                      setThumbCropSrc(null);
                    } catch (err) {
                      handleError(err);
                      setThumbCropOpen(false);
                      setThumbCropSrc(null);
                    }
                  }}
                  className="rounded-full bg-[#ff9f40] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1410]"
                >
                  Crop & save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
