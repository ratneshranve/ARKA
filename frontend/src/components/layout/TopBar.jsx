import { Clock, Mail, Phone } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { telHref } from '@/lib/format';
import SocialLinks from './SocialLinks';

export default function TopBar() {
  const { contact } = useSettings();
  const phone = contact.phones?.[0];
  const email = contact.emails?.[0];
  const hours = contact.workingHours;

  return (
    <div className="hidden bg-primary text-sm text-primary-100 md:block">
      <div className="container-page flex h-10 items-center justify-between gap-4">
        <ul className="flex min-w-0 items-center gap-6">
          {phone && (
            <li>
              <a href={telHref(phone)} className="inline-flex items-center gap-2 hover:text-accent-light">
                <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {phone}
              </a>
            </li>
          )}
          {email && (
            <li className="min-w-0">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 truncate hover:text-accent-light">
                <Mail className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                <span className="truncate">{email}</span>
              </a>
            </li>
          )}
          {hours && (
            <li className="hidden items-center gap-2 lg:inline-flex">
              <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {hours}
            </li>
          )}
        </ul>
        <SocialLinks size="sm" itemClassName="text-primary-100 hover:bg-white/10 hover:text-accent-light" />
      </div>
    </div>
  );
}
