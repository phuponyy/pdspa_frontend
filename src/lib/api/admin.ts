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
  HeroImageUploadResponse,
  LeadDetailResponse,
  LeadListResponse,
  LeadStatusUpdateRequest,
  MediaListResponse,
  MediaUploadResponse,
  AdminMeResponse,
  AdminUserResponse,
  AdminUsersResponse,
  AdminRoleResponse,
  AdminRolesResponse,
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

export const getLeads = async (token?: string, page = 1, limit = 20) =>
  apiFetch<LeadListResponse>("/admin/leads", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getLead = async (token?: string, id: string | number) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}`, {
    token,
    cache: "no-store",
  });

export const updateLeadStatus = async (
  token?: string,
  id: string | number,
  payload: LeadStatusUpdateRequest
) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateHomeMeta = async (
  token?: string,
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
  token?: string,
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
  token?: string,
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
  token?: string,
  lang: string,
  payload: HomeRecoveryUpdateRequest
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/recovery", {
    token,
    method: "PATCH",
    query: { lang },
    body: JSON.stringify(payload),
  });

export const updateHomeStatus = async (token?: string, payload: HomeStatusUpdateRequest) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/status", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getHomeMeta = async (token?: string, lang: string) =>
  apiFetch<HomeMetaResponse>("/admin/pages/home/meta", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeHero = async (token?: string, lang: string) =>
  apiFetch<HomeHeroResponse>("/admin/pages/home/hero", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeIntro = async (token?: string, lang: string) =>
  apiFetch<HomeIntroResponse>("/admin/pages/home/intro", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeRecovery = async (token?: string, lang: string) =>
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

export const updateSiteConfig = async (token?: string, payload: Record<string, string>) =>
  apiFetch<SiteConfigResponse>("/admin/config", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const uploadHeroImage = async (file: File) => {
  return withAdminRequest("/admin/pages/home/hero/images", "POST", async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/admin/pages/home/hero/images`, {
      method: "POST",
      credentials: "include",
      body: formData,
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

export const getCmsPost = async (token?: string, id: number) =>
  apiFetch<CmsDetailResponse<CmsPost>>(`/admin/cms/posts/${id}`, {
    token,
    cache: "no-store",
  });

export const createCmsPost = async (token?: string, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPost>>("/admin/cms/posts", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCmsPost = async (token?: string, id: number, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPost>>(`/admin/cms/posts/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteCmsPost = async (token?: string, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/cms/posts/${id}`, {
    token,
    method: "DELETE",
  });

export const getCmsPages = async (token?: string, page = 1, limit = 20) =>
  apiFetch<CmsListResponse<CmsPage>>("/admin/cms/pages", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getCmsPage = async (token?: string, id: number) =>
  apiFetch<CmsDetailResponse<CmsPage>>(`/admin/cms/pages/${id}`, {
    token,
    cache: "no-store",
  });

export const createCmsPage = async (token?: string, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPage>>("/admin/cms/pages", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCmsPage = async (token?: string, id: number, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPage>>(`/admin/cms/pages/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteCmsPage = async (token?: string, id: number) =>
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

export const uploadMedia = async (file: File) => {
  return withAdminRequest("/admin/cms/media", "POST", async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/admin/cms/media`, {
      method: "POST",
      credentials: "include",
      body: formData,
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

    const response = await fetch(`${API_BASE_URL}/admin/cms/media/${id}`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Update failed");
    }

    return (await response.json()) as MediaUploadResponse;
  });
};

export const deleteMedia = async (token?: string, id: number) =>
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

export const createAdminUser = async (token?: string, payload: unknown) =>
  apiFetch<AdminUserResponse>("/admin/users", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const createAdminRole = async (token?: string, payload: unknown) =>
  apiFetch<AdminRoleResponse>("/admin/roles", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminUser = async (token?: string, id: number, payload: unknown) =>
  apiFetch<AdminUserResponse>(`/admin/users/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateAdminRole = async (token?: string, id: number, payload: unknown) =>
  apiFetch<AdminRoleResponse>(`/admin/roles/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteAdminUser = async (token?: string, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/users/${id}`, {
    token,
    method: "DELETE",
  });

export const deleteAdminRole = async (token?: string, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/roles/${id}`, {
    token,
    method: "DELETE",
  });

export const resetAdminUserPassword = async (
  token?: string,
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
  token?: string,
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
  token?: string,
  params: Record<string, string | number | undefined>
) =>
  apiFetch<PaginatedResponse<Customer>>("/admin/customers", {
    token,
    query: params,
    cache: "no-store",
  });

export const getBookings = async (
  token?: string,
  params: Record<string, string | number | undefined>
) =>
  apiFetch<PaginatedResponse<Booking>>("/admin/bookings", {
    token,
    query: params,
    cache: "no-store",
  });

export const updateBookingStatus = async (
  token?: string,
  id: number,
  status: Booking["status"]
) =>
  apiFetch<Booking>(`/admin/bookings/${id}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ status }),
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
