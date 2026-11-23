import { MessageSquareText, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { ROUTES } from '@/lib/constants';
import { telHref } from '@/lib/format';

export default function CtaBand({
  title = 'Planning a solar installation? Talk to us.',
  text = 'Get a free site survey and a no-obligation quote from our solar experts.',
}) {
  const { contact } = useSettings();
  const phone = contact.phones?.[0];

  return (
    <section className="section">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 sm:px-10 md:py-14">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sun-gradient opacity-30 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-10 h-56 w-80 rounded-full bg-brand opacity-30 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
              <p className="mt-2 text-primary-100">{text}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button to={ROUTES.contact} size="lg">
                <MessageSquareText className="h-5 w-5" aria-hidden="true" /> Get a Quote
              </Button>
              {phone && (
                <Button href={telHref(phone)} variant="outline-light" size="lg">
                  <Phone className="h-5 w-5" aria-hidden="true" /> Call {phone}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
