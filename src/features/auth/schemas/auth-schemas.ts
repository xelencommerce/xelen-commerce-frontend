import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .email('Enter a valid email address.');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean(),
});

export const forgotPasswordSchema = z.object({ email });
export const verificationSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the complete 6-digit code.'),
});

export const passwordRequirements = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
  {
    label: 'One special character',
    test: (value: string) => /[^a-zA-Z0-9\s]/.test(value),
  },
] as const;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .refine(
        (value) =>
          passwordRequirements.every((requirement) => requirement.test(value)),
        'Meet all four password requirements.',
      ),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match.',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type VerificationValues = z.infer<typeof verificationSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
