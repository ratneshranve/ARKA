import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/cn';
import { telHref } from '@/lib/format';

const STYLES = {
  // Separate white cards (Contact page)
  cards: {
    list: 'space-y-4',
    item: 'flex gap-4 rounded-xl border border-border bg-white p-5 shadow-card',
    icon: 'bg-accent-50 text-accent-deep',
    title: 'text-primary',
    body: 'text-ink-muted',
    link: 'hover:text-brand-dark',
  },
  // Compact list inside a dark panel (Home contact section)
  panel: {
    list: 'divide-y divide-white/10',
    item: 'flex gap-4 py-5 first:pt-0 last:pb-0',
    icon: 'bg-white/10 text-accent-light',
    title: 'text-white',
    body: 'text-primary-100',
    link: 'hover:text-accent-light',
  },
};

/** Call / Email / Visit / Working hours from Site Settings. Missing values are hidden. */
export default function ContactInfoCards({ variant = 'cards' }) {
  const { contact } = useSettings();
  const s = STYLES[variant];
  const linkCls = cn('block break-words py-0.5 transition-colors', s.link);

  const items = [
    contact.phones?.length > 0 && {
      key: 'phone',
      Icon: Phone,
      title: 'Call us',
      content: contact.phones.map((p) => (
        <a key={p} href={telHref(p)} className={linkCls}>
          {p}
        </a>
      )),
    },
    contact.emails?.length > 0 && {
      key: 'email',
      Icon: Mail,
      title: 'Email us',
      content: contact.emails.map((e) => (
        <a key={e} href={`mailto:${e}`} className={linkCls}>
          {e}
        </a>
      )),
    },
    contact.address && {
      key: 'address',
      Icon: MapPin,
      title: 'Visit us',
      content: <p className="whitespace-pre-line">{contact.address}</p>,
    },
    contact.workingHours && {
      key: 'hours',
      Icon: Clock,
      title: 'Working hours',
      content: <p>{contact.workingHours}</p>,
    },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <ul className={s.list}>
      {items.map(({ key, Icon, title, content }) => (
        <li key={key} className={s.item}>
          <span className={cn('inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', s.icon)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className={cn('text-base font-semibold', s.title)}>{title}</h3>
            <div className={cn('mt-1', s.body)}>{content}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
