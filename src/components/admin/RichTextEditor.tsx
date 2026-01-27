"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/constants";
import Cropper from "react-easy-crop";
import { getMediaLibrary } from "@/lib/api/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Editor = dynamic(async () => {
  const mod = await import("@tinymce/tinymce-react");
  return mod.Editor;
}, { ssr: false });

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editorRef = useRef<any>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(16 / 9);
  const croppedAreaRef = useRef<{ width: number; height: number; x: number; y: number } | null>(
    null
  );
  const cropFileNameRef = useRef("image.jpg");
  const insertCallbackRef = useRef<((url: string) => void) | null>(null);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaQuery, setMediaQuery] = useState("");

  const mediaQueryResult = useQuery({
    queryKey: ["cms-media-library"],
    queryFn: () => getMediaLibrary(undefined, 1, 60),
  });
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
    const area = croppedAreaRef.current;
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

  const uploadImageBlob = useCallback(async (blob: Blob, filename: string) => {
    const formData = new FormData();
    formData.append("file", blob, filename);
    const csrfToken =
      typeof document === "undefined"
        ? ""
        : document.cookie
            .split(";")
            .map((item) => item.trim())
            .find((item) => item.startsWith("pd2_csrf="))
            ?.split("=")[1] || "";
    const response = await fetch(`${API_BASE_URL}/admin/cms/media`, {
      method: "POST",
      credentials: "include",
      body: formData,
      headers: csrfToken ? { "X-CSRF-Token": decodeURIComponent(csrfToken) } : undefined,
    });
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    const payload = (await response.json()) as {
      success?: boolean;
      location?: string;
      data?: { url?: string };
    };
    const url = payload?.location || payload?.data?.url || "";
    if (!url) {
      throw new Error("Upload failed");
    }
    return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
  }, []);

  const resolveMediaUrl = useCallback(
    (url: string) => (url.startsWith("http") ? url : `${API_BASE_URL}${url}`),
    []
  );

  const handleCropComplete = useCallback(
    (_: unknown, croppedAreaPixels: { width: number; height: number; x: number; y: number }) => {
      croppedAreaRef.current = croppedAreaPixels;
    },
    []
  );

  const handlePickImage = useCallback((cb: (url: string) => void) => {
    insertCallbackRef.current = cb;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      cropFileNameRef.current = file.name || "image.jpg";
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCropOpen(true);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);

  const openMediaLibrary = useCallback(() => {
    setMediaDialogOpen(true);
  }, []);

  const insertImage = useCallback((url: string) => {
    if (insertCallbackRef.current) {
      insertCallbackRef.current(url);
      insertCallbackRef.current = null;
      return;
    }
    editorRef.current?.insertContent(`<img src="${url}" alt="" />`);
  }, []);

  const init = useMemo(
    () => ({
      height: 520,
      min_height: 520,
      resize: true,
      autoresize_bottom_margin: 24,
      menubar: true,
      plugins: [
        "advlist",
        "autolink",
        "lists",
        "link",
        "image",
        "charmap",
        "preview",
        "anchor",
        "searchreplace",
        "visualblocks",
        "code",
        "fullscreen",
        "insertdatetime",
        "media",
        "table",
        "help",
        "wordcount",
        "autoresize",
        "codesample",
        "emoticons",
      ],
      toolbar:
        "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media mediaLibrary table | codesample code preview fullscreen | emoticons charmap | removeformat",
      content_style:
        "body { font-family: Roboto, Arial, sans-serif; font-size: 14px; color: #0f1722; } img { max-width: 100%; height: auto !important; display: block; object-fit: contain; }",
      image_dimensions: false,
      image_advtab: true,
      image_caption: true,
      automatic_uploads: false,
      paste_data_images: false,
      images_reuse_filename: false,
      file_picker_types: "image",
      file_picker_callback: (cb: (url: string) => void) => {
        handlePickImage(cb);
      },
      setup: (editor: any) => {
        editorRef.current = editor;
        editor.ui.registry.addButton("mediaLibrary", {
          text: "Media",
          onAction: () => openMediaLibrary(),
        });
      },
      images_upload_handler: async (blobInfo: {
        blob: () => Blob;
        filename: () => string;
      }): Promise<string> => {
        const blob = blobInfo.blob();
        return uploadImageBlob(blob, blobInfo.filename());
      },
    }),
    [handlePickImage, openMediaLibrary, uploadImageBlob]
  );

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
        init={init}
        value={value}
        onEditorChange={onChange}
        onInit={(_, editor) => {
          editorRef.current = editor;
        }}
      />
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chọn ảnh từ Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tìm ảnh..."
              value={mediaQuery}
              onChange={(event) => setMediaQuery(event.target.value)}
            />
            <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-auto md:grid-cols-3">
              {filteredMedia.length ? (
                filteredMedia.map((item) => {
                  const url = resolveMediaUrl(item.url);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        insertImage(url);
                        setMediaDialogOpen(false);
                      }}
                      className="group overflow-hidden rounded-xl border border-white/10 bg-white"
                    >
                      <img src={url} alt={item.filename} className="h-28 w-full object-cover" />
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
            <div className="flex items-center justify-end">
              <Button variant="secondary" onClick={() => setMediaDialogOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {cropOpen && cropSrc ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f1722] text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Crop image
            </div>
            <div className="relative h-[440px] w-full bg-black">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                onMediaLoaded={(mediaSize) => {
                  if (!mediaSize?.width || !mediaSize?.height) return;
                  setAspect(mediaSize.width / mediaSize.height);
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
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCropOpen(false);
                    setCropSrc(null);
                    insertCallbackRef.current = null;
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!cropSrc) return;
                    try {
                      const blob = await getCroppedBlob(cropSrc);
                      if (!blob) throw new Error("Crop failed");
                      const url = await uploadImageBlob(blob, cropFileNameRef.current);
                      insertCallbackRef.current?.(url);
                      setCropOpen(false);
                      setCropSrc(null);
                    } catch {
                      setCropOpen(false);
                      setCropSrc(null);
                    }
                  }}
                  className="rounded-full bg-[#ff9f40] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1410]"
                >
                  Crop & insert
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
