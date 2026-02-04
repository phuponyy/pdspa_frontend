import type { HeroSlide } from "@/types/page.types";

export type MetaState = {
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  schemaJson: string;
};

export type HeroState = {
  heading: string;
  subheading: string;
  slides: HeroSlide[];
};

export type IntroState = {
  heading: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  providerName: string;
  listingName: string;
  rating: string;
  reviews: string;
  rankText: string;
  buttonLabel: string;
  buttonLink: string;
};

export type RecoveryItem = {
  title: string;
  description: string;
  imageUrl: string;
};

export type RecoveryState = {
  heading: string;
  description: string;
  items: RecoveryItem[];
};

export type ReviewItem = {
  name: string;
  contributions?: string;
  rating?: number;
  review?: string;
  visit?: string;
  tag?: string;
  avatarUrl?: string;
};

export type ReviewsState = {
  heading: string;
  description: string;
  items: ReviewItem[];
};

export type GalleryItem = {
  imageUrl: string;
  caption?: string;
};

export type GalleryState = {
  heading: string;
  description: string;
  items: GalleryItem[];
};

export type ServicesItem = {
  serviceId?: number;
  imageUrl?: string;
  label?: string;
  priceNote?: string;
};

export type ServicesState = {
  heading: string;
  description: string;
  items: ServicesItem[];
};

export type PageEditorMediaTarget = {
  section: "highlights" | "recovery" | "services" | "reviews" | "gallery";
  index: number;
};

export type BlogState = {
  heading: string;
  description: string;
  featuredSlug: string;
};
