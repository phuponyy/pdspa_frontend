import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  HeroState,
  IntroState,
  MetaState,
  RecoveryState,
  BlogState,
  ReviewsState,
  GalleryState,
  MentionsState,
  ServicesState,
} from "@/components/admin/page-editor/types";
import type { SchemaTemplateType } from "@/lib/seo/seoUtils";

type DraftPayload = {
  metaByLang?: Record<string, MetaState>;
  heroByLang?: Record<string, HeroState>;
  introByLang?: Record<string, IntroState>;
  highlightsByLang?: Record<string, RecoveryState>;
  servicesByLang?: Record<string, ServicesState>;
  recoveryByLang?: Record<string, RecoveryState>;
  reviewsByLang?: Record<string, ReviewsState>;
  galleryByLang?: Record<string, GalleryState>;
  mentionsByLang?: Record<string, MentionsState>;
  blogByLang?: Record<string, BlogState>;
  focusKeywordByLang?: Record<string, string>;
  schemaTemplateByLang?: Record<string, SchemaTemplateType>;
  schemaOrgByLang?: Record<string, string>;
  schemaFaqByLang?: Record<string, { question: string; answer: string }[]>;
  sectionOrder?: string[];
  activeLang?: string;
  status?: "DRAFT" | "PUBLISHED";
};

type DraftHookParams = {
  storageKey: string;
  isDirty: boolean;
  isLang: (value: string | null) => value is "vi" | "en";
  activeLang: "vi" | "en";
  metaByLang: Record<string, MetaState>;
  heroByLang: Record<string, HeroState>;
  introByLang: Record<string, IntroState>;
  highlightsByLang: Record<string, RecoveryState>;
  servicesByLang: Record<string, ServicesState>;
  recoveryByLang: Record<string, RecoveryState>;
  reviewsByLang: Record<string, ReviewsState>;
  galleryByLang: Record<string, GalleryState>;
  mentionsByLang: Record<string, MentionsState>;
  blogByLang: Record<string, BlogState>;
  focusKeywordByLang: Record<string, string>;
  schemaTemplateByLang: Record<string, SchemaTemplateType>;
  schemaOrgByLang: Record<string, string>;
  schemaFaqByLang: Record<string, { question: string; answer: string }[]>;
  sectionOrder: string[];
  status: "DRAFT" | "PUBLISHED";
  setActiveLang: Dispatch<SetStateAction<"vi" | "en">>;
  setMetaByLang: Dispatch<SetStateAction<Record<string, MetaState>>>;
  setHeroByLang: Dispatch<SetStateAction<Record<string, HeroState>>>;
  setIntroByLang: Dispatch<SetStateAction<Record<string, IntroState>>>;
  setHighlightsByLang: Dispatch<SetStateAction<Record<string, RecoveryState>>>;
  setServicesByLang: Dispatch<SetStateAction<Record<string, ServicesState>>>;
  setRecoveryByLang: Dispatch<SetStateAction<Record<string, RecoveryState>>>;
  setReviewsByLang: Dispatch<SetStateAction<Record<string, ReviewsState>>>;
  setGalleryByLang: Dispatch<SetStateAction<Record<string, GalleryState>>>;
  setMentionsByLang: Dispatch<SetStateAction<Record<string, MentionsState>>>;
  setBlogByLang: Dispatch<SetStateAction<Record<string, BlogState>>>;
  setFocusKeywordByLang: Dispatch<SetStateAction<Record<string, string>>>;
  setSchemaTemplateByLang: Dispatch<SetStateAction<Record<string, SchemaTemplateType>>>;
  setSchemaOrgByLang: Dispatch<SetStateAction<Record<string, string>>>;
  setSchemaFaqByLang: Dispatch<
    SetStateAction<Record<string, { question: string; answer: string }[]>>
  >;
  setSectionOrder: Dispatch<SetStateAction<string[]>>;
  setStatus: Dispatch<SetStateAction<"DRAFT" | "PUBLISHED">>;
};

export const usePageEditorDraft = ({
  storageKey,
  isDirty,
  isLang,
  activeLang,
  metaByLang,
  heroByLang,
  introByLang,
  highlightsByLang,
  servicesByLang,
  recoveryByLang,
  reviewsByLang,
  galleryByLang,
  mentionsByLang,
  blogByLang,
  focusKeywordByLang,
  schemaTemplateByLang,
  schemaOrgByLang,
  schemaFaqByLang,
  sectionOrder,
  status,
  setActiveLang,
  setMetaByLang,
  setHeroByLang,
  setIntroByLang,
  setHighlightsByLang,
  setServicesByLang,
  setRecoveryByLang,
  setReviewsByLang,
  setGalleryByLang,
  setMentionsByLang,
  setBlogByLang,
  setFocusKeywordByLang,
  setSchemaTemplateByLang,
  setSchemaOrgByLang,
  setSchemaFaqByLang,
  setSectionOrder,
  setStatus,
}: DraftHookParams) => {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as DraftPayload;
      if (parsed?.metaByLang) setMetaByLang(parsed.metaByLang);
      if (parsed?.heroByLang) setHeroByLang(parsed.heroByLang);
      if (parsed?.introByLang) setIntroByLang(parsed.introByLang);
      if (parsed?.highlightsByLang) setHighlightsByLang(parsed.highlightsByLang);
      if (parsed?.servicesByLang) setServicesByLang(parsed.servicesByLang);
      if (parsed?.recoveryByLang) setRecoveryByLang(parsed.recoveryByLang);
      if (parsed?.reviewsByLang) setReviewsByLang(parsed.reviewsByLang);
      if (parsed?.galleryByLang) setGalleryByLang(parsed.galleryByLang);
      if (parsed?.mentionsByLang) setMentionsByLang(parsed.mentionsByLang);
      if (parsed?.blogByLang) setBlogByLang(parsed.blogByLang);
      if (parsed?.focusKeywordByLang) setFocusKeywordByLang(parsed.focusKeywordByLang);
      if (parsed?.schemaTemplateByLang) setSchemaTemplateByLang(parsed.schemaTemplateByLang);
      if (parsed?.schemaOrgByLang) setSchemaOrgByLang(parsed.schemaOrgByLang);
      if (parsed?.schemaFaqByLang) setSchemaFaqByLang(parsed.schemaFaqByLang);
      if (Array.isArray(parsed?.sectionOrder) && parsed.sectionOrder.length) {
        setSectionOrder(parsed.sectionOrder);
      }
      if (parsed?.status) setStatus(parsed.status);
      if (parsed?.activeLang && isLang(parsed.activeLang)) {
        setActiveLang(parsed.activeLang);
      }
      setHasDraft(true);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    const payload: DraftPayload = {
      metaByLang,
      heroByLang,
      introByLang,
      highlightsByLang,
      servicesByLang,
      recoveryByLang,
      reviewsByLang,
      galleryByLang,
      mentionsByLang,
      blogByLang,
      focusKeywordByLang,
      schemaTemplateByLang,
      schemaOrgByLang,
      schemaFaqByLang,
      sectionOrder,
      activeLang,
      status,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [
    activeLang,
    focusKeywordByLang,
    heroByLang,
    highlightsByLang,
    introByLang,
    isDirty,
    metaByLang,
    recoveryByLang,
    reviewsByLang,
    galleryByLang,
    mentionsByLang,
    schemaFaqByLang,
    schemaOrgByLang,
    schemaTemplateByLang,
    sectionOrder,
    servicesByLang,
    status,
    storageKey,
  ]);

  return { hasDraft, setHasDraft };
};
