import { z } from "zod";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const envSchema = z.object({
  DB_URL: z
    .url({ message: "DB_URL must be a valid URL" })
    .min(1, { message: "DB_URL is required" }),
  PORT: z.preprocess(
    (val) => val || process.env.PORT ,
    z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), { message: "PORT must be a valid number" })
  ),
  REDIS_URL: z.string().min(1, { message: "REDIS_URL is required" }),
  REDIS_PASS: z.string().min(1, { message: "REDIS_PASS is required" }),
  REDIS_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: "REDIS_PORT must be a valid number",
    }),
  JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  CLIENT_URL: z
    .url({ message: "CLIENT_URL must be a valid URL" })
    .min(1, { message: "CLIENT_URL is required" }),
  RESEND_API_KEY: z.string().min(1, { message: "RESEND_API_KEY is required" }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const Env = parsedEnv.data;
