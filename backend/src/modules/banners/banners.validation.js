import { z } from 'zod';
import { imageSchema } from '../common.validation.js';

export const bannerSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(120),
  subtitle: z.string().trim().max(250).optional().default(''),
  image: imageSchema,
  mobileImage: imageSchema.nullable().optional().default(null),
  ctaLabel: z.string().trim().max(40).optional().default(''),
  ctaLink: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//i.test(v), 'Use a path like /products or a full https:// URL')
    .optional()
    .default(''),
  isActive: z.boolean().optional().default(true),
});

export const updateBannerSchema = bannerSchema.partial();
