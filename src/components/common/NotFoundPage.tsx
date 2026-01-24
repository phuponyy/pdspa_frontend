import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import I18nProvider from "@/components/common/I18nProvider";
import { HOTLINE, SITE_NAME, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";

type NotFoundCopy = {
  title: string;
  description: string;
  links: {
    services: string;
    price: string;
    news: string;
  };
  backHome: string;
};

const COPY: Record<"vi" | "en", NotFoundCopy> = {
  vi: {
    title: "Đường dẫn không tồn tại",
    description:
      "Có vẻ như liệu trình bạn đang tìm kiếm đã thay đổi hoặc trang này không còn khả dụng. Hãy để chúng tôi dẫn bạn quay lại.",
    links: {
      services: "Dịch vụ Massage",
      price: "Bảng giá",
      news: "Blog làm đẹp",
    },
    backHome: "Về trang chủ",
  },
  en: {
    title: "Page not found",
    description:
      "The page you are looking for has moved or no longer exists. Let us guide you back.",
    links: {
      services: "Signature services",
      price: "Pricing",
      news: "Beauty journal",
    },
    backHome: "Back to home",
  },
};

export default function NotFoundPage({ lang }: { lang: "vi" | "en" }) {
  const copy = COPY[lang];
  const base = lang === "vi" ? "/vi" : "";
  const servicesHref = `${base}/dich-vu`;
  const priceHref = `${base}/price-list`;
  const newsHref = lang === "vi" ? "/vi/tin-tuc" : "/news";
  const homeHref = lang === "vi" ? "/vi" : "/";

  return (
    <I18nProvider lang={lang}>
      <div className="min-h-screen bg-[#0b0b0f] text-white">
        <Header lang={lang} />
        <main className="px-6 py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
            <div className="relative flex items-center justify-center gap-6">
              <div className="absolute inset-0 -z-10 rounded-full border border-orange-500/20 bg-[radial-gradient(circle,rgba(255,106,61,0.2),transparent_70%)] blur-2xl" />
              <div className="flex h-32 w-24 -rotate-6 items-center justify-center rounded-3xl border border-white/10 bg-[#12131a] text-6xl font-semibold text-[#ff6a3d] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                4
              </div>
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-white/20 bg-[#10121a] text-5xl font-semibold text-white shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                0
                <span className="absolute right-6 top-6 h-6 w-6 rounded-full border border-orange-500/30 bg-[#ff6a3d] shadow-[0_10px_20px_rgba(255,106,61,0.35)]" />
              </div>
              <div className="flex h-32 w-24 rotate-6 items-center justify-center rounded-3xl border border-white/10 bg-[#12131a] text-6xl font-semibold text-[#ff6a3d] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                4
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold md:text-3xl">{copy.title}</h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 md:text-base">
                {copy.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
              <Link className="hover:text-white" href={servicesHref}>
                {copy.links.services}
              </Link>
              <Link className="hover:text-white" href={priceHref}>
                {copy.links.price}
              </Link>
              <Link className="hover:text-white" href={newsHref}>
                {copy.links.news}
              </Link>
            </div>
            <Link
              href={homeHref}
              className="inline-flex items-center gap-3 rounded-full bg-[#ff6a3d] px-6 py-3 text-sm font-semibold text-[#1a0d08] shadow-[0_18px_40px_rgba(255,106,61,0.35)] transition hover:brightness-110"
            >
              ← {copy.backHome}
            </Link>
          </div>
        </main>
        <Footer
          lang={lang}
          siteName={SITE_NAME}
          address={SPA_ADDRESS}
          hours={SPA_HOURS}
          hotline={HOTLINE}
        />
      </div>
    </I18nProvider>
  );
}
