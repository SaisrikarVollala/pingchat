
import { z } from 'zod';
import dotenv from 'dotenv';


dotenv.config();

const envSchema = z.object({
  DB_URL: z.string().url({ message: 'DB_URL must be a valid URL' }).min(1, { message: 'DB_URL is required' }),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), { message: 'PORT must be a valid number' })
    .default('3000'),
});


const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1); 
}


export const env = parsedEnv.data;

export type EnvType= z.infer<typeof envSchema>;