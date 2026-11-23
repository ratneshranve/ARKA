import { z } from 'zod';
import { passwordPolicy } from '../common.validation.js';

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32).max(200),
  password: passwordPolicy,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: passwordPolicy,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current password',
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email,
});
