export type GoodMassageStat = {
  label: string;
  value: string;
};

export type GoodMassageHighlight = {
  title: string;
  description?: string;
  imageUrl?: string;
};

export type GoodMassageGalleryItem = {
  imageUrl: string;
  caption?: string;
};

export type GoodMassageContent = {
  hero: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    heroImage?: string;
  };
  intro: {
    heading?: string;
    descriptionHtml?: string;
  };
  stats: GoodMassageStat[];
  highlights: GoodMassageHighlight[];
  gallery: {
    title?: string;
    items: GoodMassageGalleryItem[];
  };
  cta: {
    title?: string;
    description?: string;
    primaryLabel?: string;
    primaryLink?: string;
  };
  faqHtml?: string;
};

export const defaultGoodMassageContent: GoodMassageContent = {
  hero: {
    eyebrow: "Panda Spa",
    title: "Good Massage In Da Nang",
    subtitle: "Discover signature therapies tailored to your recovery.",
    heroImage: "",
  },
  intro: {
    heading: "Why Panda Spa?",
    descriptionHtml: "",
  },
  stats: [
    { label: "Years of Experience", value: "15+" },
    { label: "Happy Guests", value: "20K+" },
    { label: "Therapy Options", value: "30+" },
  ],
  highlights: [],
  gallery: {
    title: "Gallery",
    items: [],
  },
  cta: {
    title: "Book your recovery session",
    description: "We are ready to craft the right massage for you.",
    primaryLabel: "Book now",
    primaryLink: "/contact",
  },
  faqHtml: "",
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const normalizeGoodMassageContent = (
  raw: unknown
): GoodMassageContent => {
  const obj = asRecord(raw);
  const hero = asRecord(obj.hero);
  const intro = asRecord(obj.intro);
  const gallery = asRecord(obj.gallery);
  const cta = asRecord(obj.cta);

  const stats = Array.isArray(obj.stats)
    ? (obj.stats as Record<string, unknown>[]).map((item) => ({
        label: String(item?.label ?? ""),
        value: String(item?.value ?? ""),
      }))
    : [];

  const highlights = Array.isArray(obj.highlights)
    ? (obj.highlights as Record<string, unknown>[]).map((item) => ({
        title: String(item?.title ?? ""),
        description:
          item?.description !== undefined ? String(item?.description ?? "") : undefined,
        imageUrl:
          item?.imageUrl !== undefined ? String(item?.imageUrl ?? "") : undefined,
      }))
    : [];

  const galleryItems = Array.isArray(gallery.items)
    ? (gallery.items as Record<string, unknown>[]).map((item) => ({
        imageUrl: String(item?.imageUrl ?? ""),
        caption:
          item?.caption !== undefined ? String(item?.caption ?? "") : undefined,
      }))
    : [];

  return {
    hero: {
      eyebrow:
        hero.eyebrow !== undefined
          ? String(hero.eyebrow ?? "")
          : defaultGoodMassageContent.hero.eyebrow,
      title: hero.title ? String(hero.title) : defaultGoodMassageContent.hero.title,
      subtitle:
        hero.subtitle !== undefined ? String(hero.subtitle ?? "") : undefined,
      heroImage:
        hero.heroImage !== undefined ? String(hero.heroImage ?? "") : undefined,
    },
    intro: {
      heading:
        intro.heading !== undefined
          ? String(intro.heading ?? "")
          : defaultGoodMassageContent.intro.heading,
      descriptionHtml:
        intro.descriptionHtml !== undefined
          ? String(intro.descriptionHtml ?? "")
          : undefined,
    },
    stats: stats.length ? stats : defaultGoodMassageContent.stats,
    highlights,
    gallery: {
      title:
        gallery.title !== undefined
          ? String(gallery.title ?? "")
          : defaultGoodMassageContent.gallery.title,
      items: galleryItems,
    },
    cta: {
      title: cta.title !== undefined ? String(cta.title ?? "") : undefined,
      description:
        cta.description !== undefined ? String(cta.description ?? "") : undefined,
      primaryLabel:
        cta.primaryLabel !== undefined
          ? String(cta.primaryLabel ?? "")
          : defaultGoodMassageContent.cta.primaryLabel,
      primaryLink:
        cta.primaryLink !== undefined
          ? String(cta.primaryLink ?? "")
          : defaultGoodMassageContent.cta.primaryLink,
    },
    faqHtml: obj.faqHtml !== undefined ? String(obj.faqHtml ?? "") : undefined,
  };
};
