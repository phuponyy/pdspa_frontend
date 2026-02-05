import Container from "@/components/common/Container";
import type { HomeSectionItem } from "@/types/page.types";
import { resolveMediaUrl } from "@/lib/media";

type MentionItem = HomeSectionItem & {
  name?: string;
  title?: string;
  imageUrl?: string;
  link?: string;
};

type HomeMentionsSectionProps = {
  heading: string;
  description?: string;
  items?: HomeSectionItem[];
};

const normalizeItem = (item: MentionItem) => {
  const imageUrl = item.imageUrl || "";
  const name = item.name || item.title || item.caption || "";
  const link = item.link || "";
  return { imageUrl, name, link };
};

export default function HomeMentionsSection({
  heading,
  description,
  items = [],
}: HomeMentionsSectionProps) {
  const normalized = (items as MentionItem[])
    .map((item) => normalizeItem(item))
    .filter((item) => item.imageUrl);

  if (!normalized.length) {
    return null;
  }

  return (
    <section className="bg-[#050505] py-16">
      <Container className="space-y-8 text-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
            Press Mentions
          </p>
          <h2 className="text-2xl font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)] md:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="text-sm leading-relaxed text-white/70 md:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {normalized.map((item, index) => {
            const content = (
              <div className="group flex h-28 items-center justify-center rounded-2xl border border-white/10 bg-[#0b0b0b] px-6 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                <img
                  src={resolveMediaUrl(item.imageUrl)}
                  alt={item.name || `Mention ${index + 1}`}
                  className="h-14 w-auto max-w-full object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  loading="lazy"
                />
              </div>
            );

            if (item.link) {
              return (
                <a
                  key={`mention-${index}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform duration-300 hover:-translate-y-1"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={`mention-${index}`}
                className="transition-transform duration-300 hover:-translate-y-1"
              >
                {content}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
