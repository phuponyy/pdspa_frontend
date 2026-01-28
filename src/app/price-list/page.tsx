import EnglishLayout from "../english-layout";
import PricePage from "../[lang]/price-list/page";
import type { Metadata } from "next";
import { buildCmsMetadata } from "@/lib/seo/cmsPageMeta";

const CMS_SLUG = "price-list";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await buildCmsMetadata(CMS_SLUG, "en");
  return metadata ?? {};
}

export default async function Page() {
  return (
    <EnglishLayout>
      {await PricePage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
