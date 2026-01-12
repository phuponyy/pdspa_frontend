import { apiFetch } from "./client";
import { API_BASE_URL } from "@/lib/constants";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ApiSuccess,
  HeroImageUploadResponse,
  LeadDetailResponse,
  LeadListResponse,
  LeadStatusUpdateRequest,
  HomeHeroUpdateRequest,
  HomeMetaUpdateRequest,
  HomeStatusUpdateRequest,
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
