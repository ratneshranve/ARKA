import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, ExternalLink, Mail, Pencil, Phone, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { getErrorMessage, getErrorStatus } from '@/api/http';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { ENQUIRY_INTENTS, ENQUIRY_STATUSES, ROUTES } from '@/lib/constants';
import { formatDateTime, formatPhone, telHref } from '@/lib/format';
import { queryKeys } from '@/lib/queryKeys';
import NotFoundPage from '@/pages/NotFoundPage';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

function Row({ label, children }) {
  if (children === undefined || children === null || children === '') return null;
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-ink sm:col-span-2">{children}</dd>
    </div>
  );
}

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('new');
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: enquiry, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.enquiry(id),
    queryFn: () => adminApi.enquiries.get(id),
  });

  useEffect(() => {
    if (!enquiry) return;
    setStatus(enquiry.status);
    setNote(enquiry.adminNote || '');
    // Opening marks it read → refresh the unread badge and lists.
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
    queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] });
  }, [enquiry, queryClient]);

  const save = useMutation({
    mutationFn: () => adminApi.enquiries.update(id, { status, adminNote: note }),
    onSuccess: (data) => {
      toast.success('Enquiry updated');
      queryClient.setQueryData(queryKeys.admin.enquiry(id), data);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const del = useMutation({
    mutationFn: () => adminApi.enquiries.remove(id),
    onSuccess: () => {
      toast.success('Enquiry deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'enquiries'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      navigate(ROUTES.admin.enquiries, { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader />;
  if (isError) {
    return getErrorStatus(error) === 404 ? <NotFoundPage admin title="Enquiry not found" /> : <ErrorState error={error} onRetry={refetch} />;
  }

  const isProduct = enquiry.type === 'product';
  const product = enquiry.product;
  const productName = product?.name || enquiry.productSnapshot?.name;
  const dirty = status !== enquiry.status || note !== (enquiry.adminNote || '');

  return (
    <div>
      <Helmet>
        <title>{`Enquiry from ${enquiry.name} | Admin`}</title>
      </Helmet>
      <PageHeader
        title={`Enquiry from ${enquiry.name}`}
        backTo={ROUTES.admin.enquiries}
        backLabel="All enquiries"
        actions={
          <Button variant="outline" onClick={() => setConfirmDelete(true)} className="!border-danger !text-danger hover:!bg-red-50">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-border bg-white p-5 shadow-card">
            <h3 className="mb-4 text-base font-bold">Customer</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <User className="h-5 w-5 text-brand" aria-hidden="true" />
                <span className="font-semibold text-primary">{enquiry.name}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand" aria-hidden="true" />
                <a href={telHref(enquiry.phone)} className="link">
                  {formatPhone(enquiry.phone)}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <a href={`mailto:${enquiry.email}`} className="link break-all">
                  {enquiry.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-ink-muted">
                <Calendar className="h-5 w-5 text-brand" aria-hidden="true" />
                Received {formatDateTime(enquiry.createdAt)}
              </li>
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-base font-bold">Request</h3>
              <StatusBadge status={enquiry.status} />
            </div>
            <dl className="divide-y divide-border">
              <Row label="Type">{isProduct ? 'Product enquiry' : 'General enquiry'}</Row>
              {isProduct && <Row label="Intent">{ENQUIRY_INTENTS[enquiry.intent]}</Row>}
              {isProduct && (
                <Row label="Product">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-primary">{productName}</span>
                    {product?._id ? (
                      <>
                        {product.isPublished && (
                          <a href={ROUTES.product(product.slug)} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-sm">
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> View on site
                          </a>
                        )}
                        <Link to={ROUTES.admin.productEdit(product._id)} className="link inline-flex items-center gap-1 text-sm">
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit product
                        </Link>
                      </>
                    ) : (
                      <span className="text-sm text-ink-muted">(product has been deleted)</span>
                    )}
                  </span>
                </Row>
              )}
              {isProduct && <Row label="Quantity">{enquiry.quantity}</Row>}
              {!isProduct && <Row label="Subject">{enquiry.subject}</Row>}
              <Row label="Message">
                <p className="whitespace-pre-wrap">{enquiry.message}</p>
              </Row>
              {enquiry.meta?.pageUrl && (
                <Row label="Sent from">
                  <span className="break-all text-sm text-ink-muted">{enquiry.meta.pageUrl}</span>
                </Row>
              )}
            </dl>
          </section>
        </div>

        <section className="h-fit rounded-lg border border-border bg-white p-5 shadow-card lg:sticky lg:top-24">
          <h3 className="mb-4 text-base font-bold">Manage</h3>
          <div className="space-y-5">
            <Field id="enq-status" label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="enq-note" label="Internal note" hint="Only visible to admins." counter={`${note.length}/2000`}>
              <Textarea rows={6} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <Button variant="brand" className="w-full" onClick={() => save.mutate()} loading={save.isPending} disabled={!dirty}>
              Save
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete enquiry?"
        message={`This will permanently delete the enquiry from ${enquiry.name}.`}
        loading={del.isPending}
        onConfirm={() => del.mutate()}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
