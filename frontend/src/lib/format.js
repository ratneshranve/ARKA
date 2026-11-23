const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export const formatPrice = (amount) => `₹${inr.format(amount)}`;

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', opts);
}

export const formatDateTime = (value) =>
  formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const formatMonthYear = (value) => formatDate(value, { month: 'long', year: 'numeric' });

/** "+919876543210" → "+91 98765 43210" */
export function formatPhone(phone = '') {
  const m = String(phone).match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}

export const telHref = (phone = '') => `tel:${String(phone).replace(/[^\d+]/g, '')}`;
