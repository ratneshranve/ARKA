import { Briefcase, Eye, History, Mail, MapPin, Phone, Sun, Target } from 'lucide-react';
import Markdown from '@/components/common/Markdown';
import PageHero from '@/components/common/PageHero';
import Seo from '@/components/common/Seo';
import Button from '@/components/ui/Button';
import Img from '@/components/ui/Img';
import Skeleton from '@/components/ui/Skeleton';
import { useSettings } from '@/hooks/useSettings';
import { IMG } from '@/lib/cloudinary';
import { LOGO_ICON, ROUTES } from '@/lib/constants';
import { telHref } from '@/lib/format';

function InfoBlock({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-card sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-dark">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <Markdown className="text-ink-muted">{children}</Markdown>
    </div>
  );
}

export default function AboutPage() {
  const { settings, company, contact, isLoading } = useSettings();
  const about = settings.about ?? {};
  const phone = contact.phones?.[0];
  const email = contact.emails?.[0];

  return (
    <>
      <Seo title="About Us" description={`Learn about ${company.name} — our background, experience, vision and mission.`} />
      <PageHero title="About Us" subtitle={company.tagline} breadcrumbs={[{ label: 'About Us' }]} image={about.heroImage} />

      {isLoading ? (
        <div className="container-page section space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <>
          {(about.overview || about.background) && (
            <section className="section">
              <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div>
                  {about.overview && (
                    <>
                      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-dark">
                        <span className="h-0.5 w-6 rounded bg-accent" aria-hidden="true" /> Who we are
                      </p>
                      <h2 className="text-2xl font-bold sm:text-3xl">Company Overview</h2>
                      <Markdown className="mt-4 text-ink-muted">{about.overview}</Markdown>
                    </>
                  )}
                  {about.background && (
                    <div className="mt-8">
                      <h3 className="flex items-center gap-2 text-xl font-bold">
                        <History className="h-5 w-5 text-accent-deep" aria-hidden="true" /> Our Background
                      </h3>
                      <Markdown className="mt-3 text-ink-muted">{about.background}</Markdown>
                    </div>
                  )}
                </div>
                {about.heroImage?.url ? (
                  <Img image={about.heroImage} alt={company.name} size={IMG.intro} ratio="9/7" className="rounded-2xl shadow-card-hover" />
                ) : (
                  <div className="flex aspect-[9/7] items-center justify-center rounded-2xl bg-gradient-to-br from-accent-50 to-brand-50 shadow-card">
                    <img src={LOGO_ICON} alt="" width="783" height="525" className="w-3/5" loading="lazy" />
                  </div>
                )}
              </div>
            </section>
          )}

          {(about.businessInfo || about.experience) && (
            <section className="section bg-muted">
              <div className="container-page grid gap-6 md:grid-cols-2">
                {about.businessInfo && (
                  <InfoBlock icon={Briefcase} title="Business Information">
                    {about.businessInfo}
                  </InfoBlock>
                )}
                {about.experience && (
                  <InfoBlock icon={Sun} title="Solar Industry Experience">
                    {about.experience}
                  </InfoBlock>
                )}
              </div>
            </section>
          )}

          {(about.vision || about.mission) && (
            <section className="section">
              <div className="container-page grid gap-6 md:grid-cols-2">
                {about.vision && (
                  <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sun-gradient opacity-30 blur-xl" aria-hidden="true" />
                    <Eye className="relative h-10 w-10 text-accent" aria-hidden="true" />
                    <h2 className="relative mt-4 text-2xl font-bold text-white">Our Vision</h2>
                    <Markdown className="relative mt-3 prose-invert text-primary-100 prose-p:text-primary-100">{about.vision}</Markdown>
                  </div>
                )}
                {about.mission && (
                  <div className="relative overflow-hidden rounded-2xl bg-brand-dark p-8 text-white">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white opacity-10 blur-xl" aria-hidden="true" />
                    <Target className="relative h-10 w-10 text-accent-light" aria-hidden="true" />
                    <h2 className="relative mt-4 text-2xl font-bold text-white">Our Mission</h2>
                    <Markdown className="relative mt-3 prose-invert text-white/90 prose-p:text-white/90">{about.mission}</Markdown>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      <section className="border-t border-border bg-muted py-10">
        <div className="container-page flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
            {phone && (
              <li>
                <a href={telHref(phone)} className="flex min-h-[44px] items-center gap-3 font-semibold text-primary hover:text-brand-dark">
                  <Phone className="h-5 w-5 text-brand" aria-hidden="true" /> {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="flex min-h-[44px] items-center gap-3 break-all font-semibold text-primary hover:text-brand-dark">
                  <Mail className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" /> {email}
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex min-h-[44px] items-center gap-3 text-primary">
                <MapPin className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" /> {contact.address}
              </li>
            )}
          </ul>
          <Button to={ROUTES.contact} size="lg">
            Contact Us
          </Button>
        </div>
      </section>
    </>
  );
}
