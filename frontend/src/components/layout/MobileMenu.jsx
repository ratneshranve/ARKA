import { ChevronRight, Mail, Phone } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/cn';
import { NAV_LINKS, ROUTES } from '@/lib/constants';
import { telHref } from '@/lib/format';

export default function MobileMenu({ open, onClose }) {
  const { contact } = useSettings();
  const phone = contact.phones?.[0];
  const email = contact.emails?.[0];

  return (
    <Drawer open={open} onClose={onClose} title="Menu" id="mobile-menu">
      <nav aria-label="Mobile" className="p-2">
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[52px] items-center justify-between rounded-lg px-4 text-lg font-semibold',
                    isActive ? 'bg-accent-50 text-primary' : 'text-primary-600 hover:bg-muted',
                  )
                }
              >
                {link.label}
                <ChevronRight className="h-5 w-5 text-ink-muted" aria-hidden="true" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-4 border-t border-border p-4">
        <Button to={ROUTES.contact} size="lg" className="w-full" onClick={onClose}>
          Get a Quote
        </Button>
        {phone && (
          <a href={telHref(phone)} className="flex min-h-[44px] items-center gap-3 text-primary">
            <Phone className="h-5 w-5 text-brand" aria-hidden="true" /> {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex min-h-[44px] items-center gap-3 break-all text-primary">
            <Mail className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" /> {email}
          </a>
        )}
      </div>
    </Drawer>
  );
}
