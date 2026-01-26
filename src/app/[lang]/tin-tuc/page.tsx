import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import { isSupportedLang } from "@/lib/i18n";
import { getServerTranslator } from "@/lib/i18n/server";
import { getPublicPosts } from "@/lib/api/public";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "en";
  const i18n = await getServerTranslator(lang);
  const t = i18n.t.bind(i18n);
  const postsResponse = await getPublicPosts(lang, 1, 12).catch(() => null);
  const posts = postsResponse?.data?.items ?? [];

  return (
    <div className="space-y-16 pb-16 pt-10">
      <Container>
        <SectionHeading
          eyebrow={t("newsPage.eyebrow")}
          title={t("newsPage.title")}
          description={t("newsPage.description")}
        />
      </Container>
      <Container>
        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const translation = post.translation;
              const translationThumbnail = translation?.thumbnailUrl || null;
              const thumbnail = translationThumbnail
                ? translationThumbnail.startsWith("/")
                  ? `${API_BASE_URL}${translationThumbnail}`
                  : translationThumbnail
                : null;
              const href =
                lang === "vi"
                  ? `/vi/tin-tuc/${translation?.slug || post.id}`
                  : `/tin-tuc/${translation?.slug || post.id}`;
              return (
                <Link
                  key={post.id}
                  href={href}
                  className="group rounded-3xl border border-[var(--line)] bg-white/70 p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
                >
                  {thumbnail ? (
                    <div className="-mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl">
                      <img
                        src={thumbnail}
                        alt={translation?.title || "Post"}
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--ink)]">
                    {translation?.title || `Post #${post.id}`}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    {translation?.excerpt || t("newsPage.description")}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    Read more
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--line)] bg-white/70 p-8 text-sm text-[var(--ink-muted)]">
            {t("newsPage.emptyState")}
          </div>
        )}
      </Container>
    </div>
  );
}
