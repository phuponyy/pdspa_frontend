import Link from "next/link";
import Container from "./Container";
import { HOTLINE, SITE_NAME, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";

export default function Footer({
  hotline,
  siteName = "Panda Spa",
  lang = "vn",
}: {
  hotline?: string;
  siteName?: string;
  lang?: string;
}) {
  return (
    <footer className="mt-20 border-t border-[rgba(255,255,255,0.4)] bg-[var(--accent-deep)] text-white">
      <Container className="grid gap-10 py-12 text-sm md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white shadow-[var(--shadow-soft)]">
              PS
            </div>
            <div>
              <p className="text-base font-semibold text-white">
                {siteName || SITE_NAME}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.7)]">
                Wellness sanctuary
              </p>
            </div>
          </div>
          <p className="text-[rgba(255,255,255,0.75)]">
            A calming spa retreat in the heart of Da Nang, blending aroma, massage,
            and restorative rituals.
          </p>
          <p className="text-[rgba(255,255,255,0.75)]">{SPA_ADDRESS}</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
            Menu
          </p>
          <div className="flex flex-col gap-2">
            <Link href={`/${lang}`} className="hover:text-[var(--accent-bright)]">
              Trang chu
            </Link>
            <Link
              href={`/${lang}/good-massage-in-da-nang`}
              className="hover:text-[var(--accent-bright)]"
            >
              Gioi thieu
            </Link>
            <Link
              href={`/${lang}/dich-vu`}
              className="hover:text-[var(--accent-bright)]"
            >
              Dich vu
            </Link>
            <Link
              href={`/${lang}/price-list`}
              className="hover:text-[var(--accent-bright)]"
            >
              Bang gia
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="hover:text-[var(--accent-bright)]"
            >
              Lien he
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
            Hotline
          </p>
          <p className="text-2xl font-semibold">{hotline || HOTLINE}</p>
          <p className="text-[rgba(255,255,255,0.75)]">
            Working Time: {SPA_HOURS}
          </p>
        </div>
      </Container>
    </footer>
  );
}
