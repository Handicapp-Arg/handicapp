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
      });

      clearTimeout(id);

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await res.json().catch(() => null) : await res.text();

      if (!res.ok) {
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


