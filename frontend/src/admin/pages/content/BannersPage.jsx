import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Images, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { adminApi } from '@/api/admin.api';
import { applyServerErrors, getErrorMessage } from '@/api/http';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import Img from '@/components/ui/Img';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { queryKeys } from '@/lib/queryKeys';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageHeader from '../../components/PageHeader';
import SingleImageField from '../../components/SingleImageField';
import SortableList from '../../components/SortableList';
import VisibilityToggle from '../../components/VisibilityToggle';

const MAX_BANNERS = 8;

const schema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(120),
  subtitle: z.string().trim().max(250),
  image: z.any().refine((v) => v && v.url, 'A desktop image is required'),
  mobileImage: z.any().nullable(),
  ctaLabel: z.string().trim().max(40),
  ctaLink: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//i.test(v), 'Use a path like /products or a full https:// URL'),
  isActive: z.boolean(),
});

const EMPTY = { title: '', subtitle: '', image: null, mobileImage: null, ctaLabel: '', ctaLink: '', isActive: true };

function BannerModal({ open, banner, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(banner);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(banner ? { ...EMPTY, ...banner, mobileImage: banner.mobileImage ?? null } : EMPTY);
  }, [open, banner, reset]);

  const save = useMutation({
    mutationFn: (values) => (isEdit ? adminApi.banners.update(banner._id, values) : adminApi.banners.create(values)),
    onSuccess: () => {
      toast.success(isEdit ? 'Banner updated' : 'Banner added');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.banners });
      queryClient.invalidateQueries({ queryKey: queryKeys.banners });
      onClose();
    },
    onError: (err) => {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    },
  });

  const submit = handleSubmit((v) => save.mutate(v));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit banner' : 'Add banner'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Add banner'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field id="b-title" label="Title" required error={errors.title?.message}>
          <Input maxLength={120} data-autofocus {...register('title')} />
        </Field>
        <Field id="b-subtitle" label="Subtitle" error={errors.subtitle?.message}>
          <Textarea rows={2} maxLength={250} {...register('subtitle')} />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">
            Desktop image <span className="text-danger">*</span>
          </p>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <SingleImageField value={field.value} onChange={field.onChange} folder="banners" ratio="12/5" invalid={Boolean(errors.image)} hint="Recommended 1920 × 800 px (at least 1600 px wide)." />
            )}
          />
          {errors.image && <p className="mt-1 text-sm text-danger">{errors.image.message}</p>}
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Mobile image (optional)</p>
          <Controller
            control={control}
            name="mobileImage"
            render={({ field }) => (
              <SingleImageField value={field.value} onChange={field.onChange} folder="banners" ratio="4/5" hint="Recommended 800 × 1000 px (portrait). Used on phones if provided." />
            )}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="b-cta-label" label="Button label" error={errors.ctaLabel?.message} hint='e.g. "Get a Quote"'>
            <Input maxLength={40} {...register('ctaLabel')} />
          </Field>
          <Field id="b-cta-link" label="Button link" error={errors.ctaLink?.message} hint="/contact, /products or https://…">
            <Input {...register('ctaLink')} />
          </Field>
        </div>
        <Controller control={control} name="isActive" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Active (shown on homepage)" />} />
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

export default function BannersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: queryKeys.admin.banners, queryFn: adminApi.banners.list });
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ open: false, banner: null });
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    setItems(data ?? []);
  }, [data]);

  const invalidate = [queryKeys.admin.banners, queryKeys.banners];

  const reorder = useMutation({
    mutationFn: (ids) => adminApi.banners.reorder(ids),
    onSuccess: () => {
      toast.success('Order saved');
      queryClient.invalidateQueries({ queryKey: queryKeys.banners });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setItems(data ?? []);
    },
  });

  const del = useMutation({
    mutationFn: (id) => adminApi.banners.remove(id),
    onSuccess: () => {
      toast.success('Banner deleted');
      setToDelete(null);
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const canAdd = items.length < MAX_BANNERS;

  return (
    <div>
      <Helmet>
        <title>Homepage Banners | Admin</title>
      </Helmet>
      <PageHeader
        title="Homepage Banners"
        description={`Slides at the top of the homepage. Drag to reorder. ${items.length}/${MAX_BANNERS} used.`}
        actions={
          <Button variant="brand" onClick={() => setModal({ open: true, banner: null })} disabled={!canAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Banner
          </Button>
        }
      />

      <div className="mb-5 flex gap-3 rounded-lg border border-panel/20 bg-panel-50 p-4 text-sm text-panel">
        <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          Recommended sizes: <strong>desktop 1920 × 800 px</strong> (landscape) and optional <strong>mobile 800 × 1000 px</strong> (portrait). Keep the main subject on the right — the title is shown on the left.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !items.length ? (
        <EmptyState
          icon={Images}
          title="No banners yet"
          description="Without banners the homepage shows a simple hero with your company name and tagline."
          action={
            <Button variant="brand" onClick={() => setModal({ open: true, banner: null })}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Banner
            </Button>
          }
        />
      ) : (
        <SortableList
          items={items}
          getId={(b) => b._id}
          onReorder={(next) => {
            setItems(next);
            reorder.mutate(next.map((b) => b._id));
          }}
          className="space-y-3"
          itemClassName="rounded-lg border border-border bg-white shadow-card"
          renderItem={(b, i, handle) => (
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                {handle}
                <span className="w-6 text-center text-sm font-semibold text-ink-muted">{i + 1}</span>
                <Img image={b.image} alt="" size={{ w: 320, h: 133, crop: 'fill' }} ratio="12/5" className="w-48 shrink-0 rounded" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-primary">{b.title}</p>
                {b.subtitle && <p className="line-clamp-1 text-sm text-ink-muted">{b.subtitle}</p>}
                {b.ctaLabel && <p className="mt-1 text-xs text-ink-muted">Button: {b.ctaLabel} → {b.ctaLink}</p>}
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="flex items-center gap-1 text-sm text-ink-muted">
                  <VisibilityToggle
                    checked={b.isActive}
                    label={`Active: ${b.title}`}
                    mutationFn={(v) => adminApi.banners.update(b._id, { isActive: v })}
                    invalidate={invalidate}
                    successMessage={(v) => (v ? 'Banner shown' : 'Banner hidden')}
                  />
                  Active
                </span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setModal({ open: true, banner: b })} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted" aria-label={`Edit ${b.title}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setToDelete(b)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-red-50" aria-label={`Delete ${b.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}

      <BannerModal open={modal.open} banner={modal.banner} onClose={() => setModal({ open: false, banner: null })} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete banner?"
        message={`This will permanently delete the banner “${toDelete?.title}” and its images.`}
        loading={del.isPending}
        onConfirm={() => del.mutate(toDelete._id)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
