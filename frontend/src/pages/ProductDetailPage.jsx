import { CheckCircle2, MessageSquareText, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getErrorStatus } from '@/api/http';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Seo from '@/components/common/Seo';
import ProductEnquiryForm from '@/components/forms/ProductEnquiryForm';
import PriceTag from '@/components/products/PriceTag';
import ProductCard from '@/components/products/ProductCard';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfoTabs from '@/components/products/ProductInfoTabs';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useProduct } from '@/hooks/usePublicData';
import { ROUTES } from '@/lib/constants';
import NotFoundPage from './NotFoundPage';

function DetailSkeleton() {
  return (
    <div className="container-page py-10" role="status" aria-label="Loading product">
      <Skeleton className="mb-8 h-4 w-64" />
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const [intent, setIntent] = useState('enquiry');
  const formRef = useRef(null);

  // Reserve space for the mobile sticky action bar so it never covers the footer.
  useEffect(() => {
    document.body.classList.add('has-sticky-bar');
    return () => document.body.classList.remove('has-sticky-bar');
  }, []);

  if (isLoading) return <DetailSkeleton />;
  if (isError && getErrorStatus(error) === 404) return <NotFoundPage title="Product not found" />;
  if (isError) {
    return (
      <div className="container-page section">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  const openForm = (value) => {
    setIntent(value);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => formRef.current?.querySelector('input:not([type=radio]):not([tabindex="-1"])')?.focus({ preventScroll: true }), 500);
  };

  const ctas = (
    <>
      <Button size="lg" onClick={() => openForm('enquiry')} className="flex-1 sm:flex-none">
        <MessageSquareText className="h-5 w-5" aria-hidden="true" /> Send Enquiry
      </Button>
      <Button size="lg" variant="secondary" onClick={() => openForm('order')} className="flex-1 sm:flex-none">
        <ShoppingBag className="h-5 w-5" aria-hidden="true" /> Request Order
      </Button>
    </>
  );

  return (
    <div>
      <Seo
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.shortDescription}
        image={product.images?.[0]?.url}
        type="product"
      />

      <div className="border-b border-border bg-muted">
        <div className="container-page py-4">
          <Breadcrumbs
            items={[
              { label: 'Products', to: ROUTES.products },
              { label: product.category?.name, to: `${ROUTES.products}?category=${product.category?.slug}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <section className="container-page py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />
          <div>
            {product.category?.name && <Badge variant="brand">{product.category.name}</Badge>}
            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">{product.name}</h1>
            <PriceTag price={product.price} size="lg" className="mt-4" />
            <p className="mt-4 text-base text-ink-muted md:text-lg">{product.shortDescription}</p>
            <div className="mt-8 hidden flex-wrap gap-3 md:flex">{ctas}</div>
            <ul className="mt-8 space-y-2 text-sm text-ink-muted">
              {['Genuine products with manufacturer warranty', 'Professional installation by our team', 'Free site survey and quotation'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <ProductInfoTabs key={product._id} product={product} />
        </div>
      </section>

      <section id="enquiry" ref={formRef} className="bg-muted py-12 md:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
            <h2 className="text-2xl font-bold">{intent === 'order' ? 'Request an Order' : 'Send an Enquiry'}</h2>
            <p className="mt-1 text-ink-muted">Fill in your details and our team will get back to you shortly.</p>
            <div className="mt-6">
              <ProductEnquiryForm key={product._id} product={product} intent={intent} onIntentChange={setIntent} />
            </div>
          </div>
        </div>
      </section>

      {product.related?.length > 0 && (
        <section className="section">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Related Products</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {product.related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky action bar — mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-border bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,.08)] backdrop-blur md:hidden">
        {ctas}
      </div>
    </div>
  );
}
