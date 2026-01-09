import { apiFetch } from "./client";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ApiSuccess,
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

export const getLead = async (token: string, id: string) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}`, {
    token,
    cache: "no-store",
  });

export const updateLeadStatus = async (
  token: string,
  id: string,
  payload: LeadStatusUpdateRequest
) =>
  apiFetch<LeadDetailResponse>(`/admin/leads/${id}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateHomeMeta = async (token: string, payload: HomeMetaUpdateRequest) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/meta", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateHomeHero = async (token: string, payload: HomeHeroUpdateRequest) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/hero", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const updateHomeStatus = async (token: string, payload: HomeStatusUpdateRequest) =>
  apiFetch<ApiSuccess<Record<string, unknown>>>("/admin/pages/home/status", {
    token,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
