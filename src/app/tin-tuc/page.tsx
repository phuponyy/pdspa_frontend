import EnglishLayout from "../english-layout";
import NewsPage from "../[lang]/tin-tuc/page";

export default async function Page() {
  return (
    <EnglishLayout>
      {await NewsPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
