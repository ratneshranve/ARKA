import { z } from 'zod';

/** Same rules as the server (backend/src/modules/common.validation.js). */
export const PHONE_REGEX = /^(?:\+91|91|0)?[6-9]\d{9}$/;

export const normalisePhone = (value = '') => {
  const digits = String(value).replace(/[\s()-]/g, '');
  return PHONE_REGEX.test(digits) ? `+91${digits.slice(-10)}` : value;
};

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .refine((v) => PHONE_REGEX.test(v.replace(/[\s()-]/g, '')), 'Enter a valid 10-digit Indian mobile number');

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');
export const nameSchema = z.string().trim().min(2, 'Please enter your name').max(100, 'Name is too long');
export const messageSchema = z
  .string()
  .trim()
  .min(5, 'Message must be at least 5 characters')
  .max(2000, 'Message must be under 2000 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const slugSchema = z
  .string()
  .trim()
  .max(160)
  .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only');

export const toSlug = (text = '') =>
  String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
