import EnglishLayout from "../english-layout";
import ServicesPage from "../[lang]/dich-vu/page";
import type { Metadata } from "next";
import { buildCmsMetadata } from "@/lib/seo/cmsPageMeta";

const CMS_SLUG = "dich-vu";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await buildCmsMetadata(CMS_SLUG, "en");
  return metadata ?? {};
}

export default async function Page() {
  return (
    <EnglishLayout>
      {await ServicesPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
