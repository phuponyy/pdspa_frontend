import type { RefObject } from "react";
import CmsPostHeader, {
  type CmsPostHeaderProps,
} from "@/components/admin/cms-post-form/sections/CmsPostHeader";
import PostContentSection, {
  type PostContentSectionProps,
} from "@/components/admin/cms-post-form/sections/PostContentSection";
import TaxonomyPanel, {
  type TaxonomyPanelProps,
} from "@/components/admin/cms-post-form/sections/TaxonomyPanel";
import ThumbnailPanel, {
  type ThumbnailPanelProps,
} from "@/components/admin/cms-post-form/sections/ThumbnailPanel";
import SeoSchemaPanel, {
  type SeoSchemaPanelProps,
} from "@/components/admin/cms-post-form/sections/SeoSchemaPanel";
import MediaDialog from "@/components/admin/cms-post-form/sections/MediaDialog";
import CmsPostFloatingBar, {
  type CmsPostFloatingBarProps,
} from "@/components/admin/cms-post-form/sections/CmsPostFloatingBar";
import type { SchemaTemplateType } from "@/lib/seo/seoUtils";
import type { CmsPostTranslationState } from "@/components/admin/cms-post-form/types";
import type { useCmsPostTaxonomy } from "@/components/admin/cms-post-form/hooks/useCmsPostTaxonomy";
import type { useCmsPostMedia } from "@/components/admin/cms-post-form/hooks/useCmsPostMedia";
import type { useCmsPostSeo } from "@/components/admin/cms-post-form/hooks/useCmsPostSeo";

type CmsPostTaxonomyState = ReturnType<typeof useCmsPostTaxonomy>;
type CmsPostMediaState = ReturnType<typeof useCmsPostMedia>;
type CmsPostSeoMetrics = ReturnType<typeof useCmsPostSeo>;

export type CmsPostFormViewProps = {
  headerRef: RefObject<HTMLDivElement | null>;
  header: CmsPostHeaderProps;
  content: PostContentSectionProps;
  taxonomy: CmsPostTaxonomyState;
  thumbnail: ThumbnailPanelProps;
  seo: {
    current: CmsPostTranslationState;
    focusKeyword: string;
    schemaTemplate: SchemaTemplateType;
    schemaOrg: string;
    schemaFaqItems: { question: string; answer: string }[];
    metrics: CmsPostSeoMetrics;
    onFocusKeywordChange: (value: string) => void;
    onSeoFieldChange: (patch: Partial<CmsPostTranslationState>) => void;
    onOpenMediaPicker: () => void;
    onClearOgImage: () => void;
    onSchemaTemplateChange: (value: SchemaTemplateType) => void;
    onSchemaOrgChange: (value: string) => void;
    onSchemaFaqItemsChange: (next: { question: string; answer: string }[]) => void;
    onApplySchema: () => void;
    onSchemaJsonChange: (value: string) => void;
  };
  media: CmsPostMediaState;
  floatingBar: CmsPostFloatingBarProps;
};

export default function CmsPostFormView({
  headerRef,
  header,
  content,
  taxonomy,
  thumbnail,
  seo,
  media,
  floatingBar,
}: CmsPostFormViewProps) {
  const taxonomyProps: TaxonomyPanelProps = {
    categories: taxonomy.categories,
    tags: taxonomy.tags,
    selectedCategoryIds: taxonomy.selectedCategoryIds,
    selectedTagIds: taxonomy.selectedTagIds,
    filteredCategories: taxonomy.filteredCategories,
    filteredTags: taxonomy.filteredTags,
    newCategory: taxonomy.newCategory,
    newTag: taxonomy.newTag,
    categoryQuery: taxonomy.categoryQuery,
    tagQuery: taxonomy.tagQuery,
    setCategoryQuery: taxonomy.setCategoryQuery,
    setTagQuery: taxonomy.setTagQuery,
    setNewCategory: taxonomy.setNewCategory,
    setNewTag: taxonomy.setNewTag,
    onToggleCategory: taxonomy.toggleCategory,
    onToggleTag: taxonomy.toggleTag,
    onCreateCategory: taxonomy.handleCreateCategory,
    onCreateTag: taxonomy.handleCreateTag,
    onCreateCategoryKey: taxonomy.handleCreateCategoryKey,
    onCreateTagKey: taxonomy.handleCreateTagKey,
  };

  const seoProps: SeoSchemaPanelProps = {
    current: seo.current,
    focusKeyword: seo.focusKeyword,
    seoAnalysis: seo.metrics.seoAnalysis,
    seoScore: seo.metrics.seoScore,
    seoRadius: seo.metrics.seoRadius,
    seoCircumference: seo.metrics.seoCircumference,
    seoDashOffset: seo.metrics.seoDashOffset,
    serpUrl: seo.metrics.serpUrl,
    schemaTemplate: seo.schemaTemplate,
    schemaOrg: seo.schemaOrg,
    schemaFaqItems: seo.schemaFaqItems,
    onFocusKeywordChange: seo.onFocusKeywordChange,
    onSeoFieldChange: seo.onSeoFieldChange,
    onOpenMediaPicker: seo.onOpenMediaPicker,
    onClearOgImage: seo.onClearOgImage,
    onSchemaTemplateChange: seo.onSchemaTemplateChange,
    onSchemaOrgChange: seo.onSchemaOrgChange,
    onSchemaFaqItemsChange: seo.onSchemaFaqItemsChange,
    onApplySchema: seo.onApplySchema,
    onSchemaJsonChange: seo.onSchemaJsonChange,
  };

  return (
    <div className="space-y-6">
      <div ref={headerRef}>
        <CmsPostHeader {...header} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <PostContentSection {...content} />
        <aside className="space-y-4">
          <TaxonomyPanel {...taxonomyProps} />
          <ThumbnailPanel {...thumbnail} />
          <SeoSchemaPanel {...seoProps} />
        </aside>
      </div>
      <MediaDialog
        open={media.mediaDialogOpen}
        onOpenChange={media.setMediaDialogOpen}
        onPick={(item) => media.handleSelectMedia(item.url)}
        pickLabel="Chọn ảnh"
      />
      <CmsPostFloatingBar {...floatingBar} />
    </div>
  );
}
