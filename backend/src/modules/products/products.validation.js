import { z } from 'zod';
import {
  boolQuery,
  imageSchema,
  keyValueSchema,
  markdown,
  objectId,
  pageQuery,
  slugField,
} from '../common.validation.js';

const price = z.object({
  amount: z.coerce.number().min(0, 'Price cannot be negative').max(100000000).nullable().optional().default(null),
  label: z.string().trim().max(50).optional().default(''),
  show: z.boolean().optional().default(false),
});

const fields = {
  name: z.string().trim().min(2, 'Name is required').max(150),
  slug: slugField.optional().or(z.literal('')),
  category: objectId,
  shortDescription: z.string().trim().min(10, 'Short description must be at least 10 characters').max(250),
  description: markdown(10000),
  images: z.array(imageSchema).min(1, 'Add at least one image').max(10, 'A maximum of 10 images is allowed'),
  specifications: z.array(keyValueSchema).max(40).optional().default([]),
  additionalInfo: markdown(10000),
  price: price.optional().default({}),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  metaTitle: z.string().trim().max(120).optional().default(''),
  metaDescription: z.string().trim().max(300).optional().default(''),
};

export const createProductSchema = z.object(fields).superRefine((d, ctx) => {
  if (d.price.show && (d.price.amount === null || d.price.amount === undefined)) {
    ctx.addIssue({ code: 'custom', path: ['price', 'amount'], message: 'Enter a price or turn off "Show price"' });
  }
});

export const updateProductSchema = createProductSchema;

export const publicListQuery = z.object({
  category: z.string().trim().max(160).optional(),
  featured: boolQuery,
  ...pageQuery,
});

export const adminListQuery = z.object({
  search: z.string().trim().max(100).optional(),
  category: objectId.optional().or(z.literal('')),
  status: z.enum(['published', 'hidden', '']).optional(),
  featured: boolQuery,
  sort: z.enum(['-updatedAt', 'updatedAt', '-createdAt', 'createdAt', 'name', '-name']).optional(),
  ...pageQuery,
});

export const visibilitySchema = z.object({ isPublished: z.boolean() });
export const featuredSchema = z.object({ isFeatured: z.boolean() });
