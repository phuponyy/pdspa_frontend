"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useAdminMutation, useAdminQuery } from "@/lib/api/adminHooks";
import {
  createCmsPage,
  getCmsPages,
  getMediaLibrary,
  updateCmsPage,
} from "@/lib/api/admin";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { normalizeMediaUrl, resolveMediaUrl } from "@/lib/media";
import type { CmsPage } from "@/types/api.types";
import {
  defaultGoodMassageContent,
  normalizeGoodMassageContent,
  type GoodMassageContent,
} from "@/types/goodMassage.types";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import { AdminDialog, AdminDialogTrigger, AdminDialogContent, AdminDialogHeader, AdminDialogTitle, AdminDialogDescription, AdminDialogFooter, AdminAlertDialog, AdminAlertDialogTrigger, AdminAlertDialogAction, AdminAlertDialogCancel, AdminAlertDialogContent, AdminAlertDialogTitle, AdminAlertDialogDescription } from "@/components/admin/ui/AdminDialog";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

const CMS_SLUG = "good-massage-in-da-nang";
const LANGS = ["vi", "en"] as const;
type LangCode = (typeof LANGS)[number];

const statSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
});
const highlightSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});
const galleryItemSchema = z.object({
  imageUrl: z.string().min(1, "Image is required"),
  caption: z.string().optional(),
});
const goodMassageSchema = z.object({
  hero: z.object({
    eyebrow: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    heroImage: z.string().optional(),
  }),
  intro: z.object({
    heading: z.string().optional(),
    descriptionHtml: z.string().optional(),
  }),
  stats: z.array(statSchema),
  highlights: z.array(highlightSchema),
  gallery: z.object({
    title: z.string().optional(),
    items: z.array(galleryItemSchema),
  }),
  cta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    primaryLabel: z.string().optional(),
    primaryLink: z.string().optional(),
  }),
  faqHtml: z.string().optional(),
});

type MediaTarget =
  | { section: "hero"; index?: number }
  | { section: "highlights"; index: number }
  | { section: "gallery"; index: number }
  | null;

const buildEmptyContent = (): GoodMassageContent => ({
  ...defaultGoodMassageContent,
  highlights: [],
  gallery: { title: "Gallery", items: [] },
});

export default function GoodMassageAdminPage() {
  const [activeLang, setActiveLang] = useState<LangCode>("vi");
  const [contentByLang, setContentByLang] = useState<Record<LangCode, GoodMassageContent>>({
    vi: buildEmptyContent(),
    en: buildEmptyContent(),
  });
  const [metaByLang, setMetaByLang] = useState<Record<LangCode, { title: string; slug: string }>>({
    vi: { title: "Good Massage In Da Nang", slug: CMS_SLUG },
    en: { title: "Good Massage In Da Nang", slug: CMS_SLUG },
  });
  const [pageId, setPageId] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaQuery, setMediaQuery] = useState("");
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>(null);

  const seededRef = useRef(false);

  const pagesQuery = useAdminQuery({
    queryKey: ["cms-pages", CMS_SLUG],
    queryFn: () => getCmsPages(undefined, 1, 200),
  });

  const mediaQueryResult = useAdminQuery({
    queryKey: ["cms-media-library", mediaQuery],
    queryFn: () => getMediaLibrary(undefined, 1, 60, { q: mediaQuery }),
  });

  const currentContent = contentByLang[activeLang];
  const mediaItems = mediaQueryResult.data?.data?.items ?? [];

  const cmsPage = useMemo(() => {
    const items = pagesQuery.data?.data?.items ?? [];
    return items.find((item) =>
      item.translations?.some(
        (t) => t.slug === CMS_SLUG || t.slug === `/${CMS_SLUG}`
      )
    );
  }, [pagesQuery.data]);

  useEffect(() => {
    if (!cmsPage || seededRef.current) return;
    seededRef.current = true;
    setPageId(cmsPage.id);
    const nextMeta: Record<LangCode, { title: string; slug: string }> = {
      vi: { title: "Good Massage In Da Nang", slug: CMS_SLUG },
      en: { title: "Good Massage In Da Nang", slug: CMS_SLUG },
    };
    const nextContent: Record<LangCode, GoodMassageContent> = {
      vi: buildEmptyContent(),
      en: buildEmptyContent(),
    };
    cmsPage.translations?.forEach((t) => {
      const code = (t.language?.code || "en") as LangCode;
      nextMeta[code] = {
        title: t.title || nextMeta[code].title,
        slug: t.slug || nextMeta[code].slug,
      };
      nextContent[code] = normalizeGoodMassageContent(t.content);
    });
    setMetaByLang(nextMeta);
    setContentByLang(nextContent);
  }, [cmsPage]);

  const createPageMutation = useAdminMutation({
    mutationFn: async () =>
      createCmsPage(undefined, {
        status: "DRAFT",
        translations: LANGS.map((code) => ({
          langCode: code,
          title: metaByLang[code].title,
          slug: metaByLang[code].slug,
          content: contentByLang[code],
        })),
      }),
    toastOnSuccess: true,
    successMessage: "Đã tạo trang Good Massage.",
  });

  const updateMutation = useAdminMutation({
    mutationFn: async () => {
      if (!pageId) throw new Error("Page not created");
      return updateCmsPage(undefined, pageId, {
        translations: LANGS.map((code) => ({
          langCode: code,
          title: metaByLang[code].title,
          slug: metaByLang[code].slug,
          content: contentByLang[code],
        })),
      });
    },
    toastOnSuccess: true,
    successMessage: "Đã lưu nội dung.",
  });

  const addStat = () => {
    setContentByLang((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        stats: [...prev[activeLang].stats, { label: "", value: "" }],
      },
    }));
    setIsDirty(true);
  };

  const addHighlight = () => {
    setContentByLang((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        highlights: [
          ...prev[activeLang].highlights,
          { title: "", description: "", imageUrl: "" },
        ],
      },
    }));
    setIsDirty(true);
  };

  const addGalleryItem = () => {
    setContentByLang((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        gallery: {
          ...prev[activeLang].gallery,
          items: [
            ...prev[activeLang].gallery.items,
            { imageUrl: "", caption: "" },
          ],
        },
      },
    }));
    setIsDirty(true);
  };

  const validate = () => {
    const result = goodMassageSchema.safeParse(currentContent);
    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!pageId) {
      await createPageMutation.mutateAsync();
      setIsDirty(false);
      return;
    }
    await updateMutation.mutateAsync();
    setIsDirty(false);
  };

  const handleMediaPick = (url: string) => {
    if (!mediaTarget) return;
    const nextUrl = normalizeMediaUrl(url);
    setContentByLang((prev) => {
      const next = { ...prev };
      const current = { ...next[activeLang] };
      if (mediaTarget.section === "hero") {
        current.hero = { ...current.hero, heroImage: nextUrl };
      }
      if (mediaTarget.section === "highlights") {
        const items = [...current.highlights];
        if (items[mediaTarget.index]) {
          items[mediaTarget.index] = { ...items[mediaTarget.index], imageUrl: nextUrl };
        }
        current.highlights = items;
      }
      if (mediaTarget.section === "gallery") {
        const items = [...current.gallery.items];
        if (items[mediaTarget.index]) {
          items[mediaTarget.index] = { ...items[mediaTarget.index], imageUrl: nextUrl };
        }
        current.gallery = { ...current.gallery, items };
      }
      next[activeLang] = current;
      return next;
    });
    setMediaDialogOpen(false);
    setMediaTarget(null);
    setIsDirty(true);
  };

  return (
    <div className="admin-panel space-y-6 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">CMS PAGE</p>
          <h1 className="text-2xl font-semibold">Good Massage In Da Nang</h1>
          <p className="text-sm text-white/60">Chỉnh sửa nội dung trang theo từng ngôn ngữ.</p>
        </div>
        <div className="flex items-center gap-2">
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLang(code)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                activeLang === code
                  ? "border-[#ff9f40] bg-[#ff9f40] text-black"
                  : "border-white/10 text-white/70"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
          <AdminButton onClick={handleSave} disabled={updateMutation.isPending || createPageMutation.isPending}>
            {pageId ? "Lưu cập nhật" : "Tạo trang"}
          </AdminButton>
        </div>
      </div>

      {!cmsPage && !pagesQuery.isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-[#101828] p-4 text-sm text-white/70">
          Trang CMS chưa tồn tại. Nhấn “Tạo trang” để khởi tạo dữ liệu.
        </div>
      ) : null}

      {errors.length ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {errors.map((err: string, index) => (
            <p key={`${err}-${index}`}>{err}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-[#101828] p-6">
            <h2 className="text-lg font-semibold text-white">Hero</h2>
            <div className="mt-4 grid gap-4">
              <AdminInput
                placeholder="Eyebrow"
                value={currentContent.hero.eyebrow || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], hero: { ...prev[activeLang].hero, eyebrow: value } },
                  }));
                  setIsDirty(true);
                }}
              />
              <AdminInput
                placeholder="Title"
                value={currentContent.hero.title}
                onChange={(event) => {
                  const value = event.target.value;
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], hero: { ...prev[activeLang].hero, title: value } },
                  }));
                  setIsDirty(true);
                }}
              />
              <AdminTextarea
                placeholder="Subtitle"
                value={currentContent.hero.subtitle || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], hero: { ...prev[activeLang].hero, subtitle: value } },
                  }));
                  setIsDirty(true);
                }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <AdminInput
                  placeholder="Hero image URL"
                  value={currentContent.hero.heroImage || ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setContentByLang((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], hero: { ...prev[activeLang].hero, heroImage: value } },
                    }));
                    setIsDirty(true);
                  }}
                />
                <AdminButton
                  type="button"
                  onClick={() => {
                    setMediaTarget({ section: "hero" });
                    setMediaDialogOpen(true);
                  }}
                >
                  Chọn từ Media
                </AdminButton>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#101828] p-6">
            <h2 className="text-lg font-semibold text-white">Intro</h2>
            <div className="mt-4 grid gap-4">
              <AdminInput
                placeholder="Heading"
                value={currentContent.intro.heading || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], intro: { ...prev[activeLang].intro, heading: value } },
                  }));
                  setIsDirty(true);
                }}
              />
              <RichTextEditor
                value={currentContent.intro.descriptionHtml || ""}
                onChange={(value) => {
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], intro: { ...prev[activeLang].intro, descriptionHtml: value } },
                  }));
                  setIsDirty(true);
                }}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#101828] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Stats</h2>
              <AdminButton type="button" onClick={addStat}>
                Thêm số liệu
              </AdminButton>
            </div>
            <div className="mt-4 grid gap-4">
              {currentContent.stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <AdminInput
                    placeholder="Label"
                    value={stat.label}
                    onChange={(event) => {
                      const value = event.target.value;
                      setContentByLang((prev) => {
                        const stats = [...prev[activeLang].stats];
                        stats[index] = { ...stats[index], label: value };
                        return { ...prev, [activeLang]: { ...prev[activeLang], stats } };
                      });
                      setIsDirty(true);
                    }}
                  />
                  <AdminInput
                    placeholder="Value"
                    value={stat.value}
                    onChange={(event) => {
                      const value = event.target.value;
                      setContentByLang((prev) => {
                        const stats = [...prev[activeLang].stats];
                        stats[index] = { ...stats[index], value };
                        return { ...prev, [activeLang]: { ...prev[activeLang], stats } };
                      });
                      setIsDirty(true);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setContentByLang((prev) => {
                        const stats = [...prev[activeLang].stats];
                        stats.splice(index, 1);
                        return { ...prev, [activeLang]: { ...prev[activeLang], stats } };
                      });
                      setIsDirty(true);
                    }}
                    className="rounded-full border border-white/10 px-4 text-xs text-white/60"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#101828] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Highlights</h2>
              <AdminButton type="button" onClick={addHighlight}>
                Thêm highlight
              </AdminButton>
            </div>
            <div className="mt-4 grid gap-5">
              {currentContent.highlights.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-2xl border border-white/10 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <AdminInput
                      placeholder="Title"
                      value={item.title}
                      onChange={(event) => {
                        const value = event.target.value;
                        setContentByLang((prev) => {
                          const highlights = [...prev[activeLang].highlights];
                          highlights[index] = { ...highlights[index], title: value };
                          return { ...prev, [activeLang]: { ...prev[activeLang], highlights } };
                        });
                        setIsDirty(true);
                      }}
                    />
                    <AdminInput
                      placeholder="Image URL"
                      value={item.imageUrl || ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setContentByLang((prev) => {
                          const highlights = [...prev[activeLang].highlights];
                          highlights[index] = { ...highlights[index], imageUrl: value };
                          return { ...prev, [activeLang]: { ...prev[activeLang], highlights } };
                        });
                        setIsDirty(true);
                      }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <AdminTextarea
                      placeholder="Description"
                      value={item.description || ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setContentByLang((prev) => {
                          const highlights = [...prev[activeLang].highlights];
                          highlights[index] = { ...highlights[index], description: value };
                          return { ...prev, [activeLang]: { ...prev[activeLang], highlights } };
                        });
                        setIsDirty(true);
                      }}
                    />
                    <AdminButton
                      type="button"
                      onClick={() => {
                        setMediaTarget({ section: "highlights", index });
                        setMediaDialogOpen(true);
                      }}
                    >
                      Chọn ảnh
                    </AdminButton>
                    <button
                      type="button"
                      onClick={() => {
                        setContentByLang((prev) => {
                          const highlights = [...prev[activeLang].highlights];
                          highlights.splice(index, 1);
                          return { ...prev, [activeLang]: { ...prev[activeLang], highlights } };
                        });
                        setIsDirty(true);
                      }}
                      className="rounded-full border border-white/10 px-3 text-xs text-white/60"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#101828] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Gallery</h2>
              <AdminButton type="button" onClick={addGalleryItem}>
                Thêm ảnh
              </AdminButton>
            </div>
            <div className="mt-4 grid gap-4">
              <AdminInput
                placeholder="Title"
                value={currentContent.gallery.title || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], gallery: { ...prev[activeLang].gallery, title: value } },
                  }));
                  setIsDirty(true);
                }}
              />
              {currentContent.gallery.items.map((item, index) => (
                <div key={`${item.imageUrl}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <AdminInput
                    placeholder="Image URL"
                    value={item.imageUrl}
                    onChange={(event) => {
                      const value = event.target.value;
                      setContentByLang((prev) => {
                        const items = [...prev[activeLang].gallery.items];
                        items[index] = { ...items[index], imageUrl: value };
                        return { ...prev, [activeLang]: { ...prev[activeLang], gallery: { ...prev[activeLang].gallery, items } } };
                      });
                      setIsDirty(true);
                    }}
                  />
                  <AdminInput
                    placeholder="Caption"
                    value={item.caption || ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setContentByLang((prev) => {
                        const items = [...prev[activeLang].gallery.items];
                        items[index] = { ...items[index], caption: value };
                        return { ...prev, [activeLang]: { ...prev[activeLang], gallery: { ...prev[activeLang].gallery, items } } };
                      });
                      setIsDirty(true);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <AdminButton
                      type="button"
                      onClick={() => {
                        setMediaTarget({ section: "gallery", index });
                        setMediaDialogOpen(true);
                      }}
                    >
                      Media
                    </AdminButton>
                    <button
                      type="button"
                      onClick={() => {
                        setContentByLang((prev) => {
                          const items = [...prev[activeLang].gallery.items];
                          items.splice(index, 1);
                          return { ...prev, [activeLang]: { ...prev[activeLang], gallery: { ...prev[activeLang].gallery, items } } };
                        });
                        setIsDirty(true);
                      }}
                      className="rounded-full border border-white/10 px-3 text-xs text-white/60"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#101828] p-6">
            <h2 className="text-lg font-semibold text-white">CTA</h2>
            <div className="mt-4 grid gap-4">
              <AdminInput
                placeholder="Title"
                value={currentContent.cta.title || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], cta: { ...prev[activeLang].cta, title: value } },
                  }));
                  setIsDirty(true);
                }}
              />
              <AdminTextarea
                placeholder="Description"
                value={currentContent.cta.description || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], cta: { ...prev[activeLang].cta, description: value } },
                  }));
                  setIsDirty(true);
                }}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <AdminInput
                  placeholder="Primary label"
                  value={currentContent.cta.primaryLabel || ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setContentByLang((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], cta: { ...prev[activeLang].cta, primaryLabel: value } },
                    }));
                    setIsDirty(true);
                  }}
                />
                <AdminInput
                  placeholder="Primary link"
                  value={currentContent.cta.primaryLink || ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setContentByLang((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], cta: { ...prev[activeLang].cta, primaryLink: value } },
                    }));
                    setIsDirty(true);
                  }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#101828] p-6">
            <h2 className="text-lg font-semibold text-white">FAQ / Nội dung HTML</h2>
            <div className="mt-4">
              <RichTextEditor
                value={currentContent.faqHtml || ""}
                onChange={(value) => {
                  setContentByLang((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], faqHtml: value },
                  }));
                  setIsDirty(true);
                }}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#101828] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Metadata
            </h3>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>Slug: {metaByLang[activeLang].slug}</p>
              <p>Title: {metaByLang[activeLang].title}</p>
              <p>{isDirty ? "Chưa lưu" : "Đã lưu"}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#101828] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
              Preview
            </h3>
            <div className="mt-4 space-y-2 text-xs text-white/70">
              <p>{currentContent.hero.title}</p>
              <p>{currentContent.hero.subtitle}</p>
            </div>
          </div>
        </aside>
      </div>

      <AdminDialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <AdminDialogContent className="max-w-4xl">
          <AdminDialogHeader>
            <AdminDialogTitle>Chọn ảnh từ Media</AdminDialogTitle>
          </AdminDialogHeader>
          <div className="space-y-4">
            <AdminInput
              placeholder="Tìm ảnh..."
              value={mediaQuery}
              onChange={(event) => setMediaQuery(event.target.value)}
            />
            <div className="grid max-h-[460px] gap-3 overflow-y-auto md:grid-cols-3">
              {mediaItems.length ? (
                mediaItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMediaPick(item.url)}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] text-left"
                  >
                    <img
                      src={resolveMediaUrl(item.url)}
                      alt={item.filename}
                      className="h-32 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-3 text-xs text-white/70">
                      <p className="line-clamp-1 font-semibold text-white">{item.filename}</p>
                      <p className="line-clamp-1">{item.mimeType}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-white/60">Không có ảnh.</p>
              )}
            </div>
            <div className="flex justify-end">
              <AdminButton type="button" onClick={() => setMediaDialogOpen(false)}>
                Đóng
              </AdminButton>
            </div>
          </div>
        </AdminDialogContent>
      </AdminDialog>
    </div>
  );
}
