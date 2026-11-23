import 'dotenv/config';
import { z } from 'zod';

const bool = z.enum(['true', 'false']).transform((v) => v === 'true');
const optional = z.string().trim().default('');

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    APP_URL: z.string().url().default('http://localhost:5173'),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:5173')
      .transform((s) =>
        s
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean),
      ),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),

    MONGODB_URI: z.string({ required_error: 'MONGODB_URI is required' }).min(1),

    JWT_ACCESS_SECRET: z.string({ required_error: 'JWT_ACCESS_SECRET is required' }).min(16),
    JWT_REFRESH_SECRET: z.string({ required_error: 'JWT_REFRESH_SECRET is required' }).min(16),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),
    PASSWORD_RESET_EXPIRES_MIN: z.coerce.number().int().positive().default(30),
    COOKIE_SECURE: bool.default('false'),

    ADMIN_NAME: z.string().default('Site Admin'),
    ADMIN_EMAIL: optional,
    ADMIN_PASSWORD: optional,

    CLOUDINARY_CLOUD_NAME: optional,
    CLOUDINARY_API_KEY: optional,
    CLOUDINARY_API_SECRET: optional,
    CLOUDINARY_FOLDER: z.string().default('arka-solar'),

    SMTP_HOST: optional,
    SMTP_PORT: z.coerce.number().int().positive().default(465),
    SMTP_SECURE: bool.default('true'),
    SMTP_USER: optional,
    SMTP_PASS: optional,
    MAIL_FROM_NAME: z.string().default('ARKA Solar Energy'),
    MAIL_FROM_EMAIL: optional,
    ENQUIRY_NOTIFY_EMAIL: optional,

    UPLOAD_MAX_MB: z.coerce.number().positive().max(20).default(5),
  })
  .superRefine((e, ctx) => {
    if (e.JWT_ACCESS_SECRET === e.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'must be different from JWT_ACCESS_SECRET',
      });
    }
    if (e.NODE_ENV === 'production') {
      for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
        if (e[key].length < 32) {
          ctx.addIssue({ code: 'custom', path: [key], message: 'must be at least 32 characters in production' });
        }
      }
      if (!e.COOKIE_SECURE) {
        ctx.addIssue({ code: 'custom', path: ['COOKIE_SECURE'], message: 'must be true in production' });
      }
    }
  });

// Treat empty values (`KEY=`) as missing so defaults and "required" checks apply.
const raw = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === '' ? undefined : v]),
);

const parsed = schema.safeParse(raw);

if (!parsed.success) {
  console.error('\n❌ Invalid environment configuration (backend/.env):');
  for (const issue of parsed.error.issues) {
    console.error(`   • ${issue.path.join('.') || '(root)'}: ${issue.message}`);
  }
  console.error('\nSee backend/.env.example for every supported key.\n');
  process.exit(1);
}

export const env = Object.freeze({
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  isDev: parsed.data.NODE_ENV === 'development',
});
