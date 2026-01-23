import EnglishLayout from "../english-layout";
import ServicesPage from "../[lang]/dich-vu/page";

export default async function Page() {
  return (
    <EnglishLayout>
      {await ServicesPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
