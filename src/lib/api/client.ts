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
  notify?: boolean;
  timeoutMs?: number;
};

type AdminFetchOptions = FetchOptions & {
  responseType?: "json" | "text" | "blob";
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

const combineSignals = (signals: Array<AbortSignal | null | undefined>) => {
  const validSignals = signals.filter(Boolean) as AbortSignal[];
  if (!validSignals.length) return undefined;
  if (validSignals.length === 1) return validSignals[0];
  if (typeof AbortSignal !== "undefined" && "any" in AbortSignal) {
    return AbortSignal.any(validSignals);
  }
  const controller = new AbortController();
  validSignals.forEach((signal) => {
    if (signal.aborted) {
      controller.abort();
      return;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  });
  return controller.signal;
};

let refreshPromise: Promise<boolean> | null = null;

const getDeviceId = () => {
  if (typeof window === "undefined") return "";
  const key = "pd2_device_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, generated);
  return generated;
};

const refreshAccessToken = async () => {
  if (typeof window === "undefined") return false;
  if (!refreshPromise) {
    const csrfToken = getCsrfToken();
    const deviceId = getDeviceId();
    refreshPromise = fetch(`${API_BASE_URL}/admin/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        ...(deviceId ? { "X-Device-Id": deviceId } : {}),
      },
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

const getCsrfToken = () => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("pd2_csrf="));
  return match ? decodeURIComponent(match.split("=")[1] || "") : "";
};

async function apiFetchInternal<T>(
  path: string,
  options: FetchOptions = {},
  retried = false
): Promise<T> {
  const { token, query, headers, notify, timeoutMs, signal, ...init } = options;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;
  const hasBody = typeof init.body !== "undefined" && init.body !== null;
  const method = (init.method || "GET").toUpperCase();
  const shouldNotify =
    notify !== false && path.startsWith("/admin") && !path.startsWith("/admin/auth");
  const useCsrf = path.startsWith("/admin");
  const csrfToken = useCsrf ? getCsrfToken() : "";
  const includeDeviceId =
    path.startsWith("/admin/auth/login") || path.startsWith("/admin/auth/refresh");
  const deviceId = includeDeviceId ? getDeviceId() : "";
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const controller = new AbortController();
  const effectiveTimeoutMs = timeoutMs ?? (shouldNotify ? 20000 : undefined);
  const timeoutId =
    typeof effectiveTimeoutMs === "number"
      ? setTimeout(() => controller.abort(), effectiveTimeoutMs)
      : null;
  const mergedSignal = combineSignals([signal, controller.signal]);

  if (shouldNotify) {
    dispatchAdminRequest({ phase: "start", id: requestId, method, path });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: "include",
      signal: mergedSignal,
      ...init,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        ...(deviceId ? { "X-Device-Id": deviceId } : {}),
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
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
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

export async function adminFetch<T>(
  path: string,
  options: AdminFetchOptions = {},
  retried = false
): Promise<T> {
  const {
    token,
    query,
    headers,
    notify,
    timeoutMs,
    responseType = "json",
    signal,
    ...init
  } = options;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;
  const method = (init.method || "GET").toUpperCase();
  const hasBody = typeof init.body !== "undefined" && init.body !== null;
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  const isBlobBody =
    typeof Blob !== "undefined" && init.body instanceof Blob;
  const csrfToken = getCsrfToken();
  const shouldNotify = notify !== false;
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const controller = new AbortController();
  const effectiveTimeoutMs = timeoutMs ?? 20000;
  const timeoutId =
    typeof effectiveTimeoutMs === "number"
      ? setTimeout(() => controller.abort(), effectiveTimeoutMs)
      : null;
  const mergedSignal = combineSignals([signal, controller.signal]);

  if (shouldNotify) {
    dispatchAdminRequest({ phase: "start", id: requestId, method, path });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: "include",
      signal: mergedSignal,
      ...init,
      headers: {
        ...(hasBody && !isFormData && !isBlobBody
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
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
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
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
        return adminFetch(path, options, true);
      }
      await clearClientToken();
    }

    let payload: unknown = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
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

  let data: unknown = null;
  if (responseType === "blob") {
    data = await response.blob();
  } else if (responseType === "text") {
    data = await response.text();
  } else {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    }
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
  return data as T;
}
