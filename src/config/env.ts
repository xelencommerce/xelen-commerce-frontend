import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || undefined : value),
    z
      .string()
      .url()
      .refine((value) => /^https?:\/\//i.test(value), {
        message: 'Use an absolute HTTP(S) URL.',
      })
      .optional(),
  ),
});

export function parseEnv(input: { VITE_API_BASE_URL?: string | undefined }) {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    throw new Error(
      'Invalid VITE_API_BASE_URL: use an absolute HTTP(S) URL or leave it blank.',
    );
  }
  return { apiBaseUrl: result.data.VITE_API_BASE_URL };
}

export const env = parseEnv(import.meta.env);
