import type {
  HeroState,
  IntroState,
  MetaState,
  RecoveryState,
  BlogState,
  ReviewsState,
  GalleryState,
  MentionsState,
  ServicesState,
} from "./types";

export const languages = ["vi", "en"] as const;

export const defaultMetaByLang: Record<string, MetaState> = {
  vi: {
    metaTitle: "",
    metaDescription: "",
    canonical: "",
    robots: "index,follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    schemaJson: "",
  },
  en: {
    metaTitle: "",
    metaDescription: "",
    canonical: "",
    robots: "index,follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    schemaJson: "",
  },
};

export const defaultHeroByLang: Record<string, HeroState> = {
  vi: { heading: "", subheading: "", slides: [] },
  en: { heading: "", subheading: "", slides: [] },
};

export const defaultIntroByLang: Record<string, IntroState> = {
  vi: {
    heading: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    providerName: "Tripadvisor",
    listingName: "Panda Spa",
    rating: "5",
    reviews: "",
    rankText: "",
    buttonLabel: "SPA DA NANG",
    buttonLink: "",
  },
  en: {
    heading: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    providerName: "Tripadvisor",
    listingName: "Panda Spa",
    rating: "5",
    reviews: "",
    rankText: "",
    buttonLabel: "SPA DA NANG",
    buttonLink: "",
  },
};

export const defaultRecoveryByLang: Record<string, RecoveryState> = {
  vi: {
    heading: "Recover your energy through relaxation",
    description: "",
    items: [
      { title: "Deep Massage Therapy", description: "", imageUrl: "" },
      { title: "Shuttle Service Spa", description: "", imageUrl: "" },
      { title: "Dedicated, Professional Service", description: "", imageUrl: "" },
    ],
  },
  en: {
    heading: "Recover your energy through relaxation",
    description: "",
    items: [
      { title: "Deep Massage Therapy", description: "", imageUrl: "" },
      { title: "Shuttle Service Spa", description: "", imageUrl: "" },
      { title: "Dedicated, Professional Service", description: "", imageUrl: "" },
    ],
  },
};

export const defaultHighlightsByLang: Record<string, RecoveryState> = {
  vi: {
    heading: "Recover your energy through relaxation",
    description: "",
    items: [
      { title: "Deep Massage Therapy", description: "", imageUrl: "" },
      { title: "Shuttle Service Spa", description: "", imageUrl: "" },
      { title: "Dedicated, Professional Service", description: "", imageUrl: "" },
    ],
  },
  en: {
    heading: "Recover your energy through relaxation",
    description: "",
    items: [
      { title: "Deep Massage Therapy", description: "", imageUrl: "" },
      { title: "Shuttle Service Spa", description: "", imageUrl: "" },
      { title: "Dedicated, Professional Service", description: "", imageUrl: "" },
    ],
  },
};

export const defaultServicesByLang: Record<string, ServicesState> = {
  vi: {
    heading: "Services massage at Panda Spa",
    description: "",
    items: [],
  },
  en: {
    heading: "Services massage at Panda Spa",
    description: "",
    items: [],
  },
};

export const defaultBlogByLang: Record<string, BlogState> = {
  vi: {
    heading: "Massage Guide",
    description: "",
    featuredSlug: "",
  },
  en: {
    heading: "Massage Guide",
    description: "",
    featuredSlug: "",
  },
};

export const defaultReviewsByLang: Record<string, ReviewsState> = {
  vi: {
    heading: "Reviews of the massage & spa Da Nang at Panda Spa",
    description: "",
    items: [
      {
        name: "Raj Patel",
        contributions: "4 contributions",
        rating: 5,
        review:
          "After a long day of walking, I needed a full body spa near me. Panda Spa saved my legs!",
        visit: "Visit 2025",
        tag: "Traveled",
        avatarUrl: "",
      },
      {
        name: "Lena Müller",
        contributions: "4 contributions",
        rating: 5,
        review:
          "I was walking around the city and Googled massage near me. Great service without a reservation.",
        visit: "Visit 2025",
        tag: "Traveled",
        avatarUrl: "",
      },
      {
        name: "David Kim",
        contributions: "4 contributions",
        rating: 5,
        review:
          "Clean place, friendly staff, and calming ambience. We will be back for another treatment.",
        visit: "Visit 2025",
        tag: "Traveled",
        avatarUrl: "",
      },
    ],
  },
  en: {
    heading: "Reviews of the massage & spa Da Nang at Panda Spa",
    description: "",
    items: [
      {
        name: "Raj Patel",
        contributions: "4 contributions",
        rating: 5,
        review:
          "After a long day of walking, I needed a full body spa near me. Panda Spa saved my legs!",
        visit: "Visit 2025",
        tag: "Traveled",
        avatarUrl: "",
      },
      {
        name: "Lena Müller",
        contributions: "4 contributions",
        rating: 5,
        review:
          "I was walking around the city and Googled massage near me. Great service without a reservation.",
        visit: "Visit 2025",
        tag: "Traveled",
        avatarUrl: "",
      },
      {
        name: "David Kim",
        contributions: "4 contributions",
        rating: 5,
        review:
          "Clean place, friendly staff, and calming ambience. We will be back for another treatment.",
        visit: "Visit 2025",
        tag: "Traveled",
        avatarUrl: "",
      },
    ],
  },
};

export const defaultGalleryByLang: Record<string, GalleryState> = {
  vi: {
    heading: "Panda Spa Photo Gallery",
    description: "",
    items: [],
  },
  en: {
    heading: "Panda Spa Photo Gallery",
    description: "",
    items: [],
  },
};

export const defaultMentionsByLang: Record<string, MentionsState> = {
  vi: {
    heading: "Press Mentions",
    description: "",
    items: [],
  },
  en: {
    heading: "Press Mentions",
    description: "",
    items: [],
  },
};

export const defaultSectionOrder = [
  "intro",
  "hero",
  "highlights",
  "services",
  "blog",
  "recovery",
  "gallery",
  "reviews",
  "mentions",
];

export const defaultSchemaTemplateByLang: Record<string, string> = {
  vi: "WebPage",
  en: "WebPage",
};

export const defaultSchemaOrgByLang: Record<string, string> = {
  vi: "Panda Spa",
  en: "Panda Spa",
};

export const defaultSchemaFaqByLang: Record<string, { question: string; answer: string }[]> = {
  vi: [{ question: "", answer: "" }],
  en: [{ question: "", answer: "" }],
};

export const storageKey = "home-editor-draft";
