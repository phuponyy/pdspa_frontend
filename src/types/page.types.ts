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
  type?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  imageUrl?: string;
  items?: HomeSectionItem[];
};

export type PriceOption = {
  id?: number;
  label?: string;
  price?: number;
};
