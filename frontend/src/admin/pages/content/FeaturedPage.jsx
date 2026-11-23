import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Star, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Img from '@/components/ui/Img';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { IMG } from '@/lib/cloudinary';
import { queryKeys } from '@/lib/queryKeys';
import PageHeader from '../../components/PageHeader';
import SortableList from '../../components/SortableList';

const CONFIG = {
  product: {
    title: 'Featured Products',
    hint: 'Up to 8 are shown on the homepage.',
    api: adminApi.products,
    label: (i) => i.name,
    image: (i) => i.images?.[0],
    publicKey: ['products'],
  },
  project: {
    title: 'Featured Projects',
    hint: 'Up to 6 are shown on the homepage.',
    api: adminApi.projects,
    label: (i) => i.title,
    image: (i) => i.coverImage,
    publicKey: ['projects'],
  },
};

function Picker({ open, type, exclude, onClose, onPick }) {
  const cfg = CONFIG[type];
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'featured-picker', type],
    queryFn: () => cfg.api.list({ status: 'published', limit: 50, sort: type === 'product' ? 'name' : 'title' }),
    enabled: open,
  });
  const items = useMemo(
    () => (data?.items ?? []).filter((i) => !exclude.has(i._id) && cfg.label(i).toLowerCase().includes(search.toLowerCase())),
    [data, exclude, search, cfg],
  );

  return (
    <Modal open={open} onClose={onClose} title={`Add to ${cfg.title.toLowerCase()}`} description="Only published items can be featured.">
      <label htmlFor="picker-search" className="sr-only">
        Search
      </label>
      <Input id="picker-search" type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} data-autofocus />
      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !items.length ? (
          <p className="py-8 text-center text-ink-muted">No items to add.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {items.map((i) => (
              <li key={i._id}>
                <button type="button" onClick={() => onPick(i)} className="flex min-h-[56px] w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted">
                  <Img image={cfg.image(i)} alt="" size={IMG.admin} className="w-14 shrink-0 rounded" />
                  <span className="min-w-0 flex-1 truncate font-medium text-primary">{cfg.label(i)}</span>
                  <Plus className="h-4 w-4 text-brand" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function FeaturedPanel({ type }) {
  const cfg = CONFIG[type];
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.featured(type),
    queryFn: () => cfg.api.list({ featured: 'true', limit: 50, sort: '-updatedAt' }),
  });
  const [items, setItems] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [picker, setPicker] = useState(false);

  useEffect(() => {
    setItems([...(data?.items ?? [])].sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0)));
    setDirty(false);
  }, [data]);

  const save = useMutation({
    mutationFn: () => adminApi.featured.reorder(type, items.map((i) => i._id)),
    onSuccess: () => {
      toast.success(`${cfg.title} saved`);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: cfg.publicKey });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const update = (next) => {
    setItems(next);
    setDirty(true);
  };
  const exclude = useMemo(() => new Set(items.map((i) => i._id)), [items]);

  return (
    <section className="rounded-lg border border-border bg-white shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-primary">{cfg.title}</h3>
          <p className="text-sm text-ink-muted">{cfg.hint} Drag to reorder.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPicker(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add
        </Button>
      </header>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !items.length ? (
          <EmptyState icon={Star} title="Nothing featured yet" description="Add items to show them on the homepage." className="py-10" />
        ) : (
          <SortableList
            items={items}
            getId={(i) => i._id}
            onReorder={update}
            className="space-y-2"
            itemClassName="rounded-lg border border-border bg-white"
            renderItem={(i, idx, handle) => (
              <div className="flex items-center gap-2 p-2">
                {handle}
                <span className="w-6 text-center text-sm font-semibold text-ink-muted">{idx + 1}</span>
                <Img image={cfg.image(i)} alt="" size={IMG.admin} className="w-16 shrink-0 rounded" />
                <span className="min-w-0 flex-1 truncate font-medium text-primary">
                  {cfg.label(i)}
                  {!i.isPublished && <span className="ml-2 text-xs text-danger">(hidden — not shown)</span>}
                </span>
                <button
                  type="button"
                  onClick={() => update(items.filter((x) => x._id !== i._id))}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-danger hover:bg-red-50"
                  aria-label={`Remove ${cfg.label(i)} from featured`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          />
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="brand" onClick={() => save.mutate()} loading={save.isPending} disabled={!dirty}>
            Save {cfg.title.toLowerCase()}
          </Button>
        </div>
      </div>
      <Picker
        open={picker}
        type={type}
        exclude={exclude}
        onClose={() => setPicker(false)}
        onPick={(item) => {
          update([...items, item]);
          setPicker(false);
        }}
      />
    </section>
  );
}

export default function FeaturedPage() {
  return (
    <div>
      <Helmet>
        <title>Featured Items | Admin</title>
      </Helmet>
      <PageHeader title="Featured Items" description="Choose which products and projects appear on the homepage, and in what order." />
      <div className="grid gap-6 xl:grid-cols-2">
        <FeaturedPanel type="product" />
        <FeaturedPanel type="project" />
      </div>
    </div>
  );
}
