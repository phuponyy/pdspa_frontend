import { useMemo, useState } from "react";
import { getCmsPosts, getHomeBlog, updateHomeBlog } from "@/lib/api/admin";
import { useAdminQuery } from "@/lib/api/adminHooks";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type { BlogState } from "@/components/admin/page-editor/types";
import type { CmsPost } from "@/types/api.types";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

type BlogSectionProps = {
  activeLang: "vi" | "en";
  currentBlog: BlogState;
  setBlogByLang: Dispatch<SetStateAction<Record<string, BlogState>>>;
  setIsDirty: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

type BlogOption = {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
};

const getTranslation = (post: CmsPost, lang: "vi" | "en") =>
  post.translations.find((t) => t.language?.code === lang);

export default function BlogSection({
  activeLang,
  currentBlog,
  setBlogByLang,
  setIsDirty,
  notify,
  handleError,
}: BlogSectionProps) {
  const [search, setSearch] = useState("");

  const postsQuery = useAdminQuery({
    queryKey: ["admin-blog-posts", activeLang],
    queryFn: () => getCmsPosts(undefined, 1, 80),
    staleTime: 60_000,
  });

  const options = useMemo(() => {
    const items = postsQuery.data?.data?.items ?? [];
    const result: BlogOption[] = items
      .filter((post) => post.status === "PUBLISHED")
      .map((post) => {
        const translation = getTranslation(post, activeLang);
        if (!translation) return null;
        return {
          id: post.id,
          title: translation.seoTitle || translation.title,
          slug: translation.slug,
          thumbnailUrl: translation.thumbnailUrl ?? null,
        };
      })
      .filter(Boolean) as BlogOption[];

    if (!search.trim()) return result;
    const query = search.trim().toLowerCase();
    return result.filter((item) => item.title.toLowerCase().includes(query));
  }, [postsQuery.data, activeLang, search]);

  const selected =
    currentBlog.featuredSlug &&
    options.find((item) => item.slug === currentBlog.featuredSlug);

  return (
    <section
      id="blog"
      className="rounded-[28px] border border-white/10 bg-[#0b1220] p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 4h12v16H6z" />
              <path d="M9 8h6" />
              <path d="M9 12h6" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Blog Section
            </p>
            <p className="text-sm text-white/60">
              Hiển thị 5 bài viết, bài đầu tiên có thể ưu tiên theo ngôn ngữ.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <AdminInput
          label="Heading"
          placeholder="Tiêu đề blog..."
          value={currentBlog.heading}
          onChange={(event) => {
            setIsDirty(true);
            setBlogByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <AdminTextarea
          label="Description"
          placeholder="Mô tả ngắn cho blog section..."
          value={currentBlog.description}
          onChange={(event) => {
            setIsDirty(true);
            setBlogByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], description: event.target.value },
            }));
          }}
        />

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Featured post
              </p>
              <p className="text-sm text-white/60">
                Chọn bài viết ưu tiên hiển thị đầu tiên (theo ngôn ngữ).
              </p>
            </div>
            <AdminInput
              value={search}
              placeholder="Tìm kiếm bài viết..."
              onChange={(event) => setSearch(event.target.value)}
              className="md:w-64"
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <select
              value={currentBlog.featuredSlug || ""}
              onChange={(event) => {
                setIsDirty(true);
                setBlogByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    featuredSlug: event.target.value,
                  },
                }));
              }}
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white/80"
            >
              <option value="">Tự động (mới nhất)</option>
              {options.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
            {selected ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-white/70">
                {selected.thumbnailUrl ? (
                  <img
                    src={selected.thumbnailUrl}
                    alt={selected.title}
                    className="h-10 w-14 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-14 rounded-lg bg-white/5" />
                )}
                <span className="line-clamp-2">{selected.title}</span>
              </div>
            ) : null}
          </div>
        </div>

        <AdminButton
          onClick={async () => {
            try {
              await updateHomeBlog(undefined, activeLang, {
                heading: currentBlog.heading,
                description: currentBlog.description,
                featuredSlug: currentBlog.featuredSlug || "",
              });
              const fresh = await getHomeBlog(undefined, activeLang);
              if (fresh) {
                setBlogByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    heading: fresh.heading ?? "",
                    description: fresh.description ?? "",
                    featuredSlug: fresh.featuredSlug ?? "",
                  },
                }));
              }
              notify("Blog section updated.", "success");
              setIsDirty(false);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(storageKey);
              }
            } catch (err) {
              handleError(err);
            }
          }}
        >
          Save blog
        </AdminButton>
      </div>
    </section>
  );
}
