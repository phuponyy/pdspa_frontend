import { apiFetch } from "./client";
import { API_BASE_URL } from "@/lib/constants";
import type {
  HomePageResponse,
  LeadCreateRequest,
  LeadCreateResponse,
  PublicServicesResponse,
  PublicBookingRequest,
  PublicBookingResponse,
  SiteConfigResponse,
  PublicCmsPageResponse,
  PublicPostsResponse,
  PublicPostDetailResponse,
} from "@/types/api.types";
import type { HeroSlide, HomeSection } from "@/types/page.types";

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
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
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
    ? ((body as { images: string[] }).images ?? []).map((src) =>
      src && src.startsWith("/") ? `${API_BASE_URL}${src}` : src
    )
    : undefined;
  const slides = Array.isArray((body as { slides?: unknown }).slides)
    ? ((body as { slides: HeroSlide[] }).slides ?? []).map((slide) => ({
      ...slide,
      imageUrl:
        slide.imageUrl && slide.imageUrl.startsWith("/")
          ? `${API_BASE_URL}${slide.imageUrl}`
          : slide.imageUrl,
    }))
    : undefined;
  const description =
    typeof (body as { text?: unknown }).text === "string"
      ? (body as { text: string }).text
      : undefined;
  const rawImageUrl =
    typeof (body as { imageUrl?: unknown }).imageUrl === "string"
      ? (body as { imageUrl: string }).imageUrl
      : undefined;
  const imageUrl =
    rawImageUrl && rawImageUrl.startsWith("/")
      ? `${API_BASE_URL}${rawImageUrl}`
      : rawImageUrl;

  return {
    key: section.key,
    type: section.key,
    heading: section.t?.heading ?? undefined,
    subheading: section.t?.subheading ?? undefined,
    description,
    imageUrl,
    images,
    slides,
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

export const getCmsPageBySlug = async (slug: string, lang: string) =>
  apiFetch<PublicCmsPageResponse>(`/public/pages/slug/${slug}`, {
    cache: "no-store",
    query: { lang },
  });

export const getPublicPosts = async (
  lang: string,
  page = 1,
  limit = 12
) =>
  apiFetch<PublicPostsResponse>("/public/posts", {
    cache: "no-store",
    query: { lang, page, limit },
  });

export const getPublicPostBySlug = async (slug: string, lang: string) =>
  apiFetch<PublicPostDetailResponse>(`/public/posts/slug/${slug}`, {
    cache: "no-store",
    query: { lang },
  });

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

export const getSiteConfig = async () =>
  apiFetch<SiteConfigResponse>("/public/config", {
    cache: "no-store",
  });

export const createBooking = async (payload: PublicBookingRequest) =>
  apiFetch<PublicBookingResponse>("/public/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
