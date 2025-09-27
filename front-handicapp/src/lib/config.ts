import { env } from "./env";

export type AppRuntimeEnv = "development" | "test" | "production";

export const appConfig = {
  env: env.NEXT_PUBLIC_APP_ENV as AppRuntimeEnv,
  apiBaseUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api/v1'  // Backend local con versión
    : (env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'),  // Fallback sensato
  requestTimeoutMs: env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS,
  requestMaxRetries: env.NEXT_PUBLIC_REQUEST_MAX_RETRIES,
} as const;

export function assertConfig(): void {
  // env.parse ya valida, esta función queda para futura expansión
}


