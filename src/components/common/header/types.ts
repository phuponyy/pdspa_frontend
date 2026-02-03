export type NavItem = { label: string; href: string };

export type TopBarConfig = {
  address?: string;
  hours?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
};

export type BookingServiceRow = {
  id: string;
  serviceId?: number;
  serviceLabel: string;
  optionId?: number;
  duration?: string;
  guests: number;
};
