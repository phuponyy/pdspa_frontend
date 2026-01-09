import { API_BASE_URL } from "@/lib/constants";

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
};

export class ApiError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;

  constructor(message: string, code?: string, status?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type FetchOptions = RequestInit & {
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
};

const buildQuery = (query?: FetchOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, query, headers, ...init } = options;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorPayload = (payload?.error || payload) as ApiErrorPayload | null;
    throw new ApiError(
      errorPayload?.message || "Request failed",
      errorPayload?.code,
      response.status,
      errorPayload?.details
    );
  }

  return payload as T;
}
