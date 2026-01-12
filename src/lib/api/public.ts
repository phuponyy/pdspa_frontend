import { apiFetch } from "./client";
import type {
  HomePageResponse,
  LeadCreateRequest,
  LeadCreateResponse,
  PublicServicesResponse,
} from "@/types/api.types";
import type { HomeSection } from "@/types/page.types";

type HomePageRawSection = {
  key?: string;
  order?: number;
  settings?: Record<string, unknown> | null;
  t?: {
    heading?: string | null;
    subheading?: string | null;
    body?: Record<string, unknown> | null;
  } | null;
};

type HomePageRawResponse = {
  page?: Record<string, unknown>;
  meta?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  seo?: {
    canonical?: string;
    hreflangs?: Record<string, string>;
  };
  sections?: HomePageRawSection[];
} | null;

const mapSection = (section: HomePageRawSection): HomeSection => {
  const body = section.t?.body ?? null;
  const items = Array.isArray((body as { items?: unknown }).items)
    ? ((body as { items: HomeSection["items"] }).items ?? [])
    : undefined;
  const images = Array.isArray((body as { images?: unknown }).images)
    ? ((body as { images: string[] }).images ?? [])
    : undefined;
  const description =
    typeof (body as { text?: unknown }).text === "string"
      ? (body as { text: string }).text
      : undefined;
  const imageUrl =
    typeof (body as { imageUrl?: unknown }).imageUrl === "string"
      ? (body as { imageUrl: string }).imageUrl
      : undefined;

  return {
    key: section.key,
    type: section.key,
    heading: section.t?.heading ?? undefined,
    subheading: section.t?.subheading ?? undefined,
    description,
    imageUrl,
    images,
    items,
    body,
  };
};

export const getHomePage = async (lang: string) => {
  const payload = await apiFetch<HomePageRawResponse>("/public/pages/home", {
    cache: "no-store",
    query: { lang },
  });
  if (!payload) return null;
  return {
    page: payload.page,
    meta: payload.meta,
    seo: payload.seo,
    sections: payload.sections?.map(mapSection) ?? [],
  } satisfies HomePageResponse;
};

export const getServices = async (lang: string) =>
  apiFetch<PublicServicesResponse>("/public/services", {
    cache: "no-store",
    query: { lang },
  });

export const submitLead = async (payload: LeadCreateRequest) =>
  apiFetch<LeadCreateResponse>("/public/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
