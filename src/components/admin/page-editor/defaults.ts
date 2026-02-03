import type {
  HeroState,
  IntroState,
  MetaState,
  RecoveryState,
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

export const defaultSectionOrder = ["intro", "hero", "highlights", "services", "recovery"];

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
