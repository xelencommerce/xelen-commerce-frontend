import { z } from 'zod';
import {
  parsePhoneNumberFromString,
  isSupportedCountry,
} from 'libphonenumber-js/max';
import { emailSchema, newPasswordSchema } from './auth-schemas';
import { industries } from '../constants/signup';

export const signupSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password doesn’t match.',
  });

export const phoneSchema = z
  .object({
    country: z
      .string()
      .refine(isSupportedCountry, 'Choose a supported country.'),
    phone: z.string().trim().min(1, 'Enter your phone number.'),
  })
  .superRefine((value, context) => {
    if (!isSupportedCountry(value.country)) return;
    const parsed = parsePhoneNumberFromString(value.phone, {
      defaultCountry: value.country,
      extract: false,
    });
    if (!parsed?.isValid())
      context.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Enter a valid phone number for the selected country.',
      });
  });

export const businessSchema = z.object({
  businessName: z.string().trim().min(1, 'Enter your business name.'),
});
export const industrySchema = z
  .object({
    industry: z
      .string()
      .refine(
        (value) => industries.some((industry) => industry === value),
        'Select your industry.',
      ),
    otherIndustry: z.string().trim(),
  })
  .refine(
    (value) => value.industry !== 'Other' || value.otherIndustry.length > 0,
    { path: ['otherIndustry'], message: 'Describe your industry.' },
  );

export type SignupValues = z.infer<typeof signupSchema>;
export type PhoneValues = z.input<typeof phoneSchema>;
export type ValidatedPhoneValues = z.output<typeof phoneSchema>;
export type BusinessValues = z.infer<typeof businessSchema>;
export type IndustryValues = z.infer<typeof industrySchema>;
