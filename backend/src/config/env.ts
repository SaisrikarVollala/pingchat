import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DB_URL: z.url({ message: 'DB_URL must be a valid URL' }).min(1, { message: 'DB_URL is required' }),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'PORT must be a valid number' })
    .default(3000),
  REDIS_URL: z.string().min(1, { message: 'REDIS_URL is required' }),
  REDIS_PASS: z.string().min(1, { message: 'REDIS_PASS is required' }),
  REDIS_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'REDIS_PORT must be a valid number' }),
  EMAIL_USER: z.email({ message: 'EMAIL_USER must be a valid email' }).min(1, { message: 'EMAIL_USER is required' }),
  EMAIL_PASS: z.string().min(1, { message: 'EMAIL_PASS is required' }),
  JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET is required' }),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  CLIENT_URL: z.url({ message: 'CLIENT_URL must be a valid URL' }).min(1, { message: 'CLIENT_URL is required' }),
});


const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1); 
}


export const Env = parsedEnv.data;
