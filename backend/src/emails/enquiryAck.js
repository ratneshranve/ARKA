import { escapeHtml } from '../utils/escapeHtml.js';
import { layout, rowsTable, rowsText } from './layout.js';

/** Acknowledgement to the customer. */
export function enquiryAckEmail(enquiry, settings) {
  const company = settings?.company?.name || 'ARKA Solar Energy';
  const phones = settings?.contact?.phones?.filter(Boolean) ?? [];
  const emails = settings?.contact?.emails?.filter(Boolean) ?? [];

  const summary = [
    ...(enquiry.type === 'product'
      ? [
          ['Product', enquiry.productSnapshot?.name],
          ['Request', enquiry.intent === 'order' ? 'Order request' : 'Enquiry'],
          ['Quantity', enquiry.quantity],
        ]
      : [['Subject', enquiry.subject]]),
    ['Your message', enquiry.message],
  ];

  const contactLine = [phones.length && `Phone: ${phones.join(', ')}`, emails.length && `Email: ${emails.join(', ')}`]
    .filter(Boolean)
    .join(' · ');

  const subject = `We've received your enquiry – ${company}`;
  const html = layout({
    settings,
    title: `Thank you, ${enquiry.name}!`,
    bodyHtml: `
      <p>Thank you for contacting <strong>${escapeHtml(company)}</strong>. We have received your request and our team will get back to you shortly.</p>
      <p style="margin-bottom:4px;"><strong>Summary of your request</strong></p>
      ${rowsTable(summary)}
      ${contactLine ? `<p>Need to reach us sooner? ${escapeHtml(contactLine)}</p>` : ''}
      <p>Warm regards,<br>${escapeHtml(company)}</p>`,
  });
  const text = `Thank you, ${enquiry.name}!\n\nWe have received your request and our team will get back to you shortly.\n\n${rowsText(summary)}\n\n${contactLine}\n\n${company}`;

  return { subject, html, text };
}
