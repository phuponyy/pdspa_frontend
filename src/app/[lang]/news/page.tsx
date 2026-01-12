import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import { isSupportedLang } from "@/lib/i18n";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const isVn = lang === "vn";

  return (
    <div className="space-y-16 pb-16 pt-10">
      <Container>
        <SectionHeading
          eyebrow={isVn ? "Tin tuc" : "News"}
          title={isVn ? "Cap nhat tu Panda Spa" : "Updates from Panda Spa"}
          description={
            isVn
              ? "Chung toi se cap nhat chuong trinh uu dai va bai viet moi tai day."
              : "We will share offers and new articles here."
          }
        />
      </Container>
      <Container className="rounded-3xl border border-dashed border-[var(--line)] bg-white/70 p-8 text-sm text-[var(--ink-muted)]">
        {isVn
          ? "Chua co bai viet moi. Vui long quay lai sau."
          : "No updates yet. Please check back soon."}
      </Container>
    </div>
  );
}
