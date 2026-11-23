import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Inbox, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/cn';
import { ENQUIRY_INTENTS, ENQUIRY_STATUSES, PAGE_SIZE, ROUTES } from '@/lib/constants';
import { formatDate, formatPhone } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import PageHeader from '../../components/PageHeader';
import SearchInput from '../../components/SearchInput';
import StatusBadge from '../../components/StatusBadge';
import { useUrlFilters } from '../../components/useUrlFilters';

const FILTER_KEYS = ['type', 'status', 'search', 'from', 'to'];
const TABS = [
  { value: '', label: 'All' },
  { value: 'product', label: 'Product Enquiries' },
  { value: 'general', label: 'General Enquiries' },
];

const typeCell = (e) =>
  e.type === 'product' ? (
    <Badge variant={e.intent === 'order' ? 'accent' : 'brand'}>{e.intent === 'order' ? 'Order' : 'Product'}</Badge>
  ) : (
    <Badge variant="neutral">General</Badge>
  );

export default function EnquiryListPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useUrlFilters(FILTER_KEYS);
  const [toDelete, setToDelete] = useState(null);

  const params = { ...filters, limit: PAGE_SIZE.admin };
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.enquiries(params),
    queryFn: () => adminApi.enquiries.list(params),
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: (id) => adminApi.enquiries.remove(id),
    onSuccess: () => {
      toast.success('Enquiry deleted');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const actions = (e) => (
    <div className="flex items-center justify-end gap-1">
      <Link to={ROUTES.admin.enquiry(e._id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted" aria-label={`View enquiry from ${e.name}`}>
        <Eye className="h-4 w-4" />
      </Link>
      <button type="button" onClick={() => setToDelete(e)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-red-50" aria-label={`Delete enquiry from ${e.name}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const columns = [
    {
      key: 'unread',
      header: <span className="sr-only">Unread</span>,
      className: 'w-6 pr-0',
      cell: (e) => (!e.isRead ? <span className="block h-2.5 w-2.5 rounded-full bg-accent" title="Unread" aria-label="Unread" /> : null),
    },
    {
      key: 'name',
      header: 'Name',
      cell: (e) => (
        <Link to={ROUTES.admin.enquiry(e._id)} className={cn('hover:text-brand-dark', e.isRead ? 'text-primary' : 'font-bold text-primary')}>
          {e.name}
        </Link>
      ),
    },
    { key: 'phone', header: 'Phone', cell: (e) => <span className="whitespace-nowrap">{formatPhone(e.phone)}</span> },
    { key: 'type', header: 'Type', cell: typeCell },
    { key: 'product', header: 'Product', cell: (e) => <span className="line-clamp-1">{e.productSnapshot?.name || '—'}</span> },
    { key: 'msg', header: 'Subject / Message', className: 'max-w-[260px]', cell: (e) => <span className="line-clamp-1 text-ink-muted">{e.subject || e.message}</span> },
    { key: 'status', header: 'Status', cell: (e) => <StatusBadge status={e.status} /> },
    { key: 'date', header: 'Date', cell: (e) => <span className="whitespace-nowrap text-ink-muted">{formatDate(e.createdAt)}</span> },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right', cell: actions },
  ];

  const hasFilters = ['status', 'search', 'from', 'to'].some((k) => filters[k]);

  return (
    <div>
      <Helmet>
        <title>Enquiries | Admin</title>
      </Helmet>
      <PageHeader title="Enquiries" description={data ? `${data.meta.total} enquir${data.meta.total === 1 ? 'y' : 'ies'}` : undefined} />

      <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="Enquiry type" className="flex w-max gap-1 rounded-lg bg-white p-1 shadow-card">
          {TABS.map((t) => (
            <button
              key={t.value || 'all'}
              type="button"
              role="tab"
              aria-selected={filters.type === t.value}
              onClick={() => setFilters({ type: t.value })}
              className={cn(
                'min-h-[40px] whitespace-nowrap rounded-md px-4 text-sm font-semibold',
                filters.type === t.value ? 'bg-primary text-white' : 'text-primary-500 hover:bg-muted',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <FilterBar>
        <SearchInput value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Name, email or phone…" className="lg:w-72" />
        <Select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} className="lg:w-44">
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="w-10 shrink-0">From</span>
          <Input type="date" value={filters.from} onChange={(e) => setFilters({ from: e.target.value })} max={filters.to || undefined} />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="w-10 shrink-0">To</span>
          <Input type="date" value={filters.to} onChange={(e) => setFilters({ to: e.target.value })} min={filters.from || undefined} />
        </label>
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <DataTable
            loading={isLoading}
            columns={columns}
            rows={data?.items}
            rowClassName={(e) => (!e.isRead ? 'bg-accent-50/40' : '')}
            empty={
              <EmptyState
                icon={Inbox}
                title={hasFilters ? 'No enquiries match your filters' : 'No enquiries yet'}
                description={hasFilters ? 'Try changing or clearing the filters.' : 'Enquiries from the website forms will appear here.'}
              />
            }
            renderMobile={(e) => (
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Link to={ROUTES.admin.enquiry(e._id)} className={cn('flex items-center gap-2 text-primary', !e.isRead && 'font-bold')}>
                    {!e.isRead && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                    {e.name}
                  </Link>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">{formatPhone(e.phone)}</p>
                <p className="mt-1 line-clamp-2 text-sm">
                  {e.productSnapshot?.name ? <strong>{e.productSnapshot.name}: </strong> : null}
                  {e.subject || e.message}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    {typeCell(e)}
                    {e.type === 'product' && <span>{ENQUIRY_INTENTS[e.intent]}</span>}
                    <span>{formatDate(e.createdAt)}</span>
                  </div>
                  {actions(e)}
                </div>
              </div>
            )}
          />
          {data && <Pagination className="mt-6" page={data.meta.page} totalPages={data.meta.totalPages} onChange={(page) => setFilters({ page })} />}
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete enquiry?"
        message={`This will permanently delete the enquiry from ${toDelete?.name}.`}
        loading={del.isPending}
        onConfirm={() => del.mutate(toDelete._id)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
