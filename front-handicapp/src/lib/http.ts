import { appConfig } from "./config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  timeoutMs?: number;
  retries?: number;
}

export class HttpError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(path: string, baseUrl: string = appConfig.apiBaseUrl): string {
  if (path.startsWith("http")) return path;
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(buildUrl('/auth/refresh-token'), {
        method: 'POST',
        credentials: 'include', // Envía cookies httpOnly
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      // El backend ya setea las nuevas cookies httpOnly
      await response.json();
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function httpJson<TResponse = unknown, TBody = unknown>(
  path: string,
  options: HttpRequestOptions<TBody> = {}
): Promise<TResponse> {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? appConfig.requestTimeoutMs;
  const maxRetries = options.retries ?? appConfig.requestMaxRetries;

  const url = buildUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const body = options.body !== undefined ? JSON.stringify(options.body) : undefined;

  let attempt = 0;
  let lastError: unknown = undefined;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
        cache: "no-store",
        credentials: 'include', // Envía cookies httpOnly
      });

      clearTimeout(id);

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await res.json().catch(() => null) : await res.text();

      if (!res.ok) {
        // 401 Unauthorized => intentar refresh token
        if (res.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
          try {
            await refreshAccessToken();
            // Reintentar request original con nuevo token
            const retryRes = await fetch(url, {
              method,
              headers,
              body,
              credentials: 'include',
              cache: "no-store",
            });

            const retryPayload = retryRes.headers.get("content-type")?.includes("application/json")
              ? await retryRes.json().catch(() => null)
              : await retryRes.text();

            if (!retryRes.ok) {
              throw new HttpError(
                `HTTP ${retryRes.status} for ${method} ${url}`,
                retryRes.status,
                retryPayload
              );
            }

            return retryPayload as TResponse;
          } catch (refreshError) {
            // Si falla el refresh, redirigir a login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new HttpError('Session expired', 401, null);
          }
        }

        // 5xx y 429 son candidatos a retry
        if ((res.status >= 500 || res.status === 429) && attempt < maxRetries) {
          const backoffMs = Math.min(1000 * 2 ** attempt, 4000);
          await sleep(backoffMs);
          attempt += 1;
          continue;
        }
        throw new HttpError(
          `HTTP ${res.status} for ${method} ${url}`,
          res.status,
          payload
        );
      }

      return payload as TResponse;
    } catch (err: unknown) {
      clearTimeout(id);
      // AbortError o red de bajo nivel => retry si quedan intentos
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const isNetwork = (err as Error)?.message?.includes("fetch") || isAbort;
      if (isNetwork && attempt < maxRetries) {
        const backoffMs = Math.min(1000 * 2 ** attempt, 4000);
        await sleep(backoffMs);
        attempt += 1;
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Fallo de red desconocido tras reintentos");
}

// API Client específico para HandicApp
class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    // Leer token de las cookies en lugar de localStorage
    const token = typeof window !== 'undefined' ? this.getCookie('auth-token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  async get<T = unknown>(path: string, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return httpJson<T>(path, {
      ...options,
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });
  }

  async post<T = unknown, B = unknown>(path: string, body?: B, options: Omit<HttpRequestOptions<B>, 'method' | 'body'> = {}): Promise<T> {
    return httpJson<T, B>(path, {
      ...options,
      method: 'POST',
      body,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });
  }

  async put<T = unknown, B = unknown>(path: string, body?: B, options: Omit<HttpRequestOptions<B>, 'method' | 'body'> = {}): Promise<T> {
    return httpJson<T, B>(path, {
      ...options,
      method: 'PUT',
      body,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });
  }

  async patch<T = unknown, B = unknown>(path: string, body?: B, options: Omit<HttpRequestOptions<B>, 'method' | 'body'> = {}): Promise<T> {
    return httpJson<T, B>(path, {
      ...options,
      method: 'PATCH',
      body,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });
  }

  async delete<T = unknown>(path: string, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return httpJson<T>(path, {
      ...options,
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });
  }
}

export const apiClient = new ApiClient();


