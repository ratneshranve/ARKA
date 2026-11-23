/**
 * Adds Cloudinary delivery transformations to an uploaded image URL.
 * cldUrl(url, { w: 600, h: 450, crop: 'fill' }) → …/upload/f_auto,q_auto,c_fill,w_600,h_450/…
 * Non-Cloudinary URLs (e.g. local demo images) are returned unchanged.
 */
export function cldUrl(url, { w, h, crop = 'fill' } = {}) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const parts = ['f_auto', 'q_auto', `c_${crop}`, w && `w_${w}`, h && `h_${h}`].filter(Boolean).join(',');
  return url.replace('/upload/', `/upload/${parts}/`);
}

/** Standard sizes from the SOP. */
export const IMG = {
  card: { w: 600, h: 450, crop: 'fill' },
  detail: { w: 1200, crop: 'limit' },
  thumb: { w: 200, h: 150, crop: 'fill' },
  bannerDesktop: { w: 1920, h: 800, crop: 'fill' },
  bannerMobile: { w: 800, h: 1000, crop: 'fill' },
  admin: { w: 120, h: 90, crop: 'fill' },
  intro: { w: 900, h: 700, crop: 'fill' },
};
