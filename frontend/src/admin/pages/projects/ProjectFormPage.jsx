import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { PROJECT_TYPES, ROUTES } from '@/lib/constants';
import { queryKeys } from '@/lib/queryKeys';
import { slugSchema, toSlug } from '@/lib/validators';
import NotFoundPage from '@/pages/NotFoundPage';
import FormSection from '../../components/FormSection';
import ImageUploader from '../../components/ImageUploader';
import KeyValueEditor from '../../components/KeyValueEditor';
import MarkdownField from '../../components/MarkdownField';
import PageHeader from '../../components/PageHeader';
import SingleImageField from '../../components/SingleImageField';
import StickySaveBar from '../../components/StickySaveBar';
import { useUnsavedChanges } from '../../components/useUnsavedChanges';

const schema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(150),
  slug: slugSchema,
  location: z.string().trim().min(2, 'Location is required').max(150),
  shortDescription: z.string().trim().min(10, 'At least 10 characters').max(250, 'Maximum 250 characters'),
  coverImage: z.any().refine((v) => v && v.url, 'A cover image is required'),
  gallery: z.array(z.any()).max(20),
  capacity: z.string().trim().max(50),
  projectType: z.string(),
  completedOn: z.string(),
  details: z.array(z.object({ label: z.string().trim().min(1, 'Required'), value: z.string().trim().min(1, 'Required') })).max(30),
  description: z.string().max(10000),
  additionalInfo: z.string().max(10000),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().trim().max(120),
  metaDescription: z.string().trim().max(300),
});

const EMPTY = {
  title: '',
  slug: '',
  location: '',
  shortDescription: '',
  coverImage: null,
  gallery: [],
  capacity: '',
  projectType: '',
  completedOn: '',
  details: [],
  description: '',
  additionalInfo: '',
  isPublished: true,
  isFeatured: false,
  metaTitle: '',
  metaDescription: '',
};

const toForm = (p) => ({
  ...EMPTY,
  ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, p[k] ?? EMPTY[k]])),
  completedOn: p.completedOn ? String(p.completedOn).slice(0, 10) : '',
  projectType: p.projectType ?? '',
});

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const slugTouched = useRef(isEdit);

  const projectQuery = useQuery({ queryKey: queryKeys.admin.project(id), queryFn: () => adminApi.projects.get(id), enabled: isEdit });

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
    if (projectQuery.data) reset(toForm(projectQuery.data));
  }, [projectQuery.data, reset]);

  useUnsavedChanges(isDirty && !saved);
  useEffect(() => {
    if (saved) navigate(ROUTES.admin.projects);
  }, [saved, navigate]);

  const save = useMutation({
    mutationFn: (payload) => (isEdit ? adminApi.projects.update(id, payload) : adminApi.projects.create(payload)),
    onSuccess: () => {
      toast.success(isEdit ? 'Project updated' : 'Project created');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      setSaved(true);
    },
    onError: (err) => {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err, 'Could not save the project'));
    },
  });

  const onSubmit = (values) =>
    save.mutate({ ...values, projectType: values.projectType || null, completedOn: values.completedOn || null });

  const shortLen = watch('shortDescription')?.length ?? 0;

  if (isEdit && projectQuery.isLoading) return <PageLoader />;
  if (isEdit && projectQuery.isError) {
    return getErrorStatus(projectQuery.error) === 404 ? <NotFoundPage admin title="Project not found" /> : <ErrorState error={projectQuery.error} onRetry={projectQuery.refetch} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Helmet>
        <title>{isEdit ? 'Edit Project' : 'Add Project'} | Admin</title>
      </Helmet>
      <PageHeader title={isEdit ? 'Edit Project' : 'Add Project'} backTo={ROUTES.admin.projects} backLabel="All projects" />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FormSection title="Basic information">
            <Field id="title" label="Project title" required error={errors.title?.message}>
              <Input
                {...register('title', {
                  onChange: (e) => !slugTouched.current && setValue('slug', toSlug(e.target.value), { shouldValidate: true }),
                })}
              />
            </Field>
            <Field id="slug" label="URL slug" error={errors.slug?.message} hint="Auto-generated from the title.">
              <Input {...register('slug', { onChange: () => (slugTouched.current = true) })} />
            </Field>
            <Field id="location" label="Location" required error={errors.location?.message} hint='e.g. "Bhopal, Madhya Pradesh"'>
              <Input {...register('location')} />
            </Field>
            <Field id="shortDescription" label="Short description" required error={errors.shortDescription?.message} counter={`${shortLen}/250`}>
              <Textarea rows={3} maxLength={250} {...register('shortDescription')} />
            </Field>
          </FormSection>

          <FormSection title="Cover image" description="Shown on project cards and at the top of the project page.">
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <SingleImageField value={field.value} onChange={field.onChange} folder="projects" invalid={Boolean(errors.coverImage)} hint="Landscape image, at least 1600 px wide recommended." />
              )}
            />
            {errors.coverImage && <p className="text-sm text-danger">{errors.coverImage.message}</p>}
          </FormSection>

          <FormSection title="Gallery" description="Up to 20 additional photos. Drag to reorder.">
            <Controller
              control={control}
              name="gallery"
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} folder="projects" max={20} label="Photos" coverLabel="First" onUploadingChange={setUploading} />
              )}
            />
          </FormSection>

          <FormSection title="Description">
            <Controller control={control} name="description" render={({ field }) => <MarkdownField id="description" value={field.value} onChange={field.onChange} rows={10} />} />
          </FormSection>

          <FormSection title="Project details" description="e.g. Panels used, inverter, client type, annual generation.">
            <Controller
              control={control}
              name="details"
              render={({ field }) => (
                <KeyValueEditor value={field.value} onChange={field.onChange} max={30} errors={errors.details} labelPlaceholder="e.g. Panels" valuePlaceholder="e.g. 18 × 545 Wp" />
              )}
            />
          </FormSection>

          <FormSection title="Additional information">
            <Controller control={control} name="additionalInfo" render={({ field }) => <MarkdownField id="additionalInfo" value={field.value} onChange={field.onChange} rows={6} />} />
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Visibility">
            <Controller control={control} name="isPublished" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Published (visible on website)" />} />
            <Controller control={control} name="isFeatured" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Featured on homepage" />} />
          </FormSection>

          <FormSection title="Facts">
            <Field id="capacity" label="Capacity" error={errors.capacity?.message} hint='e.g. "50 kW"'>
              <Input {...register('capacity')} />
            </Field>
            <Field id="projectType" label="Project type">
              <Select {...register('projectType')}>
                <option value="">Not specified</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="completedOn" label="Completion date" error={errors.completedOn?.message}>
              <Input type="date" {...register('completedOn')} />
            </Field>
          </FormSection>

          <FormSection title="SEO" description="Optional — defaults to the title and short description." collapsible defaultOpen={false}>
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
        onCancel={() => navigate(ROUTES.admin.projects)}
        saving={save.isPending}
        disabled={uploading}
        saveLabel={isEdit ? 'Save changes' : 'Create project'}
        note={uploading ? 'Waiting for uploads to finish…' : undefined}
      />
    </form>
  );
}
