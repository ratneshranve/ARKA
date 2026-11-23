import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/usePublicData';
import { useSettings } from '@/hooks/useSettings';
import { NAV_LINKS, ROUTES } from '@/lib/constants';
import { telHref } from '@/lib/format';
import Logo from './Logo';
import SocialLinks from './SocialLinks';

function FooterHeading({ children }) {
  return (
    <h2 className="mb-4 text-base font-semibold text-white">
      {children}
      <span className="mt-2 block h-0.5 w-10 rounded bg-accent" aria-hidden="true" />
    </h2>
  );
}

const linkCls = 'inline-flex min-h-[36px] items-center text-primary-200 transition-colors hover:text-accent-light';

export default function Footer() {
  const { company, contact } = useSettings();
  const { data: categories = [] } = useCategories();
  const year = new Date().getFullYear();
  const footerCategories = categories.filter((c) => c.productCount > 0).slice(0, 6);

  return (
    <footer className="bg-primary-800 text-primary-200">
      <div className="h-1 bg-gradient-to-r from-accent-deep via-accent to-brand-light" aria-hidden="true" />
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          {company.footerAbout && <p className="mt-4 text-sm leading-relaxed">{company.footerAbout}</p>}
          <SocialLinks className="mt-5" itemClassName="bg-white/10 text-white hover:bg-accent hover:text-primary" />
        </div>

        <nav aria-label="Quick links">
          <FooterHeading>Quick Links</FooterHeading>
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Product categories">
          <FooterHeading>Products</FooterHeading>
          <ul className="space-y-1">
            {footerCategories.length ? (
              footerCategories.map((c) => (
                <li key={c._id}>
                  <Link to={`${ROUTES.products}?category=${c.slug}`} className={linkCls}>
                    {c.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link to={ROUTES.products} className={linkCls}>
                  All Products
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div>
          <FooterHeading>Contact</FooterHeading>
          <ul className="space-y-3 text-sm">
            {contact.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span className="whitespace-pre-line">{contact.address}</span>
              </li>
            )}
            {contact.phones?.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <a href={telHref(p)} className="hover:text-accent-light">
                  {p}
                </a>
              </li>
            ))}
            {contact.emails?.map((e) => (
              <li key={e} className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <a href={`mailto:${e}`} className="break-all hover:text-accent-light">
                  {e}
                </a>
              </li>
            ))}
            {contact.workingHours && (
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span>{contact.workingHours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-sm sm:flex-row">
          <p>
            © {year} {company.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-5">
            <li>
              <Link to={ROUTES.privacy} className="hover:text-accent-light">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to={ROUTES.terms} className="hover:text-accent-light">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
