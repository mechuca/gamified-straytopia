import { z } from 'zod';

export const ReportSchema = z.object({
  type: z.enum(['injured', 'feeding', 'water', 'rescue', 'sick', 'aggressive', 'abandoned', 'adoption', 'other']),
  severity: z.enum(['urgent', 'today', 'soon']),
  location: z.string().min(1, 'Location is required.'),
  description: z.string().max(280, 'Keep it short — under 280 characters.'),
  photoUri: z.string().nullable(),
});

export type ReportInput = z.infer<typeof ReportSchema>;

export const RegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Enter a valid phone number.'),
  age: z.number().min(10).max(120).optional().nullable(),
  gender: z.string().optional().nullable(),
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

export const OTSchema = z.object({
  code: z.string().length(6, 'Six digits.'),
});

export type OTPInput = z.infer<typeof OTSchema>;
