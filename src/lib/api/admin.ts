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
  AdminUsersResponse,
  HomeHeroUpdateRequest,
  HomeMetaUpdateRequest,
  HomeStatusUpdateRequest,
  HomeHeroResponse,
  HomeMetaResponse,
  HomeStatusResponse,
  SiteConfigResponse,
} from "@/types/api.types";

export const loginAdmin = async (payload: AdminLoginRequest) =>
  apiFetch<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getLeads = async (token: string, page = 1, limit = 20) =>
  apiFetch<LeadListResponse>("/admin/leads", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getLead = async (token: string, id: string | number) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}`, {
    token,
    cache: "no-store",
  });

export const updateLeadStatus = async (
  token: string,
  id: string | number,
  payload: LeadStatusUpdateRequest
) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateHomeMeta = async (
  token: string,
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
  token: string,
  lang: string,
  payload: HomeHeroUpdateRequest
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/hero", {
    token,
    method: "PATCH",
    query: { lang },
    body: JSON.stringify(payload),
  });

export const updateHomeStatus = async (token: string, payload: HomeStatusUpdateRequest) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/status", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getHomeMeta = async (token: string, lang: string) =>
  apiFetch<HomeMetaResponse>("/admin/pages/home/meta", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeHero = async (token: string, lang: string) =>
  apiFetch<HomeHeroResponse>("/admin/pages/home/hero", {
    token,
    query: { lang },
    cache: "no-store",
  });

export const getHomeStatus = async (token: string) =>
  apiFetch<HomeStatusResponse>("/admin/pages/home/status", {
    token,
    cache: "no-store",
  });

export const updateSiteConfig = async (token: string, payload: Record<string, string>) =>
  apiFetch<SiteConfigResponse>("/admin/config", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const uploadHeroImage = async (token: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/admin/pages/home/hero/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return (await response.json()) as HeroImageUploadResponse;
};

export const getCmsPosts = async (token: string, page = 1, limit = 20) =>
  apiFetch<CmsListResponse<CmsPost>>("/admin/cms/posts", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getCmsPost = async (token: string, id: number) =>
  apiFetch<CmsDetailResponse<CmsPost>>(`/admin/cms/posts/${id}`, {
    token,
    cache: "no-store",
  });

export const createCmsPost = async (token: string, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPost>>("/admin/cms/posts", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCmsPost = async (token: string, id: number, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPost>>(`/admin/cms/posts/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteCmsPost = async (token: string, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/cms/posts/${id}`, {
    token,
    method: "DELETE",
  });

export const getCmsPages = async (token: string, page = 1, limit = 20) =>
  apiFetch<CmsListResponse<CmsPage>>("/admin/cms/pages", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const getCmsPage = async (token: string, id: number) =>
  apiFetch<CmsDetailResponse<CmsPage>>(`/admin/cms/pages/${id}`, {
    token,
    cache: "no-store",
  });

export const createCmsPage = async (token: string, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPage>>("/admin/cms/pages", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCmsPage = async (token: string, id: number, payload: unknown) =>
  apiFetch<CmsDetailResponse<CmsPage>>(`/admin/cms/pages/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteCmsPage = async (token: string, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/cms/pages/${id}`, {
    token,
    method: "DELETE",
  });

export const getMediaLibrary = async (token: string, page = 1, limit = 30) =>
  apiFetch<MediaListResponse>("/admin/cms/media", {
    token,
    query: { page, limit },
    cache: "no-store",
  });

export const uploadMedia = async (token: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/admin/cms/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return (await response.json()) as MediaUploadResponse;
};

export const updateMedia = async (token: string, id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/admin/cms/media/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Update failed");
  }

  return (await response.json()) as MediaUploadResponse;
};

export const deleteMedia = async (token: string, id: number) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/cms/media/${id}`, {
    token,
    method: "DELETE",
  });

export const getAdminUsers = async (token: string) =>
  apiFetch<AdminUsersResponse>("/admin/users", {
    token,
    cache: "no-store",
  });

export const createAdminUser = async (token: string, payload: unknown) =>
  apiFetch<AdminUsersResponse>("/admin/users", {
    token,
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminUser = async (token: string, id: number, payload: unknown) =>
  apiFetch<AdminUsersResponse>(`/admin/users/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const resetAdminUserPassword = async (
  token: string,
  id: number,
  payload: unknown
) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>(`/admin/users/${id}/password`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
