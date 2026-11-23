import { ArrowRight } from 'lucide-react';
import Markdown from '@/components/common/Markdown';
import Button from '@/components/ui/Button';
import Img from '@/components/ui/Img';
import { useSettings } from '@/hooks/useSettings';
import { IMG } from '@/lib/cloudinary';
import { LOGO_ICON, ROUTES } from '@/lib/constants';

/** Home "About Us" section — title, text and image come from Admin › Site Settings › Home Intro. */
export default function CompanyIntro() {
  const { settings, company } = useSettings();
  const home = settings.home ?? {};

  return (
    <section id="about" className="section">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          {home.introImage?.url ? (
            <Img image={home.introImage} alt={home.introImage.alt || company.name} size={IMG.intro} ratio="9/7" className="rounded-2xl shadow-card-hover" />
          ) : (
            <div className="flex aspect-[9/7] items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-brand-50 shadow-card">
              <img src={LOGO_ICON} alt="" width="783" height="525" className="w-3/5" loading="lazy" />
            </div>
          )}
        </div>
        <div className="order-1 lg:order-2">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-dark">
            <span className="h-0.5 w-6 rounded bg-accent" aria-hidden="true" />
            About {company.name}
          </p>
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{home.introTitle || company.tagline}</h2>
          {home.introText && <Markdown className="mt-5 text-ink-muted">{home.introText}</Markdown>}
          <Button to={ROUTES.about} variant="secondary" size="lg" className="mt-8">
            Know More About Us <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
