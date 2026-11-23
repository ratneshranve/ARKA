import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import PriceTag from '@/components/products/PriceTag';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Img from '@/components/ui/Img';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import { IMG } from '@/lib/cloudinary';
import { PAGE_SIZE, ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import { useUrlFilters } from '../../components/useUrlFilters';
import VisibilityToggle from '../../components/VisibilityToggle';

const FILTER_KEYS = ['search', 'category', 'status', 'featured'];

export default function ProductListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useUrlFilters(FILTER_KEYS);
  const [toDelete, setToDelete] = useState(null);

  const params = { ...filters, limit: PAGE_SIZE.admin };
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.products(params),
    queryFn: () => adminApi.products.list(params),
    placeholderData: keepPreviousData,
  });
  const { data: categories = [] } = useQuery({ queryKey: queryKeys.admin.categories, queryFn: adminApi.categories.list });

  const invalidate = [['admin', 'products'], queryKeys.admin.dashboard, ['products'], ['product']];
  const del = useMutation({
    mutationFn: (id) => adminApi.products.remove(id),
    onSuccess: () => {
      toast.success('Product deleted');
      setToDelete(null);
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggles = (p) => ({
    published: (
      <VisibilityToggle
        checked={p.isPublished}
        label={`Published: ${p.name}`}
        mutationFn={(v) => adminApi.products.setVisibility(p._id, v)}
        invalidate={invalidate}
        successMessage={(v) => (v ? 'Product published' : 'Product hidden')}
      />
    ),
    featured: (
      <VisibilityToggle
        checked={p.isFeatured}
        label={`Featured: ${p.name}`}
        mutationFn={(v) => adminApi.products.setFeatured(p._id, v)}
        invalidate={invalidate}
        successMessage={(v) => (v ? 'Added to featured' : 'Removed from featured')}
      />
    ),
  });

  const actions = (p) => (
    <div className="flex items-center justify-end gap-1">
      <Link to={ROUTES.admin.productEdit(p._id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted" aria-label={`Edit ${p.name}`}>
        <Pencil className="h-4 w-4" />
      </Link>
      <a
        href={ROUTES.product(p.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted"
        aria-label={`View ${p.name} on site`}
      >
        <ExternalLink className="h-4 w-4" />
      </a>
      <button type="button" onClick={() => setToDelete(p)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-red-50" aria-label={`Delete ${p.name}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const columns = [
    { key: 'img', header: <span className="sr-only">Image</span>, className: 'w-[88px]', cell: (p) => <Img image={p.images?.[0]} alt="" size={IMG.admin} className="w-16 rounded" /> },
    {
      key: 'name',
      header: 'Name',
      cell: (p) => (
        <Link to={ROUTES.admin.productEdit(p._id)} className="line-clamp-2 font-semibold text-primary hover:text-brand-dark">
          {p.name}
        </Link>
      ),
    },
    { key: 'cat', header: 'Category', cell: (p) => p.category?.name ?? '—' },
    { key: 'price', header: 'Price', cell: (p) => <PriceTag price={p.price} className="[&_span:first-child]:text-sm" /> },
    { key: 'pub', header: 'Published', cell: (p) => toggles(p).published },
    { key: 'feat', header: 'Featured', cell: (p) => toggles(p).featured },
    { key: 'updated', header: 'Updated', cell: (p) => <span className="whitespace-nowrap text-ink-muted">{formatDate(p.updatedAt)}</span> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', cell: actions },
  ];

  const hasFilters = FILTER_KEYS.some((k) => filters[k]);

  return (
    <div>
      <Helmet>
        <title>Products | Admin</title>
      </Helmet>
      <PageHeader
        title="Products"
        description={data ? `${data.meta.total} product${data.meta.total === 1 ? '' : 's'}` : undefined}
        actions={
          <Button to={ROUTES.admin.productNew} variant="brand">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Product
          </Button>
        }
      />

      <FilterBar>
        <SearchInput value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search by name…" className="lg:w-72" />
        <Select aria-label="Category" value={filters.category} onChange={(e) => setFilters({ category: e.target.value })} className="lg:w-52">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} className="lg:w-44">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </Select>
        <Select aria-label="Featured" value={filters.featured} onChange={(e) => setFilters({ featured: e.target.value })} className="lg:w-44">
          <option value="">Featured: any</option>
          <option value="true">Featured only</option>
          <option value="false">Not featured</option>
        </Select>
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <DataTable
            loading={isLoading}
            columns={columns}
            rows={data?.items}
            empty={
              <EmptyState
                icon={Package}
                title={hasFilters ? 'No products match your filters' : 'No products yet'}
                description={hasFilters ? 'Try changing or clearing the filters.' : 'Add your first product.'}
                action={
                  !hasFilters && (
                    <Button to={ROUTES.admin.productNew} variant="brand">
                      <Plus className="h-4 w-4" aria-hidden="true" /> Add Product
                    </Button>
                  )
                }
              />
            }
            renderMobile={(p) => (
              <div>
                <div className="flex gap-3">
                  <Img image={p.images?.[0]} alt="" size={IMG.admin} className="w-20 shrink-0 rounded" />
                  <div className="min-w-0 flex-1">
                    <Link to={ROUTES.admin.productEdit(p._id)} className="line-clamp-2 font-semibold text-primary">
                      {p.name}
                    </Link>
                    <p className="text-sm text-ink-muted">{p.category?.name}</p>
                    <PriceTag price={p.price} className="[&_span:first-child]:text-sm" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">{toggles(p).published} Published</span>
                    <span className="flex items-center gap-1">{toggles(p).featured} Featured</span>
                  </div>
                  {actions(p)}
                </div>
              </div>
            )}
          />
          {data && <Pagination className="mt-6" page={data.meta.page} totalPages={data.meta.totalPages} onChange={(page) => setFilters({ page })} />}
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product?"
        message={`This will permanently delete “${toDelete?.name}” and its images.`}
        loading={del.isPending}
        onConfirm={() => del.mutate(toDelete._id)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
