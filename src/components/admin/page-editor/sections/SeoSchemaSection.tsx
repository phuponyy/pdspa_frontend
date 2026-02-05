import AdminTextarea from "@/components/admin/ui/AdminTextarea";
import { getHomeMeta, updateHomeMeta } from "@/lib/api/admin";
import { analyzeSeo, buildSchemaTemplate, generateSeoFromContent, type SchemaTemplateType } from "@/lib/seo/seoUtils";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type { MetaState } from "@/components/admin/page-editor/types";
import { parseSchemaJson } from "@/components/admin/page-editor/utils";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";

export type SeoSchemaSectionProps = {
  activeLang: "vi" | "en";
  lang: "vi" | "en";
  currentMeta: MetaState;
  focusKeyword: string;
  seoContent: string;
  serpUrl: string;
  schemaTemplate: SchemaTemplateType;
  schemaOrg: string;
  schemaFaqItems: { question: string; answer: string }[];
  heroHeading: string;
  setFocusKeywordByLang: Dispatch<SetStateAction<Record<string, string>>>;
  setSchemaTemplateByLang: Dispatch<SetStateAction<Record<string, SchemaTemplateType>>>;
  setSchemaOrgByLang: Dispatch<SetStateAction<Record<string, string>>>;
  setSchemaFaqByLang: Dispatch<SetStateAction<Record<string, { question: string; answer: string }[]>>>;
  setMetaByLang: Dispatch<SetStateAction<Record<string, MetaState>>>;
  setIsDirty: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
  handleSchemaJsonError: () => void;
  onCloneFromLang?: () => void;
};

export default function SeoSchemaSection({
  activeLang,
  lang,
  currentMeta,
  focusKeyword,
  seoContent,
  serpUrl,
  schemaTemplate,
  schemaOrg,
  schemaFaqItems,
  heroHeading,
  setFocusKeywordByLang,
  setSchemaTemplateByLang,
  setSchemaOrgByLang,
  setSchemaFaqByLang,
  setMetaByLang,
  setIsDirty,
  notify,
  handleError,
  handleSchemaJsonError,
  onCloneFromLang,
}: SeoSchemaSectionProps) {
  const seoAnalysis = analyzeSeo({
    title: currentMeta.metaTitle,
    slug: "",
    description: currentMeta.metaDescription || "",
    contentHtml: seoContent,
    focusKeyword,
  });
  const seoScore = Math.max(0, Math.min(100, seoAnalysis.score));
  const seoRadius = 26;
  const seoCircumference = 2 * Math.PI * seoRadius;
  const seoDashOffset = seoCircumference * (1 - seoScore / 100);

  return (
    <section
      id="seo"
      className="rounded-[28px] border border-white/10 bg-[#0b1220] p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff8a4b]/15 text-[#ff8a4b]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h10M4 18h7" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">SEO Metadata</p>
            <p className="text-sm text-white/60">Tối ưu hóa khả năng hiển thị tìm kiếm.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <button type="button" className="rounded-full p-2 hover:bg-white/5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5c4.5 0 8.3 2.9 9.5 7-1.2 4.1-5 7-9.5 7S3.7 16.1 2.5 12C3.7 7.9 7.5 5 12 5z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button type="button" className="rounded-full p-2 text-rose-400 hover:bg-white/5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M6 6l1 14h10l1-14" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <AdminInput
          label="Focus keyword"
          placeholder="Ví dụ: massage Đà Nẵng"
          value={focusKeyword}
          onChange={(event) =>
            setFocusKeywordByLang((prev) => ({
              ...prev,
              [activeLang]: event.target.value,
            }))
          }
        />
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton
            variant="outline"
            onClick={() => {
              const generated = generateSeoFromContent({
                title: currentMeta.metaTitle || heroHeading || "Panda Spa",
                contentHtml: seoContent,
              });
              setIsDirty(true);
              setMetaByLang((prev) => ({
                ...prev,
                [activeLang]: {
                  ...prev[activeLang],
                  metaTitle: generated.seoTitle,
                  metaDescription: generated.seoDescription,
                  ogTitle: generated.ogTitle,
                  ogDescription: generated.ogDescription,
                },
              }));
            }}
          >
            Auto generate SEO
          </AdminButton>
          <span className="text-xs text-white/50">
            Tự động lấy từ nội dung trang
          </span>
        </div>
        <AdminInput
          label="Meta title"
          placeholder="Tiêu đề tối ưu SEO..."
          value={currentMeta.metaTitle}
          onChange={(event) => {
            setIsDirty(true);
            setMetaByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                metaTitle: event.target.value,
              },
            }));
          }}
        />
        <AdminTextarea
          label="Meta description"
          placeholder="Mô tả ngắn (150-160 ký tự) hiển thị trên Google."
          value={currentMeta.metaDescription}
          onChange={(event) => {
            setIsDirty(true);
            setMetaByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                metaDescription: event.target.value,
              },
            }));
          }}
        />
        <AdminInput
          label="Canonical URL"
          placeholder="https://example.com"
          value={currentMeta.canonical}
          onChange={(event) => {
            setIsDirty(true);
            setMetaByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                canonical: event.target.value,
              },
            }));
          }}
        />
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-white/60">
          Robots
          <select
            className="h-12 rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white"
            value={currentMeta.robots || "index,follow"}
            onChange={(event) => {
              setIsDirty(true);
              setMetaByLang((prev) => ({
                ...prev,
                [activeLang]: {
                  ...prev[activeLang],
                  robots: event.target.value,
                },
              }));
            }}
          >
            <option value="index,follow">index,follow</option>
            <option value="noindex,follow">noindex,follow</option>
            <option value="noindex,nofollow">noindex,nofollow</option>
          </select>
        </label>
        <AdminInput
          label="OG Title"
          placeholder="Tiêu đề hiển thị khi chia sẻ..."
          value={currentMeta.ogTitle}
          onChange={(event) => {
            setIsDirty(true);
            setMetaByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                ogTitle: event.target.value,
              },
            }));
          }}
        />
        <AdminTextarea
          label="OG Description"
          placeholder="Mô tả hiển thị khi chia sẻ..."
          value={currentMeta.ogDescription}
          onChange={(event) => {
            setIsDirty(true);
            setMetaByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                ogDescription: event.target.value,
              },
            }));
          }}
        />
        <AdminInput
          label="OG Image"
          placeholder="/uploads/media/og-image.jpg"
          value={currentMeta.ogImage}
          onChange={(event) => {
            setIsDirty(true);
            setMetaByLang((prev) => ({
              ...prev,
              [activeLang]: {
                ...prev[activeLang],
                ogImage: event.target.value,
              },
            }));
          }}
        />

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 text-white seo-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                SEO Score
              </p>
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
                    check.ok
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
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

        <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            SERP Preview
          </p>
          <div className="mt-3 space-y-1">
            <p className="text-sm font-semibold text-[#7ab7ff]">
              {currentMeta.metaTitle || "SEO title"}
            </p>
            <p className="text-xs text-emerald-300/80">{serpUrl}</p>
            <p className="text-xs text-white/60">
              {currentMeta.metaDescription || "Meta description sẽ hiển thị ở đây."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 seo-panel">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Schema Builder
          </p>
          <div className="mt-3 grid gap-3">
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-white/60">
              Template
              <select
                className="h-12 rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white"
                value={schemaTemplate}
                onChange={(event) =>
                  setSchemaTemplateByLang((prev) => ({
                    ...prev,
                    [activeLang]: event.target.value as SchemaTemplateType,
                  }))
                }
              >
                <option value="WebPage">WebPage</option>
                <option value="Article">Article</option>
                <option value="FAQPage">FAQPage</option>
                <option value="LocalBusiness">LocalBusiness</option>
                <option value="Service">Service</option>
              </select>
            </label>
            <AdminInput
              label="Organization"
              placeholder="Panda Spa"
              value={schemaOrg}
              onChange={(event) =>
                setSchemaOrgByLang((prev) => ({
                  ...prev,
                  [activeLang]: event.target.value,
                }))
              }
            />
            {schemaTemplate === "FAQPage" ? (
              <div className="space-y-2">
                {schemaFaqItems.map((item, index) => (
                  <div key={`faq-${index}`} className="grid gap-2 rounded-xl border border-white/10 p-2">
                    <AdminInput
                      label={`Question ${index + 1}`}
                      placeholder="Nhập câu hỏi..."
                      value={item.question}
                      onChange={(event) => {
                        const next = [...schemaFaqItems];
                        next[index] = { ...next[index], question: event.target.value };
                        setSchemaFaqByLang((prev) => ({
                          ...prev,
                          [activeLang]: next,
                        }));
                      }}
                    />
                    <AdminTextarea
                      label="Answer"
                      placeholder="Nhập câu trả lời..."
                      value={item.answer}
                      onChange={(event) => {
                        const next = [...schemaFaqItems];
                        next[index] = { ...next[index], answer: event.target.value };
                        setSchemaFaqByLang((prev) => ({
                          ...prev,
                          [activeLang]: next,
                        }));
                      }}
                    />
                  </div>
                ))}
                <AdminButton
                  variant="outline"
                  onClick={() =>
                    setSchemaFaqByLang((prev) => ({
                      ...prev,
                      [activeLang]: [...schemaFaqItems, { question: "", answer: "" }],
                    }))
                  }
                >
                  Thêm câu hỏi
                </AdminButton>
              </div>
            ) : null}
            <div className="rounded-xl border border-white/10 bg-[#0f172a] p-3 text-xs text-white/80">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  buildSchemaTemplate({
                    type: schemaTemplate,
                    title: currentMeta.metaTitle || "Panda Spa",
                    description: currentMeta.metaDescription || "",
                    url: serpUrl,
                    image: currentMeta.ogImage || "",
                    organization: schemaOrg,
                    faqItems: schemaFaqItems,
                  }),
                  null,
                  2
                )}
              </pre>
            </div>
            <AdminButton
              onClick={() => {
                const schema = buildSchemaTemplate({
                  type: schemaTemplate,
                  title: currentMeta.metaTitle || "Panda Spa",
                  description: currentMeta.metaDescription || "",
                  url: serpUrl,
                  image: currentMeta.ogImage || "",
                  organization: schemaOrg,
                  faqItems: schemaFaqItems,
                });
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    schemaJson: JSON.stringify(schema, null, 2),
                  },
                }));
              }}
            >
              Áp dụng schema
            </AdminButton>
            <AdminTextarea
              label="Schema JSON (có thể chỉnh sửa)"
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "headline": "..."\n}`}
              value={currentMeta.schemaJson || ""}
              onChange={(event) => {
                setIsDirty(true);
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], schemaJson: event.target.value },
                }));
              }}
              className="min-h-[160px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AdminButton
            onClick={async () => {
              try {
                const schemaJson = parseSchemaJson(
                  currentMeta.schemaJson,
                  handleSchemaJsonError
                );
                if (schemaJson === null) return;
                await updateHomeMeta(undefined, activeLang, {
                  metaTitle: currentMeta.metaTitle,
                  metaDescription: currentMeta.metaDescription,
                  canonical: currentMeta.canonical,
                  robots: currentMeta.robots,
                  ogTitle: currentMeta.ogTitle,
                  ogDescription: currentMeta.ogDescription,
                  ogImage: currentMeta.ogImage,
                  schemaJson,
                });
                const fresh = await getHomeMeta(undefined, activeLang);
                if (fresh) {
                  setMetaByLang((prev) => ({
                    ...prev,
                    [activeLang]: {
                      metaTitle: fresh.metaTitle ?? "",
                      metaDescription: fresh.metaDescription ?? "",
                      canonical: fresh.canonical ?? "",
                      robots: fresh.robots ?? "index,follow",
                      ogTitle: fresh.ogTitle ?? "",
                      ogDescription: fresh.ogDescription ?? "",
                      ogImage: fresh.ogImage ?? "",
                      schemaJson: fresh.schemaJson ? JSON.stringify(fresh.schemaJson, null, 2) : "",
                    },
                  }));
                }
                notify("SEO metadata updated.", "success");
                setIsDirty(false);
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem(storageKey);
                }
              } catch (err) {
                handleError(err);
              }
            }}
          >
            Save metadata
          </AdminButton>
          {activeLang !== lang ? (
            <AdminButton
              variant="outline"
              onClick={() => {
                if (onCloneFromLang) {
                  onCloneFromLang();
                  return;
                }
                setMetaByLang((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[lang] },
                }));
                setIsDirty(true);
              }}
            >
              Clone from {lang.toUpperCase()}
            </AdminButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
