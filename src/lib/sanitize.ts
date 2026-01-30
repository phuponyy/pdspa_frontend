import sanitize from "sanitize-html";

const allowedSchemes = ["http", "https", "mailto", "tel"];

export const sanitizeHtml = (html: string) =>
  sanitize(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "pre",
      "code",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
      "div",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["class", "id", "aria-label"],
    },
    allowedSchemes,
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitize.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });

const addLazyImages = (html: string) =>
  html.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async" ');

export const renderCmsHtml = (html: string) => {
  const raw = typeof html === "string" ? html : "";
  return sanitizeHtml(addLazyImages(raw));
};

export const resolveSchemaJson = (schemaJson: unknown) => {
  if (!schemaJson) return "";
  if (typeof schemaJson === "string") {
    try {
      return JSON.stringify(JSON.parse(schemaJson));
    } catch {
      return "";
    }
  }
  try {
    return JSON.stringify(schemaJson);
  } catch {
    return "";
  }
};
