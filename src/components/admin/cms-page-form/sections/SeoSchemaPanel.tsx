import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import {
  analyzeSeo,
  buildSchemaTemplate,
  generateSeoFromContent,
  type SchemaTemplateType,
} from "@/lib/seo/seoUtils";
import type { CmsPageTranslation } from "../types";

export type SeoSchemaPanelProps = {
  activeLang: string;
  current: CmsPageTranslation;
  focusKeyword: string;
  setFocusKeyword: (value: string) => void;
  schemaTemplate: SchemaTemplateType;
  setSchemaTemplate: (value: SchemaTemplateType) => void;
  schemaOrg: string;
  setSchemaOrg: (value: string) => void;
  schemaFaqItems: { question: string; answer: string }[];
  setSchemaFaqItems: (value: { question: string; answer: string }[]) => void;
  siteBase: string;
  setDirty: (value: boolean) => void;
  onChange: (next: Partial<CmsPageTranslation>) => void;
};

export const SeoSchemaPanel = ({
  activeLang,
  current,
  focusKeyword,
  setFocusKeyword,
  schemaTemplate,
  setSchemaTemplate,
  schemaOrg,
  setSchemaOrg,
  schemaFaqItems,
  setSchemaFaqItems,
  siteBase,
  setDirty,
  onChange,
}: SeoSchemaPanelProps) => {
  const serpUrl = current.canonical
    ? current.canonical
    : current.slug
    ? `${siteBase}/${current.slug}`
    : siteBase || "https://example.com";

  const seoAnalysis = analyzeSeo({
    title: current.seoTitle || current.title,
    slug: current.slug,
    description: current.seoDescription || "",
    contentHtml: current.content,
    focusKeyword,
  });

  const seoScore = Math.max(0, Math.min(100, seoAnalysis.score));
  const seoRadius = 26;
  const seoCircumference = 2 * Math.PI * seoRadius;
  const seoDashOffset = seoCircumference * (1 - seoScore / 100);

  const applySchema = () => {
    const schema = buildSchemaTemplate({
      type: schemaTemplate,
      title: current.seoTitle || current.title,
      description: current.seoDescription || "",
      url: serpUrl,
      image: current.ogImage || "",
      organization: schemaOrg,
      faqItems: schemaFaqItems,
    });
    setDirty(true);
    onChange({ schemaJson: JSON.stringify(schema, null, 2) });
  };

  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">SEO & Schema</p>
        <span className="text-[10px] text-[var(--ink-muted)]">RankMath style</span>
      </div>
      <div className="mt-3 grid gap-3">
        <Input
          label="Focus keyword"
          value={focusKeyword}
          onChange={(event) => setFocusKeyword(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const generated = generateSeoFromContent({
                title: current.title,
                contentHtml: current.content,
              });
              setDirty(true);
              onChange({
                seoTitle: generated.seoTitle,
                seoDescription: generated.seoDescription,
                ogTitle: generated.ogTitle,
                ogDescription: generated.ogDescription,
              });
            }}
          >
            Auto generate SEO
          </Button>
          <span className="text-[10px] text-[var(--ink-muted)]">Tự động lấy từ nội dung</span>
        </div>
        <Input
          label="SEO Title"
          value={current.seoTitle || ""}
          onChange={(event) => {
            setDirty(true);
            onChange({ seoTitle: event.target.value });
          }}
        />
        <Textarea
          label="SEO Description"
          value={current.seoDescription || ""}
          onChange={(event) => {
            setDirty(true);
            onChange({ seoDescription: event.target.value });
          }}
          className="min-h-[90px]"
        />
        <Input
          label="Canonical URL"
          value={current.canonical || ""}
          onChange={(event) => {
            setDirty(true);
            onChange({ canonical: event.target.value });
          }}
        />
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
          Robots
          <select
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
            value={current.robots || "index,follow"}
            onChange={(event) => {
              setDirty(true);
              onChange({ robots: event.target.value });
            }}
          >
            <option value="index,follow">index,follow</option>
            <option value="noindex,follow">noindex,follow</option>
            <option value="noindex,nofollow">noindex,nofollow</option>
          </select>
        </label>
        <Input
          label="OG Title"
          value={current.ogTitle || ""}
          onChange={(event) => {
            setDirty(true);
            onChange({ ogTitle: event.target.value });
          }}
        />
        <Textarea
          label="OG Description"
          value={current.ogDescription || ""}
          onChange={(event) => {
            setDirty(true);
            onChange({ ogDescription: event.target.value });
          }}
          className="min-h-[90px]"
        />
        <Input
          label="OG Image"
          value={current.ogImage || ""}
          onChange={(event) => {
            setDirty(true);
            onChange({ ogImage: event.target.value });
          }}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f1722] p-4 text-white seo-panel">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">SEO Score</p>
            <p className="text-sm text-white/70">Phân tích realtime</p>
          </div>
          <div className="seo-score-ring">
            <svg width="64" height="64">
              <circle
                className="ring-track"
                cx="32"
                cy="32"
                r={seoRadius}
                fill="none"
                strokeWidth="6"
              />
              <circle
                className="ring-progress"
                cx="32"
                cy="32"
                r={seoRadius}
                fill="none"
                strokeWidth="6"
                strokeDasharray={seoCircumference}
                strokeDashoffset={seoDashOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="seo-score-value">{seoScore}</span>
          </div>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          {seoAnalysis.checks.map((check, index) => (
            <div
              key={check.label}
              className="flex items-center gap-2 seo-checklist-item"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  check.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}
              >
                {check.ok ? "✓" : "!"}
              </span>
              <span className="text-white/80">{check.label}</span>
              {check.hint ? (
                <span className="ml-auto text-[10px] text-white/40">{check.hint}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">SERP Preview</p>
        <div className="mt-3 space-y-1">
          <p className="text-sm font-semibold text-[#1a73e8]">
            {current.seoTitle || current.title || "SEO title"}
          </p>
          <p className="text-xs text-emerald-700">{serpUrl}</p>
          <p className="text-xs text-[var(--ink-muted)]">
            {current.seoDescription || "Meta description sẽ hiển thị ở đây."}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4 seo-panel">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">Schema Builder</p>
        <div className="mt-3 grid gap-3">
          <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Template
            <select
              className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
              value={schemaTemplate}
              onChange={(event) => setSchemaTemplate(event.target.value as SchemaTemplateType)}
            >
              <option value="WebPage">WebPage</option>
              <option value="Article">Article</option>
              <option value="FAQPage">FAQPage</option>
              <option value="LocalBusiness">LocalBusiness</option>
              <option value="Service">Service</option>
            </select>
          </label>
          <Input
            label="Organization"
            value={schemaOrg}
            onChange={(event) => setSchemaOrg(event.target.value)}
          />
          {schemaTemplate === "FAQPage" ? (
            <div className="space-y-2">
              {schemaFaqItems.map((item, index) => (
                <div key={`faq-${index}`} className="grid gap-2 rounded-xl border border-[var(--line)] p-2">
                  <Input
                    label={`Question ${index + 1}`}
                    value={item.question}
                    onChange={(event) => {
                      const next = [...schemaFaqItems];
                      next[index] = { ...next[index], question: event.target.value };
                      setSchemaFaqItems(next);
                    }}
                  />
                  <Textarea
                    label="Answer"
                    value={item.answer}
                    onChange={(event) => {
                      const next = [...schemaFaqItems];
                      next[index] = { ...next[index], answer: event.target.value };
                      setSchemaFaqItems(next);
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setSchemaFaqItems([...schemaFaqItems, { question: "", answer: "" }])}
              >
                Thêm câu hỏi
              </Button>
            </div>
          ) : null}
          <div className="rounded-xl border border-[var(--line)] bg-[#0f1722] p-3 text-xs text-white/80">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(
                buildSchemaTemplate({
                  type: schemaTemplate,
                  title: current.seoTitle || current.title,
                  description: current.seoDescription || "",
                  url: serpUrl,
                  image: current.ogImage || "",
                  organization: schemaOrg,
                  faqItems: schemaFaqItems,
                }),
                null,
                2
              )}
            </pre>
          </div>
          <Button onClick={applySchema}>Áp dụng schema</Button>
          <Textarea
            label="Schema JSON (có thể chỉnh sửa)"
            value={current.schemaJson || ""}
            onChange={(event) => {
              setDirty(true);
              onChange({ schemaJson: event.target.value });
            }}
            className="min-h-[160px]"
          />
        </div>
      </div>
    </div>
  );
};
