import Container from "@/components/common/Container";
import { isSupportedLang } from "@/lib/i18n";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const isVn = lang === "vn";

  return (
    <div className="space-y-16 pb-16 pt-10">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            {isVn ? "Gioi thieu" : "About us"}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
            <span className="text-accent">
              {isVn
                ? "Good Massage in Da Nang"
                : "Good Massage in Da Nang"}
            </span>
          </h1>
          <p className="text-base text-[var(--ink-muted)] md:text-lg">
            {isVn
              ? "Panda Spa la noi ket hop giua tri lieu co the va cham soc tinh than. Moi lieu trinh duoc thiet ke boi ky thuat vien chuyen nghiep voi khong gian yen tinh, huong tinh dau, va cham soc an can."
              : "Panda Spa blends body therapy with mindful care. Each ritual is designed by experienced therapists in a serene space with aroma oils and attentive service."}
          </p>
          <div className="grid gap-4 text-sm text-[var(--ink-muted)] md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="font-semibold text-[var(--ink)]">
                {isVn ? "Ky thuat vien" : "Therapists"}
              </p>
              <p>
                {isVn
                  ? "Dao tao bai ban, tap trung vao su an toan va hieu qua."
                  : "Trained with a focus on safety, pressure balance, and recovery."}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="font-semibold text-[var(--ink)]">
                {isVn ? "Khong gian" : "Atmosphere"}
              </p>
              <p>
                {isVn
                  ? "Thien nhien, am ap, ket hop huong tinh dau va am nhac."
                  : "Warm, calm, and curated with essential oils and soft music."}
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -right-8 top-10 h-24 w-24 rounded-full bg-[rgba(255,182,64,0.3)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-[var(--line)] bg-white shadow-[var(--shadow)]">
            <img
              src="/images/hero-placeholder.svg"
              alt="Panda Spa"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </Container>

      <Container className="grid gap-6 md:grid-cols-3">
        {[
          isVn ? "Ky thuat massage chuan spa" : "Signature massage techniques",
          isVn ? "Tinh dau va thao moc thien nhien" : "Natural oils & herbs",
          isVn ? "Cham soc ca nhan hoa" : "Personalized treatments",
        ].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--ink-muted)]"
          >
            <p className="text-base font-semibold text-[var(--ink)]">{item}</p>
            <p className="mt-2">
              {isVn
                ? "Truc tiep tu doi ngu Panda Spa, dieu chinh theo nhu cau cua ban."
                : "Crafted by Panda Spa specialists and tailored to your needs."}
            </p>
          </div>
        ))}
      </Container>
    </div>
  );
}
