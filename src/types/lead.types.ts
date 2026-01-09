export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED";

export type LeadItem = {
  serviceId: number;
  priceOptionId?: number;
  qty: number;
  title?: string;
  price?: number;
};

export type Lead = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
  langCode?: string;
  status: LeadStatus;
  items?: LeadItem[];
  createdAt?: string;
  updatedAt?: string;
};
