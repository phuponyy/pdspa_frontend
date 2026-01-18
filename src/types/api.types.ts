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

export type SiteConfigResponse = ApiSuccess<Record<string, string>>;

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

export type HomeMetaResponse = {
  metaTitle: string;
  metaDescription: string;
};

export type HomeHeroUpdateRequest = {
  heading: string;
  subheading?: string;
  images?: string[];
  slides?: {
    imageUrl: string;
    heading?: string;
    subheading?: string;
    primaryCta?: string;
    primaryLink?: string;
    secondaryCta?: string;
    secondaryLink?: string;
  }[];
};

export type HomeHeroResponse = {
  heading: string;
  subheading: string;
  imageUrl?: string;
  images?: string[];
  slides?: {
    imageUrl: string;
    heading?: string;
    subheading?: string;
    primaryCta?: string;
    primaryLink?: string;
    secondaryCta?: string;
    secondaryLink?: string;
  }[];
  settings?: Record<string, unknown> | null;
};

export type HeroImageUploadResponse = ApiSuccess<{
  url: string;
}>;

export type HomeStatusUpdateRequest = {
  status: "DRAFT" | "PUBLISHED";
};

export type HomeStatusResponse = {
  status: "DRAFT" | "PUBLISHED";
};

export type CmsTranslation = {
  id?: number;
  languageId?: number;
  language?: {
    code: string;
  };
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: Record<string, unknown> | string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type CmsPost = {
  id: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations: CmsTranslation[];
};

export type CmsPage = {
  id: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations: CmsTranslation[];
};

export type CmsListResponse<T> = ApiSuccess<{
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

export type CmsDetailResponse<T> = ApiSuccess<T>;

export type MediaItem = {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt?: string;
};

export type MediaListResponse = CmsListResponse<MediaItem>;
export type MediaUploadResponse = ApiSuccess<MediaItem>;

export type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

export type AdminUser = {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUsersResponse = ApiSuccess<AdminUser[]>;
