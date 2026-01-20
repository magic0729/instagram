import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),

  META_CLIENT_ID: z.string().min(1),
  META_CLIENT_SECRET: z.string().min(1),
  META_REDIRECT_URI: z.string().url(),
  META_OAUTH_SCOPES: z.string().optional(),

  APP_BASE_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(12).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  cachedEnv = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    META_CLIENT_ID: process.env.META_CLIENT_ID,
    META_CLIENT_SECRET: process.env.META_CLIENT_SECRET,
    META_REDIRECT_URI: process.env.META_REDIRECT_URI,
    META_OAUTH_SCOPES: process.env.META_OAUTH_SCOPES,
    APP_BASE_URL: process.env.APP_BASE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
  });
  return cachedEnv;
}

