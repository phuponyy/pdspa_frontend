import { API_BASE_URL } from "@/lib/constants";

export const formatVnd = (value: number) => {
  try {
    return value.toLocaleString("vi-VN");
  } catch {
    return String(value);
  }
};

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

export const parseSchemaJson = (raw: string | undefined, onError: () => void) => {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("invalid");
    }
    return parsed as Record<string, unknown>;
  } catch {
    onError();
    return null;
  }
};
