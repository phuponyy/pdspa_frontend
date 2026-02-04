import { useMemo } from "react";
import { analyzeSeo } from "@/lib/seo/seoUtils";
import type {
  CmsPostTranslationState,
  SeoAnalysis,
} from "@/components/admin/cms-post-form/types";

type SeoHookParams = {
  current: CmsPostTranslationState;
  focusKeyword: string;
};

export const useCmsPostSeo = ({ current, focusKeyword }: SeoHookParams) => {
  const siteBase = typeof window !== "undefined" ? window.location.origin : "";
  const serpUrl = current.canonical
    ? current.canonical
    : current.slug
    ? `${siteBase}/tin-tuc/${current.slug}`
    : siteBase || "https://example.com";

  const seoAnalysis = useMemo(
    () =>
      analyzeSeo({
        title: current.seoTitle || current.title,
        slug: current.slug,
        description: current.seoDescription || "",
        contentHtml: current.content,
        focusKeyword,
      }),
    [current.content, current.seoDescription, current.seoTitle, current.slug, current.title, focusKeyword]
  ) as SeoAnalysis;

  const seoScore = Math.max(0, Math.min(100, seoAnalysis.score));
  const seoRadius = 26;
  const seoCircumference = 2 * Math.PI * seoRadius;
  const seoDashOffset = seoCircumference * (1 - seoScore / 100);

  return {
    seoAnalysis,
    seoScore,
    seoRadius,
    seoCircumference,
    seoDashOffset,
    serpUrl,
  };
};
