import { MessageSquareText, PackageOpen } from 'lucide-react';
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '@/components/common/PageHero';
import Seo from '@/components/common/Seo';
import CategoryTabs from '@/components/products/CategoryTabs';
import ProductGrid, { productGridCls } from '@/components/products/ProductGrid';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pagination from '@/components/ui/Pagination';
import Skeleton, { GridSkeleton } from '@/components/ui/Skeleton';
import { useCategories, useProducts } from '@/hooks/usePublicData';
import { PAGE_SIZE, ROUTES } from '@/lib/constants';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const topRef = useRef(null);

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ category: category || undefined, page, limit: PAGE_SIZE.products });
  const activeCategory = categoriesQuery.data?.find((c) => c.slug === category);

  const update = (next) => {
    const merged = { category, page: String(page), ...next };
    const clean = Object.fromEntries(Object.entries(merged).filter(([k, v]) => v && !(k === 'page' && v === '1')));
    setParams(clean);
  };

  const changePage = (p) => {
    update({ page: String(p) });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = productsQuery;

  return (
    <>
      <Seo
        title={activeCategory ? `${activeCategory.name} — Products` : 'Products'}
        description={activeCategory?.description || 'Browse solar panels, inverters, batteries and other solar products. Send an enquiry or request an order online.'}
      />
      <PageHero
        title={activeCategory ? activeCategory.name : 'Our Products'}
        subtitle={activeCategory?.description || 'Genuine solar products supplied and installed by our expert team.'}
        breadcrumbs={activeCategory ? [{ label: 'Products', to: ROUTES.products }, { label: activeCategory.name }] : [{ label: 'Products' }]}
      />

      <section className="section" ref={topRef} id="product-list">
        <div className="container-page">
          <div className="mb-8">
            {categoriesQuery.isLoading ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-28 rounded-full" />
                ))}
              </div>
            ) : (
              <CategoryTabs categories={categoriesQuery.data ?? []} active={category} onChange={(slug) => update({ category: slug, page: '1' })} />
            )}
          </div>

          {isLoading ? (
            <GridSkeleton count={8} className={productGridCls} />
          ) : isError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : !data?.items.length ? (
            <EmptyState
              icon={PackageOpen}
              title="No products found"
              description={category ? 'There are no products in this category yet.' : 'Products will appear here soon.'}
              action={
                <Button to={ROUTES.contact}>
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" /> Contact Us
                </Button>
              }
            />
          ) : (
            <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={isPlaceholderData}>
              <ProductGrid products={data.items} />
              <Pagination className="mt-10" page={data.meta.page} totalPages={data.meta.totalPages} onChange={changePage} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
