import NotFoundPage from "@/components/common/NotFoundPage";

export default function NotFound({
  params,
}: {
  params?: { lang?: "vi" | "en" };
}) {
  const lang = params?.lang === "vi" ? "vi" : "en";
  return <NotFoundPage lang={lang} />;
}
