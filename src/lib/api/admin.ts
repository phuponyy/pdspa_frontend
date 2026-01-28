import { apiFetch } from "./client";
import { API_BASE_URL } from "@/lib/constants";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ApiSuccess,
  CmsDetailResponse,
  CmsListResponse,
  CmsPage,
  CmsPost,
  CmsCategory,
  CmsTag,
  HeroImageUploadResponse,
  LeadDetailResponse,
  LeadListResponse,
  LeadStatusUpdateRequest,
  MediaListResponse,
  MediaUploadResponse,
  RedirectItem,
  RedirectListResponse,
  AdminMeResponse,
  AdminUserResponse,
  AdminUsersResponse,
  AdminRoleResponse,
  AdminRolesResponse,
  AdminService,
  AdminServicesResponse,
  AdminSessionsResponse,
  AdminAuditLogsResponse,
  HomeHeroUpdateRequest,
  HomeIntroUpdateRequest,
  HomeMetaUpdateRequest,
  HomeRecoveryUpdateRequest,
  HomeStatusUpdateRequest,
  HomeHeroResponse,
  HomeIntroResponse,
  HomeMetaResponse,
  HomeRecoveryResponse,
  HomeStatusResponse,
  SiteConfigResponse,
} from "@/types/api.types";
import type {
  AnalyticsResponse,
  Booking,
  Customer,
  LiveResponse,
  OverviewResponse,
  PaginatedResponse,
} from "@/types/admin-dashboard.types";

type AdminRequestEvent = {
  phase: "start" | "end";
  id: string;
  method: string;
  path: string;
  ok?: boolean;
  status?: number;
};

const getCsrfToken = () => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("pd2_csrf="));
  return match ? decodeURIComponent(match.split("=")[1] || "") : "";
};

const dispatchAdminRequest = (detail: AdminRequestEvent) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AdminRequestEvent>("admin-request", { detail }));
};

const withAdminRequest = async <T,>(
  path: string,
  method: string,
  run: () => Promise<T>
) => {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  dispatchAdminRequest({ phase: "start", id: requestId, method, path });
  try {
    const result = await run();
    dispatchAdminRequest({ phase: "end", id: requestId, method, path, ok: true, status: 200 });
    return result;
  } catch (err) {
    dispatchAdminRequest({ phase: "end", id: requestId, method, path, ok: false, status: 0 });
    throw err;
  }
};

export const loginAdmin = async (payload: AdminLoginRequest) =>
  apiFetch<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });

export const getAdminSessions = async (
  token: string | undefined,
  params?: {
    page?: number;
    pageSize?: number;
    userId?: number;
    ip?: string;
    device?: string;
    q?: string;
    active?: boolean;
  }
) =>
  apiFetch<AdminSessionsResponse>("/admin/security/sessions", {
    token,
    query: {
      page: params?.page,
      pageSize: params?.pageSize,
      userId: params?.userId,
      ip: params?.ip,
      device: params?.device,
      q: params?.q,
      active:
        typeof params?.active === "boolean" ? String(params.active) : undefined,
    },
    cache: "no-store",
  });

export const revokeAdminSession = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<{ revoked?: number }>>(`/admin/security/sessions/${id}`, {
    token,
    method: "DELETE",
  });

export const revokeAdminSessions = async (
  token: string | undefined,
  payload: {
    userId?: number;
    ip?: string;
    device?: string;
    userAgent?: string;
    all?: boolean;
  }
) =>
  apiFetch<ApiSuccess<{ revoked: number }>>("/admin/security/sessions/revoke", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAdminAuditLogs = async (
  token: string | undefined,
  params?: {
    page?: number;
    pageSize?: number;
    action?: string;
    entity?: string;
    userId?: number;
    ip?: string;
    q?: string;
  }
) =>
  apiFetch<AdminAuditLogsResponse>("/admin/security/audit-logs", {
    token,
    query: {
      page: params?.page,
      pageSize: params?.pageSize,
      action: params?.action,
      entity: params?.entity,
      userId: params?.userId,
      ip: params?.ip,
      q: params?.q,
    },
    cache: "no-store",
  });

export const getLeads = async (token?: string, page = 1, limit = 20) =>
  apiFetch<LeadListResponse>("/admin/leads", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getLead = async (token: string | undefined, id: string | number) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}`, {
    token,
    cache: "no-store",
  });

export const updateLeadStatus = async (
  token: string | undefined,
  id: string | number,
  payload: LeadStatusUpdateRequest
) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateHomeMeta = async (
  token: string | undefined,
  lang: string,
  payload: HomeMetaUpdateRequest
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/meta", {
    token,
    method: "PATCH",
    query: { lang },
    body: JSON.stringify(payload),
  });

export const updateHomeHero = async (
  token: string | undefined,
  lang: string,
  payload: HomeHeroUpdateRequest
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/hero", {
    token,
    method: "PATCH",
    query: { lang },
    body: JSON.stringify(payload),
  });

export const updateHomeIntro = async (
  token: string | undefined,
  lang: string,
  payload: HomeIntroUpdateRequest
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/intro", {
    token,
    method: "PATCH",
    query: { lang },
    body: JSON.stringify(payload),
  });

export const updateHomeRecovery = async (
  token: string | undefined,
  lang: string,
  payload: HomeRecoveryUpdateRequest
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/recovery", {
    token,
    method: "PATCH",
    query: { lang },
    body: JSON.stringify(payload),
  });

export const updateHomeStatus = async (
  token: string | undefined,
  payload: HomeStatusUpdateRequest
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/status", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getHomeMeta = async (token: string | undefined, lang: string) =>
  apiFetch<HomeMetaResponse>("/admin/pages/home/meta", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeHero = async (token: string | undefined, lang: string) =>
  apiFetch<HomeHeroResponse>("/admin/pages/home/hero", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeIntro = async (token: string | undefined, lang: string) =>
  apiFetch<HomeIntroResponse>("/admin/pages/home/intro", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeRecovery = async (token: string | undefined, lang: string) =>
  apiFetch<HomeRecoveryResponse>("/admin/pages/home/recovery", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeStatus = async (token?: string) =>
  apiFetch<HomeStatusResponse>("/admin/pages/home/status", {
    token,
    cache: "no-store",
  });

export const updateSiteConfig = async (
  token: string | undefined,
  payload: Record<string, string>
) =>
  apiFetch<SiteConfigResponse>("/admin/config", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const uploadHeroImage = async (file: File) => {
  return withAdminRequest("/admin/pages/home/hero/images", "POST", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const csrfToken = getCsrfToken();

    const response = await fetch(`${API_BASE_URL}/admin/pages/home/hero/images`, {
      method: "POST",
      credentials: "include",
      body: formData,
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return (await response.json()) as HeroImageUploadResponse;
  });
};

export const getCmsPosts = async (token?: string, page = 1, limit = 20) =>
  apiFetch<CmsListResponse<CmsPost>>("/admin/cms/posts", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getCmsCategories = async (token?: string) =>
  apiFetch<ApiSuccess<CmsCategory[]>>("/admin/cms/categories", {
    token,
    cache: "no-store",
  });

export const createCmsCategory = async (token: string | undefined, payload: { name: string; slug?: string }) =>
  apiFetch<ApiSuccess<CmsCategory>>("/admin/cms/categories", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getCmsTags = async (token?: string) =>
  apiFetch<ApiSuccess<CmsTag[]>>("/admin/cms/tags", {
    token,
    cache: "no-store",
  });

export const createCmsTag = async (token: string | undefined, payload: { name: string; slug?: string }) =>
  apiFetch<ApiSuccess<CmsTag>>("/admin/cms/tags", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getCmsPost = async (token: string | undefined, id: number) =>
  apiFetch<CmsDetailResponse<CmsPost>>(`/admin/cms/posts/${id}`, {
    token,
    cache: "no-store",
  });

export const createCmsPost = async (token: string | undefined, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPost>>("/admin/cms/posts", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCmsPost = async (
  token: string | undefined,
  id: number,
  payload: unknown
) =>
  apiFetch<CmsDetailResponse<CmsPost>>(`/admin/cms/posts/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteCmsPost = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/cms/posts/${id}`, {
    token,
    method: "DELETE",
  });

export const getRedirects = async (
  token?: string,
  page = 1,
  limit = 20,
  q?: string
) =>
  apiFetch<RedirectListResponse>("/admin/redirects", {
    token,
    cache: "no-store",
    query: { page, limit, q },
  });

export const createRedirect = async (
  token: string | undefined,
  payload: {
    fromPath: string;
    toPath: string;
    status?: number;
    isActive?: boolean;
  }
) =>
  apiFetch<ApiSuccess<RedirectItem>>("/admin/redirects", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateRedirect = async (
  token: string | undefined,
  id: number,
  payload: {
    fromPath?: string;
    toPath?: string;
    status?: number;
    isActive?: boolean;
  }
) =>
  apiFetch<ApiSuccess<RedirectItem>>(`/admin/redirects/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteRedirect = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/redirects/${id}`, {
    token,
    method: "DELETE",
  });

export const getCmsPages = async (token?: string, page = 1, limit = 20) =>
  apiFetch<CmsListResponse<CmsPage>>("/admin/cms/pages", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getCmsPage = async (token: string | undefined, id: number) =>
  apiFetch<CmsDetailResponse<CmsPage>>(`/admin/cms/pages/${id}`, {
    token,
    cache: "no-store",
  });

export const createCmsPage = async (token: string | undefined, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPage>>("/admin/cms/pages", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCmsPage = async (
  token: string | undefined,
  id: number,
  payload: unknown
) =>
  apiFetch<CmsDetailResponse<CmsPage>>(`/admin/cms/pages/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteCmsPage = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/cms/pages/${id}`, {
    token,
    method: "DELETE",
  });

export const getMediaLibrary = async (token?: string, page = 1, limit = 30) =>
  apiFetch<MediaListResponse>("/admin/cms/media", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getAdminIpConfig = async () =>
  apiFetch<ApiSuccess<{ whitelist: string[]; blacklist: string[] }>>(
    "/admin/security/ip-config",
    {
      cache: "no-store",
    }
  );

export const updateAdminIpConfig = async (payload: {
  whitelist: string[];
  blacklist: string[];
}) =>
  apiFetch<ApiSuccess<{ whitelist: string[]; blacklist: string[] }>>(
    "/admin/security/ip-config",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

export const uploadMedia = async (file: File) => {
  return withAdminRequest("/admin/cms/media", "POST", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const csrfToken = getCsrfToken();

    const response = await fetch(`${API_BASE_URL}/admin/cms/media`, {
      method: "POST",
      credentials: "include",
      body: formData,
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return (await response.json()) as MediaUploadResponse;
  });
};

export const updateMedia = async (id: number, file: File) => {
  return withAdminRequest(`/admin/cms/media/${id}`, "PATCH", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const csrfToken = getCsrfToken();

    const response = await fetch(`${API_BASE_URL}/admin/cms/media/${id}`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
    });

    if (!response.ok) {
      throw new Error("Update failed");
    }

    return (await response.json()) as MediaUploadResponse;
  });
};

export const updateMediaMeta = async (
  id: number,
  payload: { filename: string }
) =>
  apiFetch<MediaUploadResponse>(`/admin/cms/media/${id}/meta`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteMedia = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/cms/media/${id}`, {
    token,
    method: "DELETE",
  });

export const getAdminUsers = async (token?: string) =>
  apiFetch<AdminUsersResponse>("/admin/users", {
    token,
    cache: "no-store",
  });

export const getAdminMe = async (token?: string) =>
  apiFetch<AdminMeResponse>("/admin/auth/me", {
    token,
    cache: "no-store",
  });

export const getAdminRoles = async (token?: string) =>
  apiFetch<AdminRolesResponse>("/admin/roles", {
    token,
    cache: "no-store",
  });

export const createAdminUser = async (token: string | undefined, payload: unknown) =>
  apiFetch<AdminUserResponse>("/admin/users", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const createAdminRole = async (token: string | undefined, payload: unknown) =>
  apiFetch<AdminRoleResponse>("/admin/roles", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminUser = async (
  token: string | undefined,
  id: number,
  payload: unknown
) =>
  apiFetch<AdminUserResponse>(`/admin/users/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateAdminRole = async (
  token: string | undefined,
  id: number,
  payload: unknown
) =>
  apiFetch<AdminRoleResponse>(`/admin/roles/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteAdminUser = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/users/${id}`, {
    token,
    method: "DELETE",
  });

export const deleteAdminRole = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/roles/${id}`, {
    token,
    method: "DELETE",
  });

export const getAdminServices = async (token?: string) =>
  apiFetch<AdminServicesResponse>("/admin/services", {
    token,
    cache: "no-store",
  });

export const createAdminService = async (token: string | undefined, payload: unknown) =>
  apiFetch<ApiSuccess<AdminService>>("/admin/services", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminService = async (
  token: string | undefined,
  id: number,
  payload: unknown
) =>
  apiFetch<ApiSuccess<AdminService>>(`/admin/services/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteAdminService = async (token: string | undefined, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/services/${id}`, {
    token,
    method: "DELETE",
  });

export const resetAdminUserPassword = async (
  token: string | undefined,
  id: number,
  payload: unknown
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/users/${id}/password`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getAdminOverview = async (
  token?: string,
  params?: Record<string, string | number | undefined>
) =>
  apiFetch<OverviewResponse>("/admin/overview", {
    token,
    query: params,
    cache: "no-store",
  });

export const getAdminAnalytics = async (
  token: string | undefined,
  params: { range?: string; from?: string; to?: string; interval?: string }
) =>
  apiFetch<AnalyticsResponse>("/admin/analytics", {
    token,
    query: params,
    cache: "no-store",
  });

export const getAdminLive = async (token?: string) =>
  apiFetch<LiveResponse>("/admin/live", {
    token,
    cache: "no-store",
  });

export const getCustomers = async (
  token: string | undefined,
  params: Record<string, string | number | undefined>
) =>
  apiFetch<PaginatedResponse<Customer>>("/admin/customers", {
    token,
    query: params,
    cache: "no-store",
  });

export const getBookings = async (
  token?: string,
  params?: Record<string, string | number | undefined>,
  options?: { notify?: boolean; timeoutMs?: number }
) =>
  apiFetch<PaginatedResponse<Booking>>("/admin/bookings", {
    token,
    query: params,
    cache: "no-store",
    notify: options?.notify,
    timeoutMs: options?.timeoutMs,
  });

export const updateBookingStatus = async (
  token: string | undefined,
  id: number,
  status: Booking["status"]
) =>
  apiFetch<Booking>(`/admin/bookings/${id}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const updateBooking = async (
  token: string | undefined,
  id: number,
  payload: unknown
) =>
  apiFetch<Booking>(`/admin/bookings/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const exportCustomers = async (format: "csv" | "xlsx") => {
  return withAdminRequest(`/admin/exports/customers?format=${format}`, "EXPORT", async () => {
    const response = await fetch(`${API_BASE_URL}/admin/exports/customers?format=${format}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Export failed");
    }
    return response.blob();
  });
};

export const exportBookings = async (format: "csv" | "xlsx") => {
  return withAdminRequest(`/admin/exports/bookings?format=${format}`, "EXPORT", async () => {
    const response = await fetch(`${API_BASE_URL}/admin/exports/bookings?format=${format}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Export failed");
    }
    return response.blob();
  });
};
