import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');

const absolute = (url) => {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return SITE_URL ? `${SITE_URL}${url}` : url;
};

/** Page title "{Page} | {Company}", meta description, canonical URL and basic Open Graph tags. */
export default function Seo({ title, description, image, noindex = false, type = 'website' }) {
  const { settings, company } = useSettings();
  const { pathname } = useLocation();
  const seo = settings.seo ?? {};
  const companyName = company.name || 'ARKA Solar Energy';

  const fullTitle = title ? `${title} | ${companyName}` : seo.defaultTitle || companyName;
  const desc = description || seo.defaultDescription || company.tagline || '';
  const ogImage = absolute(image || seo.ogImage?.url || '/images/logo.png');
  const canonical = SITE_URL ? `${SITE_URL}${pathname}` : undefined;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={companyName} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
