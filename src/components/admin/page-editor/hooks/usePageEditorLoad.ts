import { useEffect, type Dispatch, type SetStateAction } from "react";
import {
  getHomeHero,
  getHomeHighlights,
  getHomeGallery,
  getHomeIntro,
  getHomeBlog,
  getHomeMeta,
  getHomeRecovery,
  getHomeReviews,
  getHomeMentions,
  getHomeServices,
  getHomeStatus,
} from "@/lib/api/admin";
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

type LoadHookParams = {
  activeLang: "vi" | "en";
  hasDraft: boolean;
  loadedLangs: Record<string, boolean>;
  isDirty: boolean;
  setLoadedLangs: Dispatch<SetStateAction<Record<string, boolean>>>;
  setMetaByLang: Dispatch<SetStateAction<Record<string, MetaState>>>;
  setHeroByLang: Dispatch<SetStateAction<Record<string, HeroState>>>;
  setIntroByLang: Dispatch<SetStateAction<Record<string, IntroState>>>;
  setHighlightsByLang: Dispatch<SetStateAction<Record<string, RecoveryState>>>;
  setServicesByLang: Dispatch<SetStateAction<Record<string, ServicesState>>>;
  setRecoveryByLang: Dispatch<SetStateAction<Record<string, RecoveryState>>>;
  setGalleryByLang: Dispatch<SetStateAction<Record<string, GalleryState>>>;
  setReviewsByLang: Dispatch<SetStateAction<Record<string, ReviewsState>>>;
  setMentionsByLang: Dispatch<SetStateAction<Record<string, MentionsState>>>;
  setBlogByLang: Dispatch<SetStateAction<Record<string, BlogState>>>;
  setStatus: Dispatch<SetStateAction<"DRAFT" | "PUBLISHED">>;
  handleError: (err: unknown) => void;
};

export const usePageEditorLoad = ({
  activeLang,
  hasDraft,
  loadedLangs,
  isDirty,
  setLoadedLangs,
  setMetaByLang,
  setHeroByLang,
  setIntroByLang,
  setHighlightsByLang,
  setServicesByLang,
  setRecoveryByLang,
  setGalleryByLang,
  setReviewsByLang,
  setMentionsByLang,
  setBlogByLang,
  setStatus,
  handleError,
}: LoadHookParams) => {
  useEffect(() => {
    if (loadedLangs[activeLang]) return;
    let cancelled = false;

    const isEmptyMeta = (meta: MetaState | undefined) =>
      !meta?.metaTitle &&
      !meta?.metaDescription &&
      !meta?.canonical &&
      !meta?.ogTitle &&
      !meta?.ogDescription &&
      !meta?.ogImage &&
      !meta?.schemaJson;
    const isEmptyHero = (hero: HeroState | undefined) =>
      !hero?.heading && !hero?.subheading && !(hero?.slides?.length ?? 0);
    const isEmptyIntro = (intro: IntroState | undefined) =>
      !intro?.heading && !intro?.description && !intro?.imageUrl && !intro?.videoUrl;
    const isEmptyHighlights = (section: RecoveryState | undefined) =>
      !section?.heading && !section?.description && !(section?.items?.length ?? 0);
    const isEmptyServices = (section: ServicesState | undefined) =>
      !section?.heading && !section?.description && !(section?.items?.length ?? 0);
    const isEmptyRecovery = (section: RecoveryState | undefined) =>
      !section?.heading && !section?.description && !(section?.items?.length ?? 0);
    const isEmptyGallery = (section: GalleryState | undefined) =>
      !section?.heading && !section?.description && !(section?.items?.length ?? 0);
    const isEmptyReviews = (section: ReviewsState | undefined) =>
      !section?.heading && !section?.description && !(section?.items?.length ?? 0);
    const isEmptyMentions = (section: MentionsState | undefined) =>
      !section?.heading && !section?.description && !(section?.items?.length ?? 0);
    const isEmptyBlog = (section: BlogState | undefined) =>
      !section?.heading && !section?.description && !section?.featuredSlug;

    const load = async () => {
      try {
        const [meta, hero, intro, highlights, servicesData, recovery, gallery, reviews, mentions, blog] = await Promise.all([
          getHomeMeta(undefined, activeLang),
          getHomeHero(undefined, activeLang),
          getHomeIntro(undefined, activeLang),
          getHomeHighlights(undefined, activeLang),
          getHomeServices(undefined, activeLang),
          getHomeRecovery(undefined, activeLang),
          getHomeGallery(undefined, activeLang),
          getHomeReviews(undefined, activeLang),
          getHomeMentions(undefined, activeLang),
          getHomeBlog(undefined, activeLang),
        ]);
        if (cancelled) return;

        setMetaByLang((prev) => {
          if (hasDraft && !isEmptyMeta(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              metaTitle: meta?.metaTitle ?? "",
              metaDescription: meta?.metaDescription ?? "",
              canonical: meta?.canonical ?? "",
              robots: meta?.robots ?? "index,follow",
              ogTitle: meta?.ogTitle ?? "",
              ogDescription: meta?.ogDescription ?? "",
              ogImage: meta?.ogImage ?? "",
              schemaJson: meta?.schemaJson ? JSON.stringify(meta.schemaJson, null, 2) : "",
            },
          };
        });

        const fallbackSlides =
          hero?.slides && hero.slides.length
            ? hero.slides
            : (hero?.images ?? []).map((imageUrl) => ({
                imageUrl,
                heading: "",
                subheading: "",
                primaryCta: "",
                primaryLink: "",
                secondaryCta: "",
                secondaryLink: "",
              }));

        setHeroByLang((prev) => {
          if (hasDraft && !isEmptyHero(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: hero?.heading ?? "",
              subheading: hero?.subheading ?? "",
              slides: fallbackSlides,
            },
          };
        });

        setIntroByLang((prev) => {
          if (hasDraft && !isEmptyIntro(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: intro?.heading ?? "",
              description: intro?.description ?? "",
              imageUrl: intro?.imageUrl ?? "",
              videoUrl: intro?.videoUrl ?? "",
              providerName: intro?.providerName ?? "Tripadvisor",
              listingName: intro?.listingName ?? "Panda Spa",
              rating: intro?.rating ? String(intro.rating) : "5",
              reviews: intro?.reviews ? String(intro.reviews) : "",
              rankText: intro?.rankText ?? "",
              buttonLabel: intro?.buttonLabel ?? "SPA DA NANG",
              buttonLink: intro?.buttonLink ?? "",
            },
          };
        });

        setHighlightsByLang((prev) => {
          if (hasDraft && !isEmptyHighlights(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: highlights?.heading ?? "",
              description: highlights?.description ?? "",
              items: Array.isArray(highlights?.items)
                ? highlights.items.map((item) => ({
                    title: item?.title ?? "",
                    description: item?.description ?? "",
                    imageUrl: item?.imageUrl ?? "",
                  }))
                : [],
            },
          };
        });

        setServicesByLang((prev) => {
          if (hasDraft && !isEmptyServices(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: servicesData?.heading ?? "",
              description: servicesData?.description ?? "",
              items: Array.isArray(servicesData?.items)
                ? servicesData.items.map((item) => ({
                    serviceId: item?.serviceId ?? undefined,
                    imageUrl: item?.imageUrl ?? "",
                    label: item?.label ?? "",
                    priceNote: item?.priceNote ?? "",
                  }))
                : [],
            },
          };
        });

        setRecoveryByLang((prev) => {
          if (hasDraft && !isEmptyRecovery(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: recovery?.heading ?? "",
              description: recovery?.description ?? "",
              items: Array.isArray(recovery?.items)
                ? recovery.items.map((item) => ({
                    title: item?.title ?? "",
                    description: item?.description ?? "",
                    imageUrl: item?.imageUrl ?? "",
                  }))
                : [],
            },
          };
        });

        setGalleryByLang((prev) => {
          if (hasDraft && !isEmptyGallery(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: gallery?.heading ?? "",
              description: gallery?.description ?? "",
              items: Array.isArray(gallery?.items)
                ? gallery.items.map((item) => ({
                    imageUrl: item?.imageUrl ?? "",
                    caption: item?.caption ?? "",
                  }))
                : [],
            },
          };
        });

        setReviewsByLang((prev) => {
          if (hasDraft && !isEmptyReviews(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: reviews?.heading ?? "",
              description: reviews?.description ?? "",
              items: Array.isArray(reviews?.items)
                ? reviews.items.map((item) => ({
                    name: item?.name ?? "",
                    contributions: item?.contributions ?? "",
                    rating: item?.rating ?? 5,
                    review: item?.review ?? "",
                    visit: item?.visit ?? "",
                    tag: item?.tag ?? "",
                    avatarUrl: item?.avatarUrl ?? "",
                  }))
                : [],
            },
          };
        });

        setMentionsByLang((prev) => {
          if (hasDraft && !isEmptyMentions(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: mentions?.heading ?? "",
              description: mentions?.description ?? "",
              items: Array.isArray(mentions?.items)
                ? mentions.items.map((item) => ({
                    name: item?.name ?? "",
                    imageUrl: item?.imageUrl ?? "",
                    link: item?.link ?? "",
                  }))
                : [],
            },
          };
        });

        setBlogByLang((prev) => {
          if (hasDraft && !isEmptyBlog(prev[activeLang])) return prev;
          return {
            ...prev,
            [activeLang]: {
              heading: blog?.heading ?? "",
              description: blog?.description ?? "",
              featuredSlug: blog?.featuredSlug ?? "",
            },
          };
        });

        setLoadedLangs((prev) => ({ ...prev, [activeLang]: true }));
      } catch (err) {
        handleError(err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeLang, loadedLangs, hasDraft]);

  useEffect(() => {
    let cancelled = false;
    const loadStatus = async () => {
      try {
        const response = await getHomeStatus(undefined);
        if (cancelled) return;
        if (!isDirty) {
          setStatus(response.status);
        }
      } catch (err) {
        handleError(err);
      }
    };
    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [isDirty]);
};
