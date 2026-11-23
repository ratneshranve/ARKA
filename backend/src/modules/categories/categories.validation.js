import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  description: z.string().trim().max(300).optional().default(''),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required').max(80),
    description: z.string().trim().max(300),
    order: z.coerce.number().int().min(0),
    isActive: z.boolean(),
  })
  .partial();
