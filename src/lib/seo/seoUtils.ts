export type SeoCheck = {
  label: string;
  ok: boolean;
  hint?: string;
};

export type SeoAnalysis = {
  score: number;
  density: number;
  wordCount: number;
  h1Count: number;
  h2Count: number;
  internalLinks: number;
  checks: SeoCheck[];
};

const normalize = (value: string) => value.toLowerCase().trim();

export const stripHtml = (html: string) => {
  if (!html) return "";
  if (typeof window !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }
  return html.replace(/<[^>]*>/g, " ");
};

const countTags = (html: string, tag: string) => {
  if (!html) return 0;
  const regex = new RegExp(`<${tag}\\b`, "gi");
  return (html.match(regex) || []).length;
};

const countInternalLinks = (html: string) => {
  if (!html || typeof window === "undefined") return 0;
  const div = document.createElement("div");
  div.innerHTML = html;
  const links = Array.from(div.querySelectorAll("a"));
  const origin = window.location.origin;
  return links.filter((link) => {
    const href = link.getAttribute("href") || "";
    return href.startsWith("/") || href.startsWith(origin);
  }).length;
};

export const analyzeSeo = ({
  title,
  slug,
  description,
  contentHtml,
  focusKeyword,
}: {
  title: string;
  slug: string;
  description: string;
  contentHtml: string;
  focusKeyword: string;
}): SeoAnalysis => {
  const text = stripHtml(contentHtml || "");
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const keyword = normalize(focusKeyword || "");
  const keywordCount =
    keyword && wordCount
      ? words.filter((word) => normalize(word).includes(keyword)).length
      : 0;
  const density = wordCount ? (keywordCount / wordCount) * 100 : 0;
  const h1Count = countTags(contentHtml, "h1");
  const h2Count = countTags(contentHtml, "h2");
  const internalLinks = countInternalLinks(contentHtml);

  const descLength = description?.trim().length || 0;

  const checks: SeoCheck[] = [
    {
      label: "Từ khóa chính trong tiêu đề (H1)",
      ok: !!keyword && normalize(title).includes(keyword),
    },
    {
      label: "Từ khóa chính trong URL",
      ok: !!keyword && normalize(slug).includes(keyword),
    },
    {
      label: "Từ khóa chính trong meta description",
      ok: !!keyword && normalize(description).includes(keyword),
    },
    {
      label: "Có H1 trong nội dung",
      ok: h1Count > 0,
    },
    {
      label: "Có H2 trong nội dung",
      ok: h2Count > 0,
    },
    {
      label: "Độ dài meta description (120-160 ký tự)",
      ok: descLength >= 120 && descLength <= 160,
      hint: descLength ? `${descLength} ký tự` : undefined,
    },
    {
      label: "Mật độ từ khóa 0.5% - 2.5%",
      ok: density >= 0.5 && density <= 2.5,
      hint: `${density.toFixed(2)}%`,
    },
    {
      label: "Nội dung >= 300 từ",
      ok: wordCount >= 300,
      hint: `${wordCount} từ`,
    },
    {
      label: "Có ít nhất 1 internal link",
      ok: internalLinks > 0,
      hint: `${internalLinks} liên kết`,
    },
  ];

  const score = Math.round(
    checks.reduce((acc, check) => acc + (check.ok ? 1 : 0), 0) *
      (100 / checks.length)
  );

  return {
    score,
    density,
    wordCount,
    h1Count,
    h2Count,
    internalLinks,
    checks,
  };
};

export const generateSeoFromContent = ({
  title,
  excerpt,
  contentHtml,
}: {
  title: string;
  excerpt?: string;
  contentHtml: string;
}) => {
  const safeTitle = title?.trim() || "";
  const trimmedTitle = safeTitle.length > 70 ? safeTitle.slice(0, 67) + "..." : safeTitle;
  const descriptionSource = excerpt?.trim() || stripHtml(contentHtml || "");
  const trimmedDescription =
    descriptionSource.length > 160
      ? descriptionSource.slice(0, 157) + "..."
      : descriptionSource;

  return {
    seoTitle: trimmedTitle,
    seoDescription: trimmedDescription,
    ogTitle: trimmedTitle,
    ogDescription: trimmedDescription,
  };
};

export type SchemaTemplateType =
  | "Article"
  | "FAQPage"
  | "LocalBusiness"
  | "Service"
  | "WebPage";

export const buildSchemaTemplate = ({
  type,
  title,
  description,
  url,
  image,
  organization,
  faqItems,
}: {
  type: SchemaTemplateType;
  title: string;
  description: string;
  url: string;
  image?: string;
  organization?: string;
  faqItems?: { question: string; answer: string }[];
}) => {
  const base = {
    "@context": "https://schema.org",
    "@type": type,
  };

  if (type === "Article") {
    return {
      ...base,
      headline: title,
      description,
      image: image ? [image] : undefined,
      author: organization
        ? { "@type": "Organization", name: organization }
        : undefined,
      mainEntityOfPage: url ? { "@type": "WebPage", "@id": url } : undefined,
    };
  }

  if (type === "FAQPage") {
    return {
      ...base,
      mainEntity: (faqItems || []).map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    };
  }

  if (type === "LocalBusiness") {
    return {
      ...base,
      name: organization || title,
      url,
      image: image ? [image] : undefined,
      description,
    };
  }

  if (type === "Service") {
    return {
      ...base,
      name: title,
      description,
      provider: organization
        ? { "@type": "Organization", name: organization }
        : undefined,
    };
  }

  return {
    ...base,
    name: title,
    description,
    url,
  };
};
