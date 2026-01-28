import type { Metadata } from "next";
import EnglishLayout from "@/app/english-layout";
import PostDetailPage, {
  generateMetadata as generateLangMetadata,
} from "@/app/[lang]/tin-tuc/[slug]/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return generateLangMetadata({
    params: Promise.resolve({ lang: "en", slug }),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <EnglishLayout>
      {await PostDetailPage({
        params: Promise.resolve({ lang: "en", slug }),
      })}
    </EnglishLayout>
  );
}
