import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  NEXT_PUBLIC_REQUEST_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(1),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_REQUEST_TIMEOUT_MS: process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS,
  NEXT_PUBLIC_REQUEST_MAX_RETRIES: process.env.NEXT_PUBLIC_REQUEST_MAX_RETRIES,
});


