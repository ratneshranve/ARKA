import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Pencil, Plus, SunMedium, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Img from '@/components/ui/Img';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import { IMG } from '@/lib/cloudinary';
import { PAGE_SIZE, projectTypeLabel, ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import { useUrlFilters } from '../../components/useUrlFilters';
import VisibilityToggle from '../../components/VisibilityToggle';

const FILTER_KEYS = ['search', 'status', 'featured'];

export default function ProjectListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useUrlFilters(FILTER_KEYS);
  const [toDelete, setToDelete] = useState(null);

  const params = { ...filters, limit: PAGE_SIZE.admin };
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.projects(params),
    queryFn: () => adminApi.projects.list(params),
    placeholderData: keepPreviousData,
  });

  const invalidate = [['admin', 'projects'], queryKeys.admin.dashboard, ['projects'], ['project']];
  const del = useMutation({
    mutationFn: (id) => adminApi.projects.remove(id),
    onSuccess: () => {
      toast.success('Project deleted');
      setToDelete(null);
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggles = (p) => ({
    published: (
      <VisibilityToggle
        checked={p.isPublished}
        label={`Published: ${p.title}`}
        mutationFn={(v) => adminApi.projects.setVisibility(p._id, v)}
        invalidate={invalidate}
        successMessage={(v) => (v ? 'Project published' : 'Project hidden')}
      />
    ),
    featured: (
      <VisibilityToggle
        checked={p.isFeatured}
        label={`Featured: ${p.title}`}
        mutationFn={(v) => adminApi.projects.setFeatured(p._id, v)}
        invalidate={invalidate}
        successMessage={(v) => (v ? 'Added to featured' : 'Removed from featured')}
      />
    ),
  });

  const actions = (p) => (
    <div className="flex items-center justify-end gap-1">
      <Link to={ROUTES.admin.projectEdit(p._id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted" aria-label={`Edit ${p.title}`}>
        <Pencil className="h-4 w-4" />
      </Link>
      <a
        href={ROUTES.project(p.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted"
        aria-label={`View ${p.title} on site`}
      >
        <ExternalLink className="h-4 w-4" />
      </a>
      <button type="button" onClick={() => setToDelete(p)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-red-50" aria-label={`Delete ${p.title}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const columns = [
    { key: 'img', header: <span className="sr-only">Image</span>, className: 'w-[88px]', cell: (p) => <Img image={p.coverImage} alt="" size={IMG.admin} className="w-16 rounded" /> },
    {
      key: 'title',
      header: 'Title',
      cell: (p) => (
        <Link to={ROUTES.admin.projectEdit(p._id)} className="line-clamp-2 font-semibold text-primary hover:text-brand-dark">
          {p.title}
        </Link>
      ),
    },
    { key: 'loc', header: 'Location', cell: (p) => <span className="line-clamp-1">{p.location}</span> },
    { key: 'cap', header: 'Capacity / Type', cell: (p) => [p.capacity, projectTypeLabel(p.projectType)].filter(Boolean).join(' · ') || '—' },
    { key: 'pub', header: 'Published', cell: (p) => toggles(p).published },
    { key: 'feat', header: 'Featured', cell: (p) => toggles(p).featured },
    { key: 'updated', header: 'Updated', cell: (p) => <span className="whitespace-nowrap text-ink-muted">{formatDate(p.updatedAt)}</span> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', cell: actions },
  ];

  const hasFilters = FILTER_KEYS.some((k) => filters[k]);

  return (
    <div>
      <Helmet>
        <title>Projects | Admin</title>
      </Helmet>
      <PageHeader
        title="Projects"
        description={data ? `${data.meta.total} project${data.meta.total === 1 ? '' : 's'}` : undefined}
        actions={
          <Button to={ROUTES.admin.projectNew} variant="brand">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Project
          </Button>
        }
      />

      <FilterBar>
        <SearchInput value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search by title…" className="lg:w-72" />
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
                icon={SunMedium}
                title={hasFilters ? 'No projects match your filters' : 'No projects yet'}
                description={hasFilters ? 'Try changing or clearing the filters.' : 'Add your first project.'}
                action={
                  !hasFilters && (
                    <Button to={ROUTES.admin.projectNew} variant="brand">
                      <Plus className="h-4 w-4" aria-hidden="true" /> Add Project
                    </Button>
                  )
                }
              />
            }
            renderMobile={(p) => (
              <div>
                <div className="flex gap-3">
                  <Img image={p.coverImage} alt="" size={IMG.admin} className="w-20 shrink-0 rounded" />
                  <div className="min-w-0 flex-1">
                    <Link to={ROUTES.admin.projectEdit(p._id)} className="line-clamp-2 font-semibold text-primary">
                      {p.title}
                    </Link>
                    <p className="truncate text-sm text-ink-muted">{p.location}</p>
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
        title="Delete project?"
        message={`This will permanently delete “${toDelete?.title}” and all its images.`}
        loading={del.isPending}
        onConfirm={() => del.mutate(toDelete._id)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
