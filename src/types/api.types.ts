import type { HomeSection, HomeSeo } from "./page.types";
import type { Lead, LeadItem, LeadStatus } from "./lead.types";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    path?: string;
    timestamp?: string;
  };
};

export type HomePageResponse = {
  page?: Record<string, unknown>;
  meta?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  seo?: HomeSeo;
  sections?: HomeSection[];
};

export type LeadCreateRequest = {
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
  langCode: string;
  items: LeadItem[];
};

export type LeadCreateResponse = ApiSuccess<{ leadId: number }>;

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = ApiSuccess<{
  accessToken: string;
}>;

export type PublicService = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  priceOptions: {
    id: number;
    code: string;
    price: number;
  }[];
};

export type PublicServicesResponse = ApiSuccess<PublicService[]>;

export type LeadListResponse = ApiSuccess<{
  items: Lead[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}>;

export type LeadDetailResponse = ApiSuccess<Lead>;

export type LeadStatusUpdateRequest = {
  status: LeadStatus;
};

export type HomeMetaUpdateRequest = {
  metaTitle: string;
  metaDescription: string;
};

export type HomeHeroUpdateRequest = {
  heading: string;
  subheading?: string;
  images?: string[];
};

export type HomeStatusUpdateRequest = {
  status: "DRAFT" | "PUBLISHED";
};
