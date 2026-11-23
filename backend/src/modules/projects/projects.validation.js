import { z } from 'zod';
import { PROJECT_TYPES } from '../../models/Project.js';
import { boolQuery, imageSchema, keyValueSchema, markdown, pageQuery, slugField } from '../common.validation.js';

const completedOn = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.date({ invalid_type_error: 'Enter a valid date' }).nullable(),
);

export const createProjectSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(150),
  slug: slugField.optional().or(z.literal('')),
  location: z.string().trim().min(2, 'Location is required').max(150),
  shortDescription: z.string().trim().min(10, 'Short description must be at least 10 characters').max(250),
  description: markdown(10000),
  coverImage: imageSchema,
  gallery: z.array(imageSchema).max(20, 'A maximum of 20 gallery images is allowed').optional().default([]),
  capacity: z.string().trim().max(50).optional().default(''),
  projectType: z
    .enum(PROJECT_TYPES)
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null))
    .default(null),
  completedOn,
  details: z.array(keyValueSchema).max(30).optional().default([]),
  additionalInfo: markdown(10000),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  metaTitle: z.string().trim().max(120).optional().default(''),
  metaDescription: z.string().trim().max(300).optional().default(''),
});

export const updateProjectSchema = createProjectSchema;

export const publicListQuery = z.object({ featured: boolQuery, ...pageQuery });

export const adminListQuery = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(['published', 'hidden', '']).optional(),
  featured: boolQuery,
  sort: z.enum(['-updatedAt', 'updatedAt', '-createdAt', 'createdAt', 'title', '-title']).optional(),
  ...pageQuery,
});
