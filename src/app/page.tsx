import type { Metadata } from "next";
import HomePage from "./[lang]/page";
import EnglishLayout from "./english-layout";
import { getHomePage } from "@/lib/api/public";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const homeResponse = await getHomePage("en").catch(() => null);
  const metaTitle = homeResponse?.meta?.metaTitle || SITE_NAME;
  const metaDescription = homeResponse?.meta?.metaDescription || SITE_DESCRIPTION;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: homeResponse?.seo?.canonical,
      languages: homeResponse?.seo?.hreflangs,
    },
  };
}

export default async function Home() {
  return (
    <EnglishLayout>
      {await HomePage({ params: { lang: "en" } })}
    </EnglishLayout>
  );
}
