import EnglishLayout from "@/app/english-layout";
import PostDetailPage from "@/app/[lang]/tin-tuc/[slug]/page";

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
