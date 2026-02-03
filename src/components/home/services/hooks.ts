import type { HomeServicesProps } from "./types";
import { buildServiceCards } from "./buildServiceCards";

export const useServiceCards = ({ items = [], services, lang }: HomeServicesProps) => {
  return buildServiceCards(items, services, lang);
};
