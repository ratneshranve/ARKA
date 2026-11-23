import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/cn';

const NETWORKS = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'x', label: 'X (Twitter)', Icon: Twitter },
];

export default function SocialLinks({ className, itemClassName, size = 'md' }) {
  const { social } = useSettings();
  const items = NETWORKS.filter((n) => social?.[n.key]);
  if (!items.length) return null;

  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {items.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={social[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(
              'inline-flex items-center justify-center rounded-full transition-colors',
              size === 'sm' ? 'h-8 w-8' : 'h-11 w-11',
              itemClassName,
            )}
          >
            <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
