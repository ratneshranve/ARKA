import { z } from 'zod';
import { imageSchema } from '../common.validation.js';

const text = (max) => z.string().trim().max(max).optional().default('');
const md = text(20000);
const img = imageSchema.nullable().optional();
const url = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Must start with http:// or https://')
  .optional()
  .default('');
const emailList = z.array(z.string().trim().toLowerCase().email('Enter a valid email')).max(10).default([]);

export const updateSettingsSchema = z
  .object({
    company: z.object({
      name: z.string().trim().min(1, 'Company name is required').max(120),
      tagline: text(200),
      logo: img,
      logoLight: img,
      footerAbout: text(500),
    }),
    home: z.object({ introTitle: text(150), introText: md, introImage: img }),
    about: z.object({
      heroImage: img,
      overview: md,
      background: md,
      businessInfo: md,
      experience: md,
      vision: md,
      mission: md,
    }),
    contact: z.object({
      phones: z.array(z.string().trim().min(5).max(30)).max(5).default([]),
      emails: emailList,
      address: text(500),
      mapEmbedUrl: z
        .string()
        .trim()
        .max(2000)
        .refine(
          (v) => v === '' || v.startsWith('https://www.google.com/maps/embed'),
          'Must be a Google Maps embed URL (https://www.google.com/maps/embed…)',
        )
        .optional()
        .default(''),
      workingHours: text(150),
    }),
    social: z.object({ facebook: url, instagram: url, linkedin: url, youtube: url, x: url }),
    legal: z.object({ privacyPolicy: md, termsAndConditions: md }),
    seo: z.object({ defaultTitle: text(120), defaultDescription: text(300), ogImage: img }),
    notifications: z.object({ enquiryEmails: emailList }),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Provide at least one section to update');
