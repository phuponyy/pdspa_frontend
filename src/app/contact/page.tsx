import EnglishLayout from "../english-layout";
import ContactPage from "../[lang]/contact/page";

export default async function Page() {
  return (
    <EnglishLayout>
      {await ContactPage({ params: Promise.resolve({ lang: "en" }) })}
    </EnglishLayout>
  );
}
