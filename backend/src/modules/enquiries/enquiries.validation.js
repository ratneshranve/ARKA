import { z } from 'zod';
import { ENQUIRY_INTENTS, ENQUIRY_STATUSES } from '../../models/Enquiry.js';
import { indianPhone, objectId, pageQuery } from '../common.validation.js';

const base = {
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  phone: indianPhone,
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(150),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000),
  website: z.string().max(500).optional().default(''), // honeypot
  pageUrl: z.string().trim().max(500).optional().default(''),
};

export const createEnquirySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('product'),
    productId: objectId,
    intent: z.enum(ENQUIRY_INTENTS).optional().default('enquiry'),
    quantity: z.string().trim().max(50).optional().default(''),
    ...base,
  }),
  z.object({
    type: z.literal('general'),
    subject: z.string().trim().max(150).optional().default(''),
    ...base,
  }),
]);

const dateQuery = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Invalid date');

export const adminListQuery = z.object({
  type: z.enum(['product', 'general', '']).optional(),
  status: z.enum([...ENQUIRY_STATUSES, '']).optional(),
  search: z.string().trim().max(100).optional(),
  from: dateQuery,
  to: dateQuery,
  ...pageQuery,
});

export const updateEnquirySchema = z
  .object({
    status: z.enum(ENQUIRY_STATUSES).optional(),
    adminNote: z.string().trim().max(2000).optional(),
  })
  .refine((d) => d.status !== undefined || d.adminNote !== undefined, 'Nothing to update');
