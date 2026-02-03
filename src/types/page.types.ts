export type HomeSeo = {
  canonical?: string;
  hreflangs?: Record<string, string>;
  title?: string | null;
  description?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  schemaJson?: Record<string, unknown> | null;
};

export type HomeSectionItem = {
  id?: number | string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  priceNote?: string;
  serviceId?: number;
  priceOptions?: PriceOption[];
};

export type HeroSlide = {
  imageUrl: string;
  heading?: string;
  subheading?: string;
  primaryCta?: string;
  primaryLink?: string;
  secondaryCta?: string;
  secondaryLink?: string;
};

export type HomeSection = {
  id?: number | string;
  key?: string;
  type?: string;
  order?: number;
  heading?: string;
  subheading?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  slides?: HeroSlide[];
  items?: HomeSectionItem[];
  body?: Record<string, unknown> | null;
};

export type PriceOption = {
  id?: number;
  label?: string;
  price?: number;
};
