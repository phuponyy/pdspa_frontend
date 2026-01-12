import Container from "@/components/common/Container";
import ContactForm from "@/components/home/ContactForm";
import SectionHeading from "@/components/common/SectionHeading";
import { getServices } from "@/lib/api/public";
import { HOTLINE, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";
import { getDictionary, isSupportedLang } from "@/lib/i18n";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const dict = getDictionary(lang);
  const servicesResponse = await getServices(lang).catch(() => null);
  const services = servicesResponse?.data ?? [];

  return (
    <div className="space-y-16 pb-16 pt-10">
      <Container>
        <SectionHeading
          eyebrow={lang === "vn" ? "Lien he" : "Contact"}
          title={lang === "vn" ? "Ket noi voi Panda Spa" : "Reach Panda Spa"}
          description={
            lang === "vn"
              ? "De lai thong tin de nhan tu van va dat lich nhanh."
              : "Leave your details for quick consultation and booking."
          }
        />
      </Container>
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-6 text-sm text-[var(--ink-muted)]">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              {lang === "vn" ? "Thong tin" : "Details"}
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--ink)]">
              Panda Spa Da Nang
            </p>
            <p className="mt-2">{SPA_ADDRESS}</p>
            <p>Working Time: {SPA_HOURS}</p>
            <p className="mt-4 text-base font-semibold text-[var(--ink)]">
              {HOTLINE}
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              {lang === "vn" ? "Huong dan" : "How to reach"}
            </p>
            <p className="mt-2">
              {lang === "vn"
                ? "Ngay trung tam thanh pho Da Nang, gan cau Rong va song Han."
                : "Located in the heart of Da Nang, near the Han River and Dragon Bridge."}
            </p>
          </div>
        </div>
        <ContactForm lang={lang} services={services} labels={dict.form} />
      </Container>
    </div>
  );
}
