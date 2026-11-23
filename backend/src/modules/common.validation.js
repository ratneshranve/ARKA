import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const idParams = z.object({ id: objectId });
export const slugParams = z.object({ slug: z.string().trim().min(1).max(200) });

export const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only');

/** Absolute http(s) URL or a site-relative path (demo images live in frontend/public). */
const imageUrl = z
  .string()
  .trim()
  .min(1)
  .refine((v) => /^https?:\/\//i.test(v) || v.startsWith('/'), 'Invalid image URL');

export const imageSchema = z.object({
  url: imageUrl,
  publicId: z.string().trim().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().trim().max(200).optional().default(''),
});

export const keyValueSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(100),
  value: z.string().trim().min(1, 'Value is required').max(500),
});

export const markdown = (max = 10000) => z.string().max(max).optional().default('');

export const boolQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === 'true'));

export const pageQuery = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
};

export const reorderSchema = z.object({ ids: z.array(objectId).min(1).max(500) });

/** Indian mobile: 10 digits starting 6–9, optional +91 / 91 / 0 prefix → +91XXXXXXXXXX */
export const indianPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ''))
  .refine((v) => /^(?:\+91|91|0)?[6-9]\d{9}$/.test(v), 'Enter a valid 10-digit Indian mobile number')
  .transform((v) => `+91${v.slice(-10)}`);

export const passwordPolicy = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');
