import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Inbox, MailOpen, Package, Plus, SunMedium } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin.api';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { ENQUIRY_INTENTS, ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

function StatCard({ icon: Icon, label, value, sub, to, tone }) {
  return (
    <Link to={to} className="group rounded-lg border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold text-primary">{value}</p>
        </div>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{sub}</p>
    </Link>
  );
}

const typeLabel = (e) => (e.type === 'product' ? `Product · ${ENQUIRY_INTENTS[e.intent] ?? 'Enquiry'}` : 'General');

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: adminApi.dashboard });

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (e) => (
        <span className="flex items-center gap-2 font-semibold text-primary">
          {!e.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
          {e.name}
        </span>
      ),
    },
    { key: 'type', header: 'Type', cell: (e) => typeLabel(e) },
    { key: 'product', header: 'Product / Subject', cell: (e) => <span className="line-clamp-1">{e.productSnapshot?.name || e.subject || '—'}</span> },
    { key: 'date', header: 'Date', cell: (e) => <span className="whitespace-nowrap">{formatDate(e.createdAt)}</span> },
    { key: 'status', header: 'Status', cell: (e) => <StatusBadge status={e.status} /> },
    {
      key: 'view',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (e) => (
        <Link to={ROUTES.admin.enquiry(e._id)} className="link text-sm">
          View
        </Link>
      ),
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Dashboard | Admin</title>
      </Helmet>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button to={ROUTES.admin.productNew} variant="brand" size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Product
        </Button>
        <Button to={ROUTES.admin.projectNew} variant="secondary" size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Project
        </Button>
        <Button to={ROUTES.admin.enquiries} variant="outline" size="sm">
          <Inbox className="h-4 w-4" aria-hidden="true" /> View Enquiries
        </Button>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)
            ) : (
              <>
                <StatCard
                  icon={Package}
                  label="Total Products"
                  value={data.products.total}
                  sub={`${data.products.published} published · ${data.products.hidden} hidden`}
                  to={ROUTES.admin.products}
                  tone="bg-accent-50 text-accent-deep"
                />
                <StatCard
                  icon={SunMedium}
                  label="Total Projects"
                  value={data.projects.total}
                  sub={`${data.projects.published} published · ${data.projects.hidden} hidden`}
                  to={ROUTES.admin.projects}
                  tone="bg-panel-50 text-panel"
                />
                <StatCard
                  icon={MailOpen}
                  label="New Enquiries"
                  value={data.enquiries.new}
                  sub={`${data.enquiries.unread} unread`}
                  to={`${ROUTES.admin.enquiries}?status=new`}
                  tone="bg-red-50 text-danger"
                />
                <StatCard
                  icon={Inbox}
                  label="Total Enquiries"
                  value={data.enquiries.total}
                  sub={`${data.enquiries.product} product · ${data.enquiries.general} general`}
                  to={ROUTES.admin.enquiries}
                  tone="bg-brand-50 text-brand-dark"
                />
              </>
            )}
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Recent Enquiries</h2>
              <Link to={ROUTES.admin.enquiries} className="link inline-flex items-center gap-1 text-sm">
                View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <DataTable
              loading={isLoading}
              columns={columns}
              rows={data?.latestEnquiries}
              empty={<EmptyState icon={Inbox} title="No enquiries yet" description="Enquiries from the website will appear here." />}
              renderMobile={(e) => (
                <Link to={ROUTES.admin.enquiry(e._id)} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold text-primary">
                      {!e.isRead && <span className="h-2 w-2 rounded-full bg-accent" aria-label="Unread" />}
                      {e.name}
                    </span>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{e.productSnapshot?.name || e.subject || typeLabel(e)}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                    <Badge>{typeLabel(e)}</Badge>
                    <span>{formatDate(e.createdAt)}</span>
                  </div>
                </Link>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
