import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { adminApi } from '@/api/admin.api';
import { applyServerErrors, getErrorMessage, getErrorStatus } from '@/api/http';
import PageLoader from '@/components/common/PageLoader';
import ErrorState from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { ROUTES } from '@/lib/constants';
import { queryKeys } from '@/lib/queryKeys';
import { slugSchema, toSlug } from '@/lib/validators';
import NotFoundPage from '@/pages/NotFoundPage';
import CategoryQuickAdd from '../../components/CategoryQuickAdd';
import FormSection from '../../components/FormSection';
import ImageUploader from '../../components/ImageUploader';
import KeyValueEditor from '../../components/KeyValueEditor';
import MarkdownField from '../../components/MarkdownField';
import PageHeader from '../../components/PageHeader';
import StickySaveBar from '../../components/StickySaveBar';
import { useUnsavedChanges } from '../../components/useUnsavedChanges';

const amount = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number({ invalid_type_error: 'Enter a valid amount' }).min(0, 'Price cannot be negative').nullable(),
);

const schema = z
  .object({
    name: z.string().trim().min(2, 'Name is required').max(150),
    slug: slugSchema,
    category: z.string().min(1, 'Select a category'),
    shortDescription: z.string().trim().min(10, 'At least 10 characters').max(250, 'Maximum 250 characters'),
    images: z.array(z.any()).min(1, 'Add at least one image').max(10),
    price: z.object({ show: z.boolean(), amount, label: z.string().trim().max(50) }),
    description: z.string().max(10000),
    specifications: z.array(z.object({ label: z.string().trim().min(1, 'Required'), value: z.string().trim().min(1, 'Required') })).max(40),
    additionalInfo: z.string().max(10000),
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
    metaTitle: z.string().trim().max(120),
    metaDescription: z.string().trim().max(300),
  })
  .superRefine((d, ctx) => {
    if (d.price.show && d.price.amount === null) {
      ctx.addIssue({ code: 'custom', path: ['price', 'amount'], message: 'Enter a price or turn off "Show price"' });
    }
  });

const EMPTY = {
  name: '',
  slug: '',
  category: '',
  shortDescription: '',
  images: [],
  price: { show: false, amount: '', label: '' },
  description: '',
  specifications: [],
  additionalInfo: '',
  isPublished: true,
  isFeatured: false,
  metaTitle: '',
  metaDescription: '',
};

const toForm = (p) => ({
  name: p.name,
  slug: p.slug,
  category: p.category?._id ?? p.category ?? '',
  shortDescription: p.shortDescription,
  images: p.images ?? [],
  price: { show: Boolean(p.price?.show), amount: p.price?.amount ?? '', label: p.price?.label ?? '' },
  description: p.description ?? '',
  specifications: p.specifications ?? [],
  additionalInfo: p.additionalInfo ?? '',
  isPublished: p.isPublished,
  isFeatured: p.isFeatured,
  metaTitle: p.metaTitle ?? '',
  metaDescription: p.metaDescription ?? '',
});

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quickAdd, setQuickAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const slugTouched = useRef(isEdit);

  const productQuery = useQuery({ queryKey: queryKeys.admin.product(id), queryFn: () => adminApi.products.get(id), enabled: isEdit });
  const { data: categories = [] } = useQuery({ queryKey: queryKeys.admin.categories, queryFn: adminApi.categories.list });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY, mode: 'onTouched' });

  useEffect(() => {
    if (productQuery.data) reset(toForm(productQuery.data));
  }, [productQuery.data, reset]);

  useUnsavedChanges(isDirty && !saved);
  useEffect(() => {
    if (saved) navigate(ROUTES.admin.products);
  }, [saved, navigate]);

  const save = useMutation({
    mutationFn: (payload) => (isEdit ? adminApi.products.update(id, payload) : adminApi.products.create(payload)),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      setSaved(true);
    },
    onError: (err) => {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err, 'Could not save the product'));
    },
  });

  const onSubmit = (values) => save.mutate({ ...values, price: { ...values.price, amount: values.price.amount } });

  const shortLen = watch('shortDescription')?.length ?? 0;
  const showPrice = watch('price.show');

  if (isEdit && productQuery.isLoading) return <PageLoader />;
  if (isEdit && productQuery.isError) {
    return getErrorStatus(productQuery.error) === 404 ? <NotFoundPage admin title="Product not found" /> : <ErrorState error={productQuery.error} onRetry={productQuery.refetch} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Helmet>
        <title>{isEdit ? 'Edit Product' : 'Add Product'} | Admin</title>
      </Helmet>
      <PageHeader title={isEdit ? 'Edit Product' : 'Add Product'} backTo={ROUTES.admin.products} backLabel="All products" />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FormSection title="Basic information">
            <Field id="name" label="Product name" required error={errors.name?.message}>
              <Input
                {...register('name', {
                  onChange: (e) => !slugTouched.current && setValue('slug', toSlug(e.target.value), { shouldValidate: true }),
                })}
              />
            </Field>
            <Field id="slug" label="URL slug" error={errors.slug?.message} hint="Auto-generated from the name. Lowercase letters, numbers and hyphens.">
              <Input {...register('slug', { onChange: () => (slugTouched.current = true) })} />
            </Field>
            <div>
              <Field id="category" label="Category" required error={errors.category?.message}>
                <Select {...register('category')}>
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                      {!c.isActive ? ' (hidden)' : ''}
                    </option>
                  ))}
                </Select>
              </Field>
              <button type="button" onClick={() => setQuickAdd(true)} className="link mt-1 inline-flex min-h-[40px] items-center gap-1 text-sm">
                <Plus className="h-4 w-4" aria-hidden="true" /> New category
              </button>
            </div>
            <Field id="shortDescription" label="Short description" required error={errors.shortDescription?.message} counter={`${shortLen}/250`} hint="Shown on product cards (2 lines).">
              <Textarea rows={3} maxLength={250} {...register('shortDescription')} />
            </Field>
          </FormSection>

          <FormSection title="Images" description="The first image is the cover. Drag to reorder.">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} folder="products" max={10} invalid={Boolean(errors.images)} onUploadingChange={setUploading} />
              )}
            />
            {errors.images && <p className="text-sm text-danger">{errors.images.message}</p>}
          </FormSection>

          <FormSection title="Description">
            <Controller
              control={control}
              name="description"
              render={({ field }) => <MarkdownField id="description" value={field.value} onChange={field.onChange} rows={10} />}
            />
          </FormSection>

          <FormSection title="Specifications" description="Shown as a table on the product page.">
            <Controller
              control={control}
              name="specifications"
              render={({ field }) => (
                <KeyValueEditor value={field.value} onChange={field.onChange} errors={errors.specifications} labelPlaceholder="e.g. Peak power" valuePlaceholder="e.g. 545 Wp" />
              )}
            />
          </FormSection>

          <FormSection title="Additional information" description="Warranty, brand, certifications, etc.">
            <Controller
              control={control}
              name="additionalInfo"
              render={({ field }) => <MarkdownField id="additionalInfo" value={field.value} onChange={field.onChange} rows={6} />}
            />
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Visibility">
            <Controller control={control} name="isPublished" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Published (visible on website)" />} />
            <Controller control={control} name="isFeatured" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Featured on homepage" />} />
          </FormSection>

          <FormSection title="Pricing">
            <Controller control={control} name="price.show" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Show price" />} />
            {showPrice ? (
              <>
                <Field id="price-amount" label="Amount (₹)" required error={errors.price?.amount?.message}>
                  <Input type="number" inputMode="decimal" min="0" step="0.01" {...register('price.amount')} />
                </Field>
                <Field id="price-label" label="Label" error={errors.price?.label?.message} hint='e.g. "per unit", "starting from"'>
                  <Input {...register('price.label')} />
                </Field>
              </>
            ) : (
              <p className="text-sm text-ink-muted">The website will show “Price on request”.</p>
            )}
          </FormSection>

          <FormSection title="SEO" description="Optional — defaults to the name and short description." collapsible defaultOpen={false}>
            <Field id="metaTitle" label="Meta title" error={errors.metaTitle?.message}>
              <Input maxLength={120} {...register('metaTitle')} />
            </Field>
            <Field id="metaDescription" label="Meta description" error={errors.metaDescription?.message}>
              <Textarea rows={3} maxLength={300} {...register('metaDescription')} />
            </Field>
          </FormSection>
        </div>
      </div>

      <StickySaveBar
        onCancel={() => navigate(ROUTES.admin.products)}
        saving={save.isPending}
        disabled={uploading}
        saveLabel={isEdit ? 'Save changes' : 'Create product'}
        note={uploading ? 'Waiting for uploads to finish…' : undefined}
      />

      <CategoryQuickAdd open={quickAdd} onClose={() => setQuickAdd(false)} onCreated={(c) => setValue('category', c._id, { shouldDirty: true, shouldValidate: true })} />
    </form>
  );
}
