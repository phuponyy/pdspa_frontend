import { API_BASE_URL } from "@/lib/constants";

export const normalizeMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith(API_BASE_URL)) {
    return url.replace(API_BASE_URL, "");
  }
  return url;
};

export const resolveMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};
