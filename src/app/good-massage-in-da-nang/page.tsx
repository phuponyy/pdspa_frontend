import EnglishLayout from "../english-layout";
import AboutPage from "../[lang]/good-massage-in-da-nang/page";

export default async function Page() {
  return (
    <EnglishLayout>
      {await AboutPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
