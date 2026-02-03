import type { PublicService } from "@/types/api.types";
import type { ServiceCardItem, ServiceCard } from "./types";
import { formatPrice, resolveImageUrl } from "./utils";

export const buildServiceCards = (
  items: ServiceCardItem[],
  services: PublicService[],
  lang: string
): ServiceCard[] => {
  return items
    .filter((item) => item.serviceId)
    .map((item) => {
      const service = services.find((svc) => svc.id === item.serviceId);
      if (!service) return null;
      const prices = service.priceOptions.map((option) => option.price);
      const minPrice = prices.length ? Math.min(...prices) : null;
      return {
        id: service.id,
        title: item.label || service.name,
        imageUrl: resolveImageUrl(item.imageUrl),
        priceNote:
          item.priceNote ||
          (minPrice !== null
            ? `From ${formatPrice(minPrice)} VND`
            : lang === "vi"
              ? "Liên hệ"
              : "Contact us"),
      };
    })
    .filter(Boolean) as ServiceCard[];
};
