import EnglishLayout from "../english-layout";
import AboutPage from "../[lang]/good-massage-in-da-nang/page";
import type { Metadata } from "next";
import { buildCmsMetadata } from "@/lib/seo/cmsPageMeta";

const CMS_SLUG = "good-massage-in-da-nang";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await buildCmsMetadata(CMS_SLUG, "en");
  return metadata ?? {};
}

export default async function Page() {
  return (
    <EnglishLayout>
      {await AboutPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
