import { escapeHtml } from '../utils/escapeHtml.js';

// Matches the website theme ("White + Green"): navy, deep green, orange accent
const BRAND = { dark: '#123F73', green: '#1E7B34', sun: '#F57C1F', muted: '#F5F8FB' };

/** Shared, mobile-friendly email wrapper (inline styles, max 600px). */
export function layout({ settings, title, bodyHtml }) {
  const company = escapeHtml(settings?.company?.name || 'ARKA Solar Energy');
  const logoUrl = settings?.company?.logo?.url;
  const logo = logoUrl?.startsWith('http')
    ? `<img src="${escapeHtml(logoUrl)}" alt="${company}" height="48" style="height:48px;width:auto;display:block;margin:0 auto;">`
    : `<div style="font-size:22px;font-weight:700;color:${BRAND.dark};letter-spacing:2px;">${company}</div>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.muted};font-family:Arial,Helvetica,sans-serif;color:#1F2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.muted};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr><td style="height:4px;background:linear-gradient(90deg,${BRAND.sun},${BRAND.green});background-color:${BRAND.green};"></td></tr>
        <tr><td style="padding:24px 24px 8px;text-align:center;">${logo}</td></tr>
        <tr><td style="padding:8px 24px 24px;font-size:15px;line-height:1.6;">
          <h1 style="font-size:20px;margin:0 0 16px;color:${BRAND.dark};">${escapeHtml(title)}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 24px;background:${BRAND.dark};color:#D7E4F3;font-size:12px;text-align:center;">
          &copy; ${new Date().getFullYear()} ${company}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Renders label/value rows as a simple table; values are escaped. */
export function rowsTable(rows) {
  const trs = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 10px;border-bottom:1px solid #E3E7EE;color:#5B6577;width:35%;vertical-align:top;">${escapeHtml(k)}</td>` +
        `<td style="padding:8px 10px;border-bottom:1px solid #E3E7EE;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 16px;">${trs}</table>`;
}

export function button(href, label) {
  return `<p style="margin:20px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND.green};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px;">${escapeHtml(label)}</a></p>`;
}

export const rowsText = (rows) =>
  rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
