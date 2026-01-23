import EnglishLayout from "../english-layout";
import PricePage from "../[lang]/price-list/page";

export default async function Page() {
  return (
    <EnglishLayout>
      {await PricePage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
