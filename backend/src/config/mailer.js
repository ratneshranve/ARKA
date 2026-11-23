import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from './logger.js';

export const isMailerConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

export const transporter = isMailerConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

export const mailFrom = `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_EMAIL || env.SMTP_USER}>`;

/** Checks the SMTP connection on boot. Logs a warning on failure, never crashes. */
export async function verifyMailer() {
  if (!transporter) {
    logger.warn('SMTP is not configured — emails will be skipped (set SMTP_* in backend/.env)');
    return;
  }
  try {
    await transporter.verify();
    logger.info('SMTP connection verified');
  } catch (err) {
    logger.warn({ err: err.message }, 'SMTP verification failed — emails may not be delivered');
  }
}
