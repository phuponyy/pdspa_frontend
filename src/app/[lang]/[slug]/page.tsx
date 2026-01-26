import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsPageBySlug } from "@/lib/api/public";
import { isSupportedLang } from "@/lib/i18n";
import { sanitizeHtml } from "@/lib/sanitize";
import Container from "@/components/common/Container";

type PageParams = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) return {};

  const data = await getCmsPageBySlug(slug, rawLang).catch(() => null);
  const translation = data?.translation;
  if (!translation) return {};

  return {
    title: translation.seoTitle || translation.title,
    description: translation.seoDescription || undefined,
    alternates: {
      canonical: data?.seo?.canonical,
      languages: data?.seo?.hreflangs,
    },
  };
}

export default async function CmsPage({
  params,
}: {
  params: PageParams;
}) {
  const { lang: rawLang, slug } = await params;
  if (!isSupportedLang(rawLang)) {
    notFound();
  }

  const data = await getCmsPageBySlug(slug, rawLang).catch(() => null);
  const translation = data?.translation;
  if (!translation) {
    notFound();
  }

  const rawContent = typeof translation.content === "string" ? translation.content : "";
  const content = sanitizeHtml(rawContent);

  return (
    <section className="py-16">
      <Container className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Page
          </p>
          <h1 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
            {translation.title}
          </h1>
        </div>
        <div
          className="cms-content space-y-4 text-sm leading-7 text-[var(--ink-muted)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </section>
  );
}
