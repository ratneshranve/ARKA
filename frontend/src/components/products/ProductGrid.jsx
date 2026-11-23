import ProductCard from './ProductCard';

export const productGridCls = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export default function ProductGrid({ products }) {
  return (
    <div className={productGridCls}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
