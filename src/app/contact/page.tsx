import EnglishLayout from "../english-layout";
import ContactPage from "../[lang]/contact/page";
import type { Metadata } from "next";
import { buildCmsMetadata } from "@/lib/seo/cmsPageMeta";

const CMS_SLUG = "contact";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await buildCmsMetadata(CMS_SLUG, "en");
  return metadata ?? {};
}

export default async function Page() {
  return (
    <EnglishLayout>
      {await ContactPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
