import { API_BASE_URL } from "@/lib/constants";

export const formatPrice = (value: number) => {
  try {
    return value.toLocaleString("vi-VN");
  } catch {
    return String(value);
  }
};

export const resolveImageUrl = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }
  return trimmed;
};
