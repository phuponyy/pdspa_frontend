import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import { getServices } from "@/lib/api/public";
import { isSupportedLang } from "@/lib/i18n";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = isSupportedLang(rawLang) ? rawLang : "vn";
  const isVn = lang === "vn";
  const servicesResponse = await getServices(lang).catch(() => null);
  const services = servicesResponse?.data ?? [];

  return (
    <div className="space-y-16 pb-16 pt-10">
      <Container>
        <SectionHeading
          eyebrow={isVn ? "Dich vu" : "Services"}
          title={isVn ? "Tat ca dich vu Panda Spa" : "Panda Spa services"}
          description={
            isVn
              ? "Lua chon tu nhung lieu trinh cham soc co the, da va hoi phuc nang luong."
              : "Choose from curated body, skin, and restoration rituals."
          }
        />
      </Container>

      <Container className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.length ? (
          services.map((service) => (
            <div
              key={service.id}
              className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                {service.key}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                {service.description || (isVn ? "Lieu trinh phu hop moi nhu cau." : "Tailored for your wellness goals.")}
              </p>
              {service.priceOptions.length ? (
                <div className="mt-4 space-y-1 text-sm text-[var(--ink-muted)]">
                  {service.priceOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <span>{option.code}</span>
                      <span className="font-semibold text-[var(--ink)]">
                        {option.price.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--line)] bg-white/70 p-8 text-sm text-[var(--ink-muted)]">
            {isVn
              ? "Danh sach dich vu dang cap nhat. Vui long lien he truc tiep."
              : "Services are being updated. Please contact us directly."}
          </div>
        )}
      </Container>
    </div>
  );
}
