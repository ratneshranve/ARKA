import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Img from '@/components/ui/Img';
import { IMG } from '@/lib/cloudinary';
import { ROUTES } from '@/lib/constants';
import PriceTag from './PriceTag';

/** Whole card is clickable via a stretched link on the title. */
export default function ProductCard({ product }) {
  const cover = product.images?.[0];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <Img
        image={cover}
        alt={cover?.alt || product.name}
        size={IMG.card}
        imgClassName="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col p-4">
        {product.category?.name && (
          <Badge variant="brand" className="mb-2 self-start">
            {product.category.name}
          </Badge>
        )}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-primary">
          <Link to={ROUTES.product(product.slug)} className="after:absolute after:inset-0 focus:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <PriceTag price={product.price} />
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-dark group-hover:text-brand">
            View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-accent ring-offset-2 group-focus-within:ring-2" aria-hidden="true" />
    </article>
  );
}
