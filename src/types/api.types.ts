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

export type PublicConfig = {
  siteName?: string;
  hotline?: string;
};

export type PublicConfigResponse = ApiSuccess<PublicConfig>;

export type HomePageResponse = {
  page?: Record<string, unknown>;
  meta?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  seo?: HomeSeo;
  sections?: HomeSection[];
};

export type HomeMetaResponse = ApiSuccess<{
  metaTitle?: string;
  metaDescription?: string;
}>;

export type LeadCreateRequest = {
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
  langCode: string;
  items: LeadItem[];
};

export type LeadCreateResponse = ApiSuccess<{ id?: string }>;

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  accessToken: string;
};

export type LeadListResponse = ApiSuccess<{
  items: Lead[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
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
  subheading: string;
  imageUrl: string;
};

export type HomeStatusUpdateRequest = {
  status: "DRAFT" | "PUBLISHED";
};
