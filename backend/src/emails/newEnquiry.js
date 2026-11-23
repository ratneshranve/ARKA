import { env } from '../config/env.js';
import { button, layout, rowsTable, rowsText } from './layout.js';

/** Email to the company for every new enquiry. */
export function newEnquiryEmail(enquiry, settings) {
  const isProduct = enquiry.type === 'product';
  const kind = isProduct
    ? enquiry.intent === 'order'
      ? 'Product Order'
      : 'Product Enquiry'
    : 'Contact Enquiry';
  const productUrl = enquiry.productSnapshot?.slug
    ? `${env.APP_URL}/products/${enquiry.productSnapshot.slug}`
    : '';
  const adminUrl = `${env.APP_URL}/admin/enquiries/${enquiry._id}`;

  const rows = [
    ['Type', kind],
    ['Name', enquiry.name],
    ['Phone', enquiry.phone],
    ['Email', enquiry.email],
    ...(isProduct
      ? [
          ['Product', enquiry.productSnapshot?.name],
          ['Product link', productUrl],
          ['Quantity', enquiry.quantity],
        ]
      : [['Subject', enquiry.subject]]),
    ['Message', enquiry.message],
    ['Received', new Date(enquiry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
  ];

  const subject = `New ${kind} – ${enquiry.name}`;
  const html = layout({
    settings,
    title: subject,
    bodyHtml: `<p>A new ${kind.toLowerCase()} was submitted on the website.</p>${rowsTable(rows)}${button(adminUrl, 'Open in admin panel')}`,
  });
  const text = `${subject}\n\n${rowsText(rows)}\n\nOpen in admin panel: ${adminUrl}`;

  return { subject, html, text };
}
