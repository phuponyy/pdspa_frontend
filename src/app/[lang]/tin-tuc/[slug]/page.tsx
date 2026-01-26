import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPostBySlug } from "@/lib/api/public";
import { isSupportedLang } from "@/lib/i18n";
import { sanitizeHtml } from "@/lib/sanitize";
import Container from "@/components/common/Container";
import { API_BASE_URL } from "@/lib/constants";

type PageParams = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) return {};
  const data = await getPublicPostBySlug(slug, rawLang).catch(() => null);
  const translation = data?.data?.translation;
  if (!translation) return {};
  return {
    title: translation.seoTitle || translation.title,
    description: translation.seoDescription || translation.excerpt || undefined,
    alternates: {
      canonical: data?.data?.seo?.canonical,
      languages: data?.data?.seo?.hreflangs,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) {
    notFound();
  }
  const data = await getPublicPostBySlug(slug, rawLang).catch(() => null);
  const translation = data?.data?.translation;
  const post = data?.data?.post;
  const thumbnail = translation?.thumbnailUrl
    ? translation.thumbnailUrl.startsWith("/")
      ? `${API_BASE_URL}${translation.thumbnailUrl}`
      : translation.thumbnailUrl
    : null;
  if (!translation || !post) {
    notFound();
  }

  const rawContent = typeof translation.content === "string" ? translation.content : "";
  const content = sanitizeHtml(rawContent);

  return (
    <section className="py-16">
      <Container className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString()
              : "Draft"}
          </p>
          <h1 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
            {translation.title}
          </h1>
          {translation.excerpt ? (
            <p className="text-sm text-[var(--ink-muted)]">
              {translation.excerpt}
            </p>
          ) : null}
        </div>
        {thumbnail ? (
          <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/70">
            <img src={thumbnail} alt={translation.title} className="h-[360px] w-full object-cover" />
          </div>
        ) : null}
        <div
          className="cms-content space-y-4 text-sm leading-7 text-[var(--ink-muted)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </section>
  );
}
