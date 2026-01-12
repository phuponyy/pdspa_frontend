export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "DONE";

export type LeadItem = {
  serviceId: number;
  priceOptionId: number;
  qty: number;
  service?: {
    id: number;
    key: string;
  };
  priceOption?: {
    id: number;
    code: string;
    price: number;
  };
};

export type Lead = {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
  langCode?: string;
  status: LeadStatus;
  items?: LeadItem[];
  createdAt?: string;
};
