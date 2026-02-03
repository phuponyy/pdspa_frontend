"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/common/ToastProvider";
import { getHomeSectionsOrder, updateHomeStatus, getAdminServices } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { useAdminQuery } from "@/lib/api/adminHooks";
import type { SchemaTemplateType } from "@/lib/seo/seoUtils";
import {
  defaultHighlightsByLang,
  defaultHeroByLang,
  defaultIntroByLang,
  defaultMetaByLang,
  defaultRecoveryByLang,
  defaultSchemaFaqByLang,
  defaultSchemaOrgByLang,
  defaultSchemaTemplateByLang,
  defaultSectionOrder,
  defaultServicesByLang,
  languages,
  storageKey,
} from "@/components/admin/page-editor/defaults";
import type {
  MetaState,
  HeroState,
  IntroState,
  RecoveryState,
  RecoveryItem,
  ServicesState,
} from "@/components/admin/page-editor/types";
import { usePageEditorDraft } from "@/components/admin/page-editor/hooks/usePageEditorDraft";
import { usePageEditorLoad } from "@/components/admin/page-editor/hooks/usePageEditorLoad";
import { usePageEditorMedia } from "@/components/admin/page-editor/hooks/usePageEditorMedia";
import type { AdminService } from "@/types/api.types";
import { pageEditorSectionNav } from "@/components/admin/page-editor/sectionNav";
import HeroSection from "@/components/admin/page-editor/sections/HeroSection";
import IntroSection from "@/components/admin/page-editor/sections/IntroSection";
import ServicesSection from "@/components/admin/page-editor/sections/ServicesSection";
import HighlightsSection from "@/components/admin/page-editor/sections/HighlightsSection";
import RecoverySection from "@/components/admin/page-editor/sections/RecoverySection";
import SeoSchemaSection from "@/components/admin/page-editor/sections/SeoSchemaSection";
import SectionOrderSection from "@/components/admin/page-editor/sections/SectionOrderSection";
import MediaDialog from "@/components/admin/page-editor/sections/MediaDialog";
import StatusBar from "@/components/admin/page-editor/sections/StatusBar";
import FloatingBar from "@/components/admin/page-editor/sections/FloatingBar";
import PageEditorSidebar from "@/components/admin/page-editor/sections/PageEditorSidebar";

export default function PageEditor({ lang }: { lang: string }) {
  const isLang = (value: string | null): value is "vi" | "en" =>
    value === "vi" || value === "en";
  const searchParams = useSearchParams();
  const requestedLang = searchParams.get("lang");
  const initialLang = isLang(requestedLang) ? requestedLang : (lang as "vi" | "en");
  const [activeLang, setActiveLang] = useState<"vi" | "en">(initialLang);
  const [metaByLang, setMetaByLang] = useState<Record<string, MetaState>>(
    () => defaultMetaByLang
  );
  const [heroByLang, setHeroByLang] = useState<Record<string, HeroState>>(
    () => defaultHeroByLang
  );
  const [introByLang, setIntroByLang] = useState<Record<string, IntroState>>(
    () => defaultIntroByLang
  );
  const [recoveryByLang, setRecoveryByLang] = useState<Record<string, RecoveryState>>(
    () => defaultRecoveryByLang
  );
  const [highlightsByLang, setHighlightsByLang] = useState<Record<string, RecoveryState>>(
    () => defaultHighlightsByLang
  );
  const [servicesByLang, setServicesByLang] = useState<Record<string, ServicesState>>(
    () => defaultServicesByLang
  );
  const [sectionOrder, setSectionOrder] = useState<string[]>(defaultSectionOrder);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggingSection, setDraggingSection] = useState<string | null>(null);
  const [focusKeywordByLang, setFocusKeywordByLang] = useState<Record<string, string>>(
    () => ({
      vi: "",
      en: "",
    })
  );
  const [schemaTemplateByLang, setSchemaTemplateByLang] = useState<
    Record<string, SchemaTemplateType>
  >(() => defaultSchemaTemplateByLang as Record<string, SchemaTemplateType>);
  const [schemaOrgByLang, setSchemaOrgByLang] = useState<Record<string, string>>(
    () => defaultSchemaOrgByLang
  );
  const [schemaFaqByLang, setSchemaFaqByLang] = useState<
    Record<string, { question: string; answer: string }[]>
  >(() => defaultSchemaFaqByLang);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [loadedLangs, setLoadedLangs] = useState<Record<string, boolean>>({
    vi: false,
    en: false,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const toast = useToast();

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message: text, type });
  };

  const getServiceName = (service: AdminService | undefined, code: "vi" | "en") => {
    if (!service) return "";
    const matched = service.translations?.find((item) => item.langCode === code);
    return matched?.name || service.translations?.[0]?.name || service.key || "";
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.", "error");
      return;
    }
    notify("Unable to reach the server. Please try again.", "error");
  };

  const {
    mediaDialogOpen,
    setMediaDialogOpen,
    mediaQuery,
    setMediaQuery,
    mediaTarget,
    setMediaTarget,
    mediaItems,
  } = usePageEditorMedia();

  const servicesQuery = useAdminQuery({
    queryKey: ["admin-services"],
    queryFn: () => getAdminServices(undefined),
    staleTime: 60_000,
    toastOnError: false,
  });
  const adminServices = servicesQuery.data?.data ?? [];

  const sectionOrderQuery = useAdminQuery({
    queryKey: ["admin-home-sections-order"],
    queryFn: () => getHomeSectionsOrder(undefined),
    staleTime: 60_000,
    toastOnError: false,
  });

  const handleSchemaJsonError = () => {
    notify("Schema JSON không hợp lệ. Vui lòng kiểm tra lại.", "error");
  };

  const { hasDraft, setHasDraft } = usePageEditorDraft({
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
    setFocusKeywordByLang,
    setSchemaTemplateByLang,
    setSchemaOrgByLang,
    setSchemaFaqByLang,
    setSectionOrder,
    setStatus,
  });

  usePageEditorLoad({
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
    setStatus,
    handleError,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== activeLang) {
      url.searchParams.set("lang", activeLang);
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeLang]);

  useEffect(() => {
    if (sectionOrderQuery.data?.data?.length) {
      const ordered = sectionOrderQuery.data.data
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) => item.key);
      const merged = [
        ...ordered,
        ...defaultSectionOrder.filter((key) => !ordered.includes(key)),
      ];
      setSectionOrder(merged);
      return;
    }
    if (!sectionOrderQuery.isLoading && sectionOrder.length === 0) {
      setSectionOrder(defaultSectionOrder);
    }
  }, [
    sectionOrderQuery.data,
    sectionOrderQuery.isLoading,
    defaultSectionOrder,
    sectionOrder.length,
  ]);

  useEffect(() => {
    const target = headerRef.current;
    if (!target || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingBar(!entry.isIntersecting);
      },
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const currentMeta = metaByLang[activeLang] || {
    metaTitle: "",
    metaDescription: "",
    canonical: "",
    robots: "index,follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    schemaJson: "",
  };
  const focusKeyword = focusKeywordByLang[activeLang] || "";
  const schemaTemplate = schemaTemplateByLang[activeLang] || "WebPage";
  const schemaOrg = schemaOrgByLang[activeLang] || "";
  const schemaFaqItems = schemaFaqByLang[activeLang] || [];
  const siteBase =
    typeof window !== "undefined" ? window.location.origin : "";
  const serpUrl =
    currentMeta.canonical ||
    (siteBase ? `${siteBase}/` : "https://example.com");

  const seoContent = useMemo(() => {
    const hero = heroByLang[activeLang];
    const intro = introByLang[activeLang];
    const highlights = highlightsByLang[activeLang];
    const services = servicesByLang[activeLang];
    const recovery = recoveryByLang[activeLang];
    return [
      hero?.heading,
      hero?.subheading,
      intro?.heading,
      intro?.description,
      services?.heading,
      services?.description,
      ...(services?.items || []).map((item) => item.label || item.priceNote),
      highlights?.heading,
      highlights?.description,
      ...(highlights?.items || []).map((item) => item.title || item.description),
      recovery?.heading,
      ...(recovery?.items || []).map((item) => item.title || item.description),
    ]
      .filter(Boolean)
      .join(" ");
  }, [
    activeLang,
    heroByLang,
    introByLang,
    highlightsByLang,
    servicesByLang,
    recoveryByLang,
  ]);

  const currentHero = heroByLang[activeLang] || {
    heading: "",
    subheading: "",
    slides: [],
  };
  const currentIntro = introByLang[activeLang] || {
    heading: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    providerName: "Tripadvisor",
    listingName: "Panda Spa",
    rating: "5",
    reviews: "",
    rankText: "",
    buttonLabel: "SPA DA NANG",
    buttonLink: "",
  };
  const currentHighlights =
    highlightsByLang[activeLang] || ({ heading: "", description: "", items: [] } as RecoveryState);
  const currentServices =
    servicesByLang[activeLang] || ({ heading: "", description: "", items: [] } as ServicesState);
  const currentRecovery =
    recoveryByLang[activeLang] || ({ heading: "", description: "", items: [] } as RecoveryState);

  const persistStatus = async (nextStatus: "DRAFT" | "PUBLISHED") => {
    const previousStatus = status;
    setStatus(nextStatus);
    setIsSavingStatus(true);
    try {
      await updateHomeStatus(undefined, { status: nextStatus });
      notify(`Homepage status updated to ${nextStatus}.`, "success");
    } catch (err) {
      setStatus(previousStatus);
      handleError(err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const discardChanges = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
    setHasDraft(false);
    setIsDirty(false);
    window.location.reload();
  };

  const ensureRecoveryItems = (items: RecoveryItem[]) => {
    const next = [...items];
    while (next.length < 3) {
      next.push({ title: "", description: "", imageUrl: "" });
    }
    return next.slice(0, 3);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div ref={headerRef} className="h-px" />


        <HeroSection
          activeLang={activeLang}
          currentHero={currentHero}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          setHeroByLang={setHeroByLang}
          setIsDirty={setIsDirty}
          notify={notify}
          handleError={handleError}
        />

        <IntroSection
          activeLang={activeLang}
          currentIntro={currentIntro}
          setIntroByLang={setIntroByLang}
          setIsDirty={setIsDirty}
          notify={notify}
          handleError={handleError}
        />

        <ServicesSection
          activeLang={activeLang}
          currentServices={currentServices}
          adminServices={adminServices}
          getServiceName={getServiceName}
          setServicesByLang={setServicesByLang}
          setIsDirty={setIsDirty}
          setMediaTarget={setMediaTarget}
          setMediaDialogOpen={setMediaDialogOpen}
          notify={notify}
          handleError={handleError}
        />



        <HighlightsSection
          activeLang={activeLang}
          currentHighlights={currentHighlights}
          ensureRecoveryItems={ensureRecoveryItems}
          setHighlightsByLang={setHighlightsByLang}
          setIsDirty={setIsDirty}
          setMediaTarget={setMediaTarget}
          setMediaDialogOpen={setMediaDialogOpen}
          notify={notify}
          handleError={handleError}
        />

        <RecoverySection
          activeLang={activeLang}
          currentRecovery={currentRecovery}
          ensureRecoveryItems={ensureRecoveryItems}
          setRecoveryByLang={setRecoveryByLang}
          setIsDirty={setIsDirty}
          setMediaTarget={setMediaTarget}
          setMediaDialogOpen={setMediaDialogOpen}
          notify={notify}
          handleError={handleError}
        />

        <StatusBar
          mounted={mounted}
          status={status}
          isSavingStatus={isSavingStatus}
          persistStatus={persistStatus}
          discardChanges={discardChanges}
        />
      </div>

      <PageEditorSidebar
        sectionNav={pageEditorSectionNav}
        languages={languages}
        activeLang={activeLang}
        status={status}
        isSavingStatus={isSavingStatus}
        onLangChange={(code) => {
          setActiveLang(code);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", code);
            window.history.replaceState(null, "", url.toString());
          }
        }}
        persistStatus={persistStatus}
      >
        <SeoSchemaSection
          activeLang={activeLang}
          lang={lang as "vi" | "en"}
          currentMeta={currentMeta}
          focusKeyword={focusKeyword}
          seoContent={seoContent}
          serpUrl={serpUrl}
          schemaTemplate={schemaTemplate}
          schemaOrg={schemaOrg}
          schemaFaqItems={schemaFaqItems}
          heroHeading={heroByLang[activeLang]?.heading || ""}
          setFocusKeywordByLang={setFocusKeywordByLang}
          setSchemaTemplateByLang={setSchemaTemplateByLang}
          setSchemaOrgByLang={setSchemaOrgByLang}
          setSchemaFaqByLang={setSchemaFaqByLang}
          setMetaByLang={setMetaByLang}
          setIsDirty={setIsDirty}
          notify={notify}
          handleError={handleError}
          handleSchemaJsonError={handleSchemaJsonError}
          onCloneFromLang={() => {
            setMetaByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[lang] },
            }));
            setHeroByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[lang] },
            }));
            setIsDirty(true);
          }}
        />

        <SectionOrderSection
          sectionOrder={sectionOrder}
          draggingSection={draggingSection}
          setSectionOrder={setSectionOrder}
          setDraggingSection={setDraggingSection}
          setIsDirty={setIsDirty}
          isSavingOrder={isSavingOrder}
          setIsSavingOrder={setIsSavingOrder}
          notify={notify}
          handleError={handleError}
        />
      </PageEditorSidebar>
      <MediaDialog
        activeLang={activeLang}
        mediaDialogOpen={mediaDialogOpen}
        mediaQuery={mediaQuery}
        mediaItems={mediaItems}
        mediaTarget={mediaTarget}
        setMediaDialogOpen={setMediaDialogOpen}
        setMediaQuery={setMediaQuery}
        setMediaTarget={setMediaTarget}
        setHighlightsByLang={setHighlightsByLang}
        setServicesByLang={setServicesByLang}
        setRecoveryByLang={setRecoveryByLang}
        ensureRecoveryItems={ensureRecoveryItems}
        setIsDirty={setIsDirty}
      />
      <FloatingBar
        showFloatingBar={showFloatingBar}
        activeLang={activeLang}
        status={status}
        isDirty={isDirty}
        isSavingStatus={isSavingStatus}
        currentTitle={currentMeta.metaTitle || "Homepage"}
        languages={languages}
        persistStatus={persistStatus}
        onChangeLang={(code: "vi" | "en") => {
          setActiveLang(code);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", code);
            window.history.replaceState(null, "", url.toString());
          }
        }}
      />
    </div>
  );
}
