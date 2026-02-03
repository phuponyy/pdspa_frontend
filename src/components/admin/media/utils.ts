import { API_BASE_URL } from "@/lib/constants";

export const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};

export const resolveMediaUrl = (url: string) => (url.startsWith("http") ? url : `${API_BASE_URL}${url}`);

export const resolveMediaPreview = (item: { url: string; variants?: { url: string; kind: string }[] }) => {
  const variant =
    item.variants?.find((v) => v.kind === "webp-320") ||
    item.variants?.find((v) => v.kind.startsWith("webp-"));
  return variant ? resolveMediaUrl(variant.url) : resolveMediaUrl(item.url);
};
