import { apiFetch } from "./client";
import type {
  HomeMetaResponse,
  HomePageResponse,
  LeadCreateRequest,
  LeadCreateResponse,
  PublicConfigResponse,
} from "@/types/api.types";

export const getPublicConfig = async () =>
  apiFetch<PublicConfigResponse>("/public/config", {
    cache: "no-store",
  });

export const getHomePage = async (lang: string) =>
  apiFetch<HomePageResponse>("/public/pages/home", {
    cache: "no-store",
    query: { lang },
  });

export const getHomeMeta = async (lang: string) =>
  apiFetch<HomeMetaResponse>("/public/pages/home/meta", {
    cache: "no-store",
    query: { lang },
  });

export const submitLead = async (payload: LeadCreateRequest) =>
  apiFetch<LeadCreateResponse>("/public/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
