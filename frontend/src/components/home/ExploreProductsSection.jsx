import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { ROUTES } from '@/lib/constants';

/**
 * Clean, lightweight Explore Products callout section matching the website's neutral theme.
 * Displays title, concise value proposition, and an action button to open the full products page.
 */
export default function ExploreProductsSection() {
  return (
    <section className="section bg-white border-b border-border/40">
      <div className="container-page">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-slate-50/70 px-6 py-10 sm:px-12 sm:py-14 text-center shadow-sm">
          <SectionHeading
            eyebrow="Equipment & Solutions"
            title="Explore Our Complete Range of Solar Products"
            subtitle="Tier-1 monocrystalline panels, on-grid & hybrid smart inverters, lithium energy storage batteries, and agricultural solar pumps backed by comprehensive manufacturer warranties."
          />

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button to={ROUTES.products} size="lg" className="w-full sm:w-auto">
              Explore All Products <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button to={ROUTES.contact} size="lg" variant="outline" className="w-full sm:w-auto">
              Request Price List
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
