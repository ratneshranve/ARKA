import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/hooks/usePublicData';
import { ROUTES } from '@/lib/constants';

const HOME_LIMIT = 4;
// One row of 4 on desktop, 2 per row on tablet, 1 on mobile
const gridCls = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4';

/** Home "Products" section — the first 4 featured products (admin-defined order) + a link to all products. */
export default function FeaturedProducts() {
  const { data, isLoading, isError } = useProducts({ featured: true, limit: HOME_LIMIT });
  const items = data?.items ?? [];
  if (isError || (!isLoading && !items.length)) return null;

  return (
    <section id="products" className="section bg-muted">
      <div className="container-page">
        <SectionHeading eyebrow="Our Products" title="Quality solar products we supply & install" />
        {isLoading ? (
          <GridSkeleton count={HOME_LIMIT} className={gridCls} />
        ) : (
          <div className={gridCls}>
            {items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Button to={ROUTES.products} variant="outline" size="lg" className="w-full sm:w-auto">
            View All Products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
