import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string().min(1),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("PROOF <onboarding@proof.dev>"),
  })
  .refine((data) => Boolean(data.AUTH_GITHUB_ID) === Boolean(data.AUTH_GITHUB_SECRET), {
    message: "AUTH_GITHUB_ID and AUTH_GITHUB_SECRET must be set together",
    path: ["AUTH_GITHUB_ID"],
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
