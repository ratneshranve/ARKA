import { env } from '../config/env.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { button, layout } from './layout.js';

export function passwordResetEmail({ name, resetUrl }, settings) {
  const subject = 'Reset your admin password';
  const html = layout({
    settings,
    title: subject,
    bodyHtml: `
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>We received a request to reset the password for the website admin panel. Click the button below to choose a new password. This link is valid for ${env.PASSWORD_RESET_EXPIRES_MIN} minutes.</p>
      ${button(resetUrl, 'Reset password')}
      <p style="color:#5B6577;font-size:13px;">If you did not request this, you can safely ignore this email — your password will not change.</p>`,
  });
  const text = `Reset your admin password\n\nOpen this link within ${env.PASSWORD_RESET_EXPIRES_MIN} minutes to choose a new password:\n${resetUrl}\n\nIf you did not request this, ignore this email.`;
  return { subject, html, text };
}
