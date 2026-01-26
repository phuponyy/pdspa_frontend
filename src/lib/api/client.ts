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

type AdminRequestEvent = {
  phase: "start" | "end";
  id: string;
  method: string;
  path: string;
  ok?: boolean;
  status?: number;
};

const dispatchAdminRequest = (detail: AdminRequestEvent) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AdminRequestEvent>("admin-request", { detail }));
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
  const hasBody = typeof init.body !== "undefined" && init.body !== null;
  const method = (init.method || "GET").toUpperCase();
  const shouldNotify = path.startsWith("/admin") && !path.startsWith("/admin/auth");
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  if (shouldNotify) {
    dispatchAdminRequest({ phase: "start", id: requestId, method, path });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: "include",
      ...init,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (err) {
    if (shouldNotify) {
      dispatchAdminRequest({
        phase: "end",
        id: requestId,
        method,
        path,
        ok: false,
        status: 0,
      });
    }
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  let payload: unknown = null;
  if (isJson) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const skipRefresh =
      path.startsWith("/admin/auth/login") ||
      path.startsWith("/admin/auth/refresh") ||
      path.startsWith("/admin/auth/logout");
    if (response.status === 401 && !retried && !skipRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        if (shouldNotify) {
          dispatchAdminRequest({
            phase: "end",
            id: requestId,
            method,
            path,
            ok: false,
            status: response.status,
          });
        }
        return apiFetchInternal(path, options, true);
      }
      await clearClientToken();
    }
    const errorPayload = ((payload as { error?: ApiErrorPayload } | null)?.error ||
      payload) as ApiErrorPayload | null;
    const error = new ApiError(
      errorPayload?.message || "Request failed",
      errorPayload?.code,
      response.status,
      errorPayload?.details
    );
    if (shouldNotify) {
      dispatchAdminRequest({
        phase: "end",
        id: requestId,
        method,
        path,
        ok: false,
        status: response.status,
      });
    }
    throw error;
  }

  if (shouldNotify) {
    dispatchAdminRequest({
      phase: "end",
      id: requestId,
      method,
      path,
      ok: true,
      status: response.status,
    });
  }
  return payload as T;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  return apiFetchInternal(path, options, false);
}
