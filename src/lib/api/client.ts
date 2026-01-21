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

let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async () => {
  if (typeof window === "undefined") return false;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/admin/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const clearClientToken = async () => {
  if (typeof window === "undefined") return;
  try {
    await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
  } catch {
    // Best-effort logout; cookies may already be invalid/cleared.
  }
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

async function apiFetchInternal<T>(
  path: string,
  options: FetchOptions = {},
  retried = false
): Promise<T> {
  const { token, query, headers, ...init } = options;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  const response = await fetch(url, {
    credentials: "include",
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
    if (response.status === 401 && !retried && !path.startsWith("/admin/auth")) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiFetchInternal(path, options, true);
      }
      await clearClientToken();
    }
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

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  return apiFetchInternal(path, options, false);
}
