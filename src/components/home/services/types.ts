import type { PublicService } from "@/types/api.types";

export type ServiceCardItem = {
  serviceId?: number;
  imageUrl?: string;
  label?: string;
  priceNote?: string;
};

export type HomeServicesProps = {
  heading: string;
  description?: string;
  items?: ServiceCardItem[];
  services: PublicService[];
  lang: string;
};

export type ServiceCard = {
  id: number;
  title: string;
  imageUrl?: string;
  priceNote: string;
};
