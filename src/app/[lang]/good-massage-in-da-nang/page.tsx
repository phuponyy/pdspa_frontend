import type { Metadata } from "next";
import { isSupportedLang } from "@/lib/i18n";
import { buildCmsMetadata, resolveSchemaJson } from "@/lib/seo/cmsPageMeta";
import { getCmsPageBySlug } from "@/lib/api/public";
import GoodMassageClient from "@/components/pages/GoodMassageClient";
import {
  defaultGoodMassageContent,
  normalizeGoodMassageContent,
} from "@/types/goodMassage.types";

const CMS_SLUG = "good-massage-in-da-nang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  if (!isSupportedLang(rawLang)) return {};
  const { metadata } = await buildCmsMetadata(CMS_SLUG, rawLang);
  return metadata ?? {};
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "en";
  const cmsMeta = await buildCmsMetadata(CMS_SLUG, lang);
  const schema = resolveSchemaJson(cmsMeta.schemaJson);
  const data = await getCmsPageBySlug(CMS_SLUG, lang).catch(() => null);
  const content = data?.translation?.content
    ? normalizeGoodMassageContent(data.translation.content)
    : defaultGoodMassageContent;

  return (
    <div className="bg-black">
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ) : null}
      <GoodMassageClient content={content} lang={lang} />
    </div>
  );
}
