import EnglishLayout from "../english-layout";
import NewsPage from "../[lang]/tin-tuc/page";
import type { Metadata } from "next";
import { buildCmsMetadata } from "@/lib/seo/cmsPageMeta";

const CMS_SLUG = "tin-tuc";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await buildCmsMetadata(CMS_SLUG, "en");
  return metadata ?? {};
}

export default async function Page() {
  return (
    <EnglishLayout>
      {await NewsPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
