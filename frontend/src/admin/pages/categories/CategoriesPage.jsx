import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { adminApi } from '@/api/admin.api';
import { applyServerErrors, getErrorMessage } from '@/api/http';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { queryKeys } from '@/lib/queryKeys';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageHeader from '../../components/PageHeader';
import SortableList from '../../components/SortableList';
import VisibilityToggle from '../../components/VisibilityToggle';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  description: z.string().trim().max(300, 'Maximum 300 characters'),
  isActive: z.boolean(),
});

function CategoryModal({ open, category, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(category);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', description: '', isActive: true } });

  useEffect(() => {
    if (open) reset(category ? { name: category.name, description: category.description || '', isActive: category.isActive } : { name: '', description: '', isActive: true });
  }, [open, category, reset]);

  const save = useMutation({
    mutationFn: (values) => (isEdit ? adminApi.categories.update(category._id, values) : adminApi.categories.create(values)),
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      onClose();
    },
    onError: (err) => {
      if (!applyServerErrors(err, setError)) toast.error(getErrorMessage(err));
    },
  });

  const submit = handleSubmit((values) => save.mutate(values));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit category' : 'Add category'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Add category'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field id="cat-name" label="Name" required error={errors.name?.message}>
          <Input maxLength={80} data-autofocus {...register('name')} />
        </Field>
        <Field id="cat-desc" label="Description" error={errors.description?.message} hint="Optional. Shown on the products page when this category is selected.">
          <Textarea rows={3} maxLength={300} {...register('description')} />
        </Field>
        <Controller control={control} name="isActive" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Active (visible on website)" />} />
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: queryKeys.admin.categories, queryFn: adminApi.categories.list });
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState({ open: false, category: null });
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    setItems(data ?? []);
  }, [data]);

  const reorder = useMutation({
    mutationFn: (ids) => adminApi.categories.reorder(ids),
    onSuccess: () => {
      toast.success('Order saved');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setItems(data ?? []);
    },
  });

  const del = useMutation({
    mutationFn: (id) => adminApi.categories.remove(id),
    onSuccess: () => {
      toast.success('Category deleted');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setToDelete(null);
    },
  });

  const invalidate = [queryKeys.admin.categories, queryKeys.categories, ['products']];

  return (
    <div>
      <Helmet>
        <title>Categories | Admin</title>
      </Helmet>
      <PageHeader
        title="Categories"
        description="Product categories shown as tabs on the products page. Drag to change the order."
        actions={
          <Button variant="brand" onClick={() => setModal({ open: true, category: null })}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Category
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !items.length ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Add your first category, e.g. Solar Panels or Inverters."
          action={
            <Button variant="brand" onClick={() => setModal({ open: true, category: null })}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Category
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-white shadow-card">
          <div className="hidden grid-cols-[44px_1fr_1fr_110px_90px_96px] gap-3 border-b border-border bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted md:grid">
            <span />
            <span>Name</span>
            <span>Slug</span>
            <span>Products</span>
            <span>Active</span>
            <span className="text-right">Actions</span>
          </div>
          <SortableList
            items={items}
            getId={(c) => c._id}
            onReorder={(next) => {
              setItems(next);
              reorder.mutate(next.map((c) => c._id));
            }}
            className="divide-y divide-border"
            itemClassName="bg-white"
            renderItem={(c, _i, handle) => (
              <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-2 md:grid-cols-[44px_1fr_1fr_110px_90px_96px]">
                {handle}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">{c.name}</p>
                  <p className="truncate text-xs text-ink-muted md:hidden">
                    /{c.slug} · {c.productCount} products
                  </p>
                </div>
                <span className="hidden truncate text-sm text-ink-muted md:block">{c.slug}</span>
                <span className="hidden md:block">
                  <Badge>{c.productCount}</Badge>
                </span>
                <span className="hidden md:block">
                  <VisibilityToggle
                    checked={c.isActive}
                    label={`Active: ${c.name}`}
                    mutationFn={(v) => adminApi.categories.update(c._id, { isActive: v })}
                    invalidate={invalidate}
                    successMessage={(v) => (v ? 'Category shown' : 'Category hidden')}
                  />
                </span>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setModal({ open: true, category: c })}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-muted"
                    aria-label={`Edit ${c.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(c)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-danger hover:bg-red-50"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          />
        </div>
      )}

      <CategoryModal open={modal.open} category={modal.category} onClose={() => setModal({ open: false, category: null })} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete category?"
        message={
          toDelete?.productCount
            ? `“${toDelete.name}” has ${toDelete.productCount} product(s). Move or delete them first — the server will refuse this delete.`
            : `This will permanently delete the category “${toDelete?.name}”.`
        }
        loading={del.isPending}
        onConfirm={() => del.mutate(toDelete._id)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
