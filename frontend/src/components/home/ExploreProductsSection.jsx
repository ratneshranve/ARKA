import { ArrowRight, BatteryCharging, CheckCircle2, ShieldCheck, Sun, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

const HIGHLIGHTS = [
  {
    icon: Sun,
    title: 'Tier-1 Solar Panels',
    description: 'Mono PERC & Bifacial TOPCon high-wattage modules engineered for maximum sunlight absorption.',
  },
  {
    icon: Zap,
    title: 'Smart Inverters',
    description: 'On-grid, off-grid and hybrid inverters with built-in Wi-Fi monitoring and high surge capacity.',
  },
  {
    icon: BatteryCharging,
    title: 'Energy Storage Systems',
    description: 'Lithium-ion and heavy-duty tubular solar batteries designed for long cycle life and reliable backup.',
  },
  {
    icon: ShieldCheck,
    title: 'Agricultural & Utility Pumps',
    description: 'Solar water pumps and lighting solutions certified under government and MNRE standards.',
  },
];

export default function ExploreProductsSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-8 sm:p-12 lg:p-16 text-white shadow-xl">
          {/* Subtle background glow effects */}
          <div
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand opacity-20 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
              <CheckCircle2 className="h-3.5 w-3.5" /> High-Efficiency Solar Equipment
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              Explore Our Complete Range of Solar Products
            </h2>

            <p className="mt-4 text-base text-primary-100 sm:text-lg leading-relaxed">
              We supply authentic, certified solar panels, smart hybrid inverters, energy storage batteries, and solar
              water pumps from leading manufacturers — backed by up to 25-year performance warranties.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button to={ROUTES.products} size="lg" className="bg-accent text-primary font-bold hover:bg-accent/90 shadow-md">
                Explore All Products <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button to={ROUTES.contact} size="lg" variant="outline-light">
                Request Product Pricing
              </Button>
            </div>
          </div>

          {/* Product category highlight grid */}
          <div className="relative z-10 mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs text-primary-200 line-clamp-2 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
