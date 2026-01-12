export type HomeSeo = {
  canonical?: string;
  hreflangs?: Record<string, string>;
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

export type HomeSection = {
  id?: number | string;
  key?: string;
  type?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  items?: HomeSectionItem[];
  body?: Record<string, unknown> | null;
};

export type PriceOption = {
  id?: number;
  label?: string;
  price?: number;
};
