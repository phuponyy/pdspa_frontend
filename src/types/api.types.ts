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

export type PublicCmsPageResponse = {
  page: {
    id: number;
    status: "DRAFT" | "PUBLISHED";
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  translation: CmsTranslation | null;
  seo?: HomeSeo;
};

export type PublicPostItem = {
  id: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translation: CmsTranslation | null;
  categories?: CmsCategory[];
  tags?: CmsTag[];
};

export type PublicPostsResponse = ApiSuccess<{
  items: PublicPostItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

export type PublicPostDetailResponse = ApiSuccess<{
  post: {
    id: number;
    status: "DRAFT" | "PUBLISHED";
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  translation: CmsTranslation | null;
  categories?: CmsCategory[];
  tags?: CmsTag[];
  seo?: HomeSeo;
}>;

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
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
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
    durationMinutes?: number | null;
  }[];
};

export type PublicServicesResponse = ApiSuccess<PublicService[]>;

export type PublicBookingItem = {
  serviceId: number;
  priceOptionId?: number;
  qty?: number;
  guests?: number;
  duration?: string;
};

export type PublicBookingRequest = {
  fullName: string;
  phone: string;
  email?: string;
  whatsappId?: string;
  lineId?: string;
  wechatId?: string;
  note?: string;
  langCode: string;
  scheduledAt: string;
  paymentMethod: "cash" | "transfer" | "card";
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
  };
  items: PublicBookingItem[];
};

export type PublicBookingResponse = ApiSuccess<{ bookingId: number }>;

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
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaJson?: Record<string, unknown> | null;
};

export type HomeMetaResponse = {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaJson?: Record<string, unknown> | null;
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

export type HomeIntroResponse = {
  heading: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  providerName?: string;
  listingName?: string;
  rating?: number;
  reviews?: number;
  rankText?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

export type HomeIntroUpdateRequest = {
  heading: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  providerName?: string;
  listingName?: string;
  rating?: number;
  reviews?: number;
  rankText?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

export type HomeRecoveryResponse = {
  heading: string;
  description?: string;
  items?: { title?: string; description?: string; imageUrl?: string }[];
};

export type HomeRecoveryUpdateRequest = {
  heading: string;
  description?: string;
  items?: { title?: string; description?: string; imageUrl?: string }[];
};

export type HomeHighlightsResponse = {
  heading: string;
  description?: string;
  items?: { title?: string; description?: string; imageUrl?: string }[];
};

export type HomeHighlightsUpdateRequest = {
  heading: string;
  description?: string;
  items?: { title?: string; description?: string; imageUrl?: string }[];
};

export type HomeServicesResponse = {
  heading: string;
  description?: string;
  items?: {
    serviceId?: number;
    imageUrl?: string;
    label?: string;
    priceNote?: string;
  }[];
};

export type HomeServicesUpdateRequest = {
  heading: string;
  description?: string;
  items?: {
    serviceId?: number;
    imageUrl?: string;
    label?: string;
    priceNote?: string;
  }[];
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
  thumbnailUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonical?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  schemaJson?: Record<string, unknown> | null;
};

export type CmsPost = {
  id: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations: CmsTranslation[];
  categories?: CmsCategory[];
  tags?: CmsTag[];
};

export type CmsCategory = {
  id: number;
  name: string;
  slug: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CmsTag = {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
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
  checksum?: string | null;
  width?: number | null;
  height?: number | null;
  folder?: MediaFolder | null;
  tags?: MediaTagOnMedia[];
  variants?: MediaVariant[];
  createdAt?: string;
};

export type MediaFolder = {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MediaTag = {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MediaTagOnMedia = {
  tagId: number;
  mediaId: number;
  tag: MediaTag;
};

export type MediaVariant = {
  id: number;
  kind: string;
  url: string;
  width?: number | null;
  height?: number | null;
  mimeType: string;
  size: number;
  format: string;
  createdAt?: string;
};

export type RedirectItem = {
  id: number;
  fromPath: string;
  toPath: string;
  status: number;
  isActive: boolean;
  hits?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type RedirectListResponse = ApiSuccess<{
  items: RedirectItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

export type BrokenLinkItem = {
  url: string;
  status?: number;
  error?: string;
  sourceType?: "CmsPost" | "CmsPage" | "Navbar";
  sourceId?: number;
  sourceTitle?: string;
  lang?: string;
};

export type BrokenLinksScanResponse = ApiSuccess<{
  baseUrl: string;
  totalFound: number;
  checked: number;
  brokenCount: number;
  skipped: {
    external: number;
    anchors: number;
    relative: number;
    invalid: number;
    assets: number;
  };
  broken: BrokenLinkItem[];
}>;

export type SeoKeyword = {
  id: number;
  phrase: string;
  targetUrl?: string | null;
  locale: string;
  device: string;
  isActive: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  ranks?: SeoKeywordRank[];
};

export type SeoKeywordRank = {
  id: number;
  keywordId: number;
  position?: number | null;
  resultUrl?: string | null;
  resultTitle?: string | null;
  engine?: string | null;
  status?: string | null;
  checkedAt?: string;
  responseMs?: number | null;
  error?: string | null;
};

export type SeoKeywordListResponse = ApiSuccess<{
  items: SeoKeyword[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

export type SeoKeywordHistoryResponse = ApiSuccess<{
  keyword: SeoKeyword;
  items: SeoKeywordRank[];
}>;

export type SeoKeywordScanSummary = {
  total: number;
  scanned: number;
  skipped: number;
  improved: number;
  dropped: number;
  unchanged: number;
  notFound: number;
  errors: number;
};

export type SeoKeywordScanResponse = ApiSuccess<SeoKeywordScanSummary>;

export type SeoKeywordCrawlResponse = ApiSuccess<{
  created: number;
  skipped: number;
}>;

export type SeoKeywordSerpPreviewItem = {
  position?: number;
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
  thumbnail?: string;
};

export type SeoKeywordSerpPreviewResponse = ApiSuccess<{
  keyword: SeoKeyword;
  items: SeoKeywordSerpPreviewItem[];
}>;

export type MediaListResponse = CmsListResponse<MediaItem>;
export type MediaUploadResponse = ApiSuccess<MediaItem>;

export type AdminRole = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
};

export type AdminUser = {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  roleKey: string;
  role?: AdminRole | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSession = {
  id: number;
  userId: number;
  email?: string;
  name?: string | null;
  roleKey?: string | null;
  ip?: string | null;
  device?: string | null;
  userAgent?: string | null;
  createdAt?: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
};

export type AdminAuditLog = {
  id: number;
  userId?: number | null;
  email?: string;
  name?: string | null;
  roleKey?: string | null;
  action: string;
  entity: string;
  entityId?: number | null;
  ip?: string | null;
  metadata?: Record<string, unknown> | null;
  scope?: string | null;
  createdAt?: string;
};

export type AdminUsersResponse = ApiSuccess<AdminUser[]>;
export type AdminUserResponse = ApiSuccess<AdminUser>;

export type AdminRolesResponse = ApiSuccess<AdminRole[]>;
export type AdminRoleResponse = ApiSuccess<AdminRole>;

export type AdminMeResponse = ApiSuccess<{
  id?: number;
  email?: string;
  name?: string | null;
  avatarUrl?: string | null;
  roleKey?: string;
  permissions: string[];
  mfaEnabled?: boolean;
}>;

export type AdminSessionsResponse = ApiSuccess<{
  items: AdminSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

export type AdminAuditLogsResponse = ApiSuccess<{
  items: AdminAuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

export type AdminService = {
  id: number;
  key: string;
  isActive: boolean;
  translations: {
    id?: number;
    langCode: string;
    name: string;
    description?: string | null;
  }[];
  priceOptions: {
    id?: number;
    code: string;
    price: number;
    durationMinutes?: number | null;
    isActive?: boolean;
  }[];
};

export type AdminServicesResponse = ApiSuccess<AdminService[]>;
