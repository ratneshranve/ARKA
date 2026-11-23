import { logger } from '../config/logger.js';
import { mailFrom, transporter } from '../config/mailer.js';

/** Safe send: logs failures and resolves to false — never throws to the caller. */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) {
    logger.warn({ subject }, 'Email skipped: no recipients');
    return false;
  }
  if (!transporter) {
    logger.warn({ subject, to: recipients }, 'Email skipped: SMTP not configured');
    return false;
  }
  try {
    await transporter.sendMail({ from: mailFrom, to: recipients.join(', '), subject, html, text, replyTo });
    logger.info({ subject, to: recipients }, 'Email sent');
    return true;
  } catch (err) {
    logger.error({ err: err.message, subject, to: recipients }, 'Email failed');
    return false;
  }
}
