import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { adminApi } from '@/api/admin.api';
import { applyServerErrors, getErrorMessage } from '@/api/http';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';
import { queryKeys } from '@/lib/queryKeys';
import FormSection from '../../components/FormSection';
import MarkdownField from '../../components/MarkdownField';
import MultiTextInput from '../../components/MultiTextInput';
import PageHeader from '../../components/PageHeader';
import SingleImageField from '../../components/SingleImageField';
import { useUnsavedChanges } from '../../components/useUnsavedChanges';

const text = (max) => z.string().trim().max(max, `Maximum ${max} characters`);
const url = text(300).refine((v) => v === '' || /^https?:\/\//i.test(v), 'Must start with https://');
const img = z.any().nullable();
const emailList = z.array(z.string().trim().refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email'));

/* ── Section definitions: fields, schema and how to render them ── */

const SECTIONS = {
  company: {
    label: 'Company',
    schema: z.object({ name: z.string().trim().min(1, 'Company name is required').max(120), tagline: text(200), logo: img, logoLight: img, footerAbout: text(500) }),
    render: ({ register, control, errors }) => (
      <>
        <Field id="company-name" label="Company name" required error={errors.name?.message}>
          <Input {...register('name')} />
        </Field>
        <Field id="company-tagline" label="Tagline" error={errors.tagline?.message}>
          <Input {...register('tagline')} />
        </Field>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-semibold text-primary">Logo (for light backgrounds)</p>
            <Controller control={control} name="logo" render={({ field }) => <SingleImageField value={field.value} onChange={field.onChange} folder="site" ratio="3/1" fit="contain" hint="Header and emails. Transparent PNG recommended. Leave empty to use the built-in ARKA logo." />} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold text-primary">Logo (light version, for the dark footer)</p>
            <Controller control={control} name="logoLight" render={({ field }) => <SingleImageField value={field.value} onChange={field.onChange} folder="site" ratio="3/1" fit="contain" dark hint="White/light logo on a transparent background." />} />
          </div>
        </div>
        <Field id="company-footer" label="Footer about text" error={errors.footerAbout?.message}>
          <Textarea rows={3} maxLength={500} {...register('footerAbout')} />
        </Field>
      </>
    ),
  },
  home: {
    label: 'Home Intro',
    schema: z.object({ introTitle: text(150), introText: text(20000), introImage: img }),
    render: ({ register, control, errors }) => (
      <>
        <Field id="home-title" label="Intro title" error={errors.introTitle?.message}>
          <Input {...register('introTitle')} />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Intro text</p>
          <Controller control={control} name="introText" render={({ field }) => <MarkdownField value={field.value} onChange={field.onChange} rows={8} maxLength={20000} />} />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Intro image</p>
          <Controller control={control} name="introImage" render={({ field }) => <SingleImageField value={field.value} onChange={field.onChange} folder="site" ratio="9/7" hint="Shown next to the intro text on the homepage." />} />
        </div>
      </>
    ),
  },
  about: {
    label: 'About Us',
    schema: z.object({
      heroImage: img,
      overview: text(20000),
      background: text(20000),
      businessInfo: text(20000),
      experience: text(20000),
      vision: text(20000),
      mission: text(20000),
    }),
    render: ({ control }) => (
      <>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Hero / overview image</p>
          <Controller control={control} name="heroImage" render={({ field }) => <SingleImageField value={field.value} onChange={field.onChange} folder="site" ratio="12/5" hint="Used as the About page banner background and next to the overview." />} />
        </div>
        {[
          ['overview', 'Company overview'],
          ['background', 'Background'],
          ['businessInfo', 'Business information'],
          ['experience', 'Solar industry experience'],
          ['vision', 'Vision'],
          ['mission', 'Mission'],
        ].map(([name, label]) => (
          <div key={name}>
            <p className="mb-1.5 text-sm font-semibold text-primary">{label}</p>
            <Controller control={control} name={name} render={({ field }) => <MarkdownField value={field.value} onChange={field.onChange} rows={5} maxLength={20000} />} />
          </div>
        ))}
        <p className="text-sm text-ink-muted">Sections left empty are not shown on the About page.</p>
      </>
    ),
  },
  contact: {
    label: 'Contact',
    schema: z.object({
      phones: z.array(z.string().trim().max(30)),
      emails: emailList,
      address: text(500),
      mapEmbedUrl: text(2000).refine((v) => v === '' || v.startsWith('https://www.google.com/maps/embed'), 'Must start with https://www.google.com/maps/embed'),
      workingHours: text(150),
    }),
    render: ({ register, control, errors }) => (
      <>
        <Field id="contact-phones" label="Phone numbers">
          <Controller control={control} name="phones" render={({ field }) => <MultiTextInput id="contact-phones" value={field.value} onChange={field.onChange} placeholder="+91 98765 43210" type="tel" inputMode="tel" addLabel="Add phone" errors={errors.phones} />} />
        </Field>
        <Field id="contact-emails" label="Email addresses">
          <Controller control={control} name="emails" render={({ field }) => <MultiTextInput id="contact-emails" value={field.value} onChange={field.onChange} placeholder="info@yourdomain.com" type="email" addLabel="Add email" errors={errors.emails} />} />
        </Field>
        <Field id="contact-address" label="Address" error={errors.address?.message}>
          <Textarea rows={3} {...register('address')} />
        </Field>
        <Field id="contact-hours" label="Working hours" error={errors.workingHours?.message} hint='e.g. "Mon–Sat, 9:30 AM – 6:30 PM"'>
          <Input {...register('workingHours')} />
        </Field>
        <Field
          id="contact-map"
          label="Google Maps embed URL"
          error={errors.mapEmbedUrl?.message}
          hint="Google Maps → search your address → Share → Embed a map → copy only the src=&quot;…&quot; link (starts with https://www.google.com/maps/embed)."
        >
          <Input {...register('mapEmbedUrl')} placeholder="https://www.google.com/maps/embed?pb=…" />
        </Field>
      </>
    ),
  },
  social: {
    label: 'Social Links',
    schema: z.object({ facebook: url, instagram: url, linkedin: url, youtube: url, x: url }),
    render: ({ register, errors }) => (
      <>
        {[
          ['facebook', 'Facebook'],
          ['instagram', 'Instagram'],
          ['linkedin', 'LinkedIn'],
          ['youtube', 'YouTube'],
          ['x', 'X (Twitter)'],
        ].map(([name, label]) => (
          <Field key={name} id={`social-${name}`} label={label} error={errors[name]?.message}>
            <Input type="url" placeholder="https://…" {...register(name)} />
          </Field>
        ))}
        <p className="text-sm text-ink-muted">Empty links are hidden on the website.</p>
      </>
    ),
  },
  legal: {
    label: 'Legal Pages',
    schema: z.object({ privacyPolicy: text(20000), termsAndConditions: text(20000) }),
    render: ({ control }) => (
      <>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Privacy Policy</p>
          <Controller control={control} name="privacyPolicy" render={({ field }) => <MarkdownField value={field.value} onChange={field.onChange} rows={14} maxLength={20000} />} />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Terms &amp; Conditions</p>
          <Controller control={control} name="termsAndConditions" render={({ field }) => <MarkdownField value={field.value} onChange={field.onChange} rows={14} maxLength={20000} />} />
        </div>
        <p className="text-sm text-ink-muted">Saving updates the “Last updated” date shown on both pages.</p>
      </>
    ),
  },
  seo: {
    label: 'SEO Defaults',
    schema: z.object({ defaultTitle: text(120), defaultDescription: text(300), ogImage: img }),
    render: ({ register, control, errors }) => (
      <>
        <Field id="seo-title" label="Default title (homepage)" error={errors.defaultTitle?.message}>
          <Input maxLength={120} {...register('defaultTitle')} />
        </Field>
        <Field id="seo-desc" label="Default meta description" error={errors.defaultDescription?.message}>
          <Textarea rows={3} maxLength={300} {...register('defaultDescription')} />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Social share image</p>
          <Controller control={control} name="ogImage" render={({ field }) => <SingleImageField value={field.value} onChange={field.onChange} folder="site" ratio="1200/630" hint="1200 × 630 px. Shown when the site is shared on WhatsApp, Facebook, etc." />} />
        </div>
      </>
    ),
  },
  notifications: {
    label: 'Notifications',
    schema: z.object({ enquiryEmails: emailList }),
    render: ({ control, errors }) => (
      <Field id="notify-emails" label="Send new-enquiry emails to" hint="Every new product or contact enquiry is emailed to these addresses. If empty, ENQUIRY_NOTIFY_EMAIL from the server .env is used.">
        <Controller control={control} name="enquiryEmails" render={({ field }) => <MultiTextInput id="notify-emails" value={field.value} onChange={field.onChange} placeholder="sales@yourdomain.com" type="email" addLabel="Add email" errors={errors.enquiryEmails} />} />
      </Field>
    ),
  },
};

const pick = (section, settings) => {
  const keys = Object.keys(SECTIONS[section].schema.shape);
  const src = settings?.[section] ?? {};
  return Object.fromEntries(
    keys.map((k) => {
      const v = src[k];
      if (Array.isArray(v)) return [k, v];
      if (v && typeof v === 'object' && 'url' in v) return [k, v];
      return [k, v ?? (/Image$|^logo/.test(k) ? null : ['phones', 'emails', 'enquiryEmails'].includes(k) ? [] : '')];
    }),
  );
};

const clean = (values) =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => x.trim()).filter(Boolean) : v]));

function SectionForm({ section, settings, onDirtyChange }) {
  const queryClient = useQueryClient();
  const def = SECTIONS[section];
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(def.schema), defaultValues: pick(section, settings) });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const save = useMutation({
    mutationFn: (values) => adminApi.settings.update({ [section]: clean(values) }),
    onSuccess: (data) => {
      toast.success(`${def.label} saved`);
      queryClient.setQueryData(queryKeys.admin.settings, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      reset(pick(section, data));
    },
    onError: (err) => {
      // Server paths look like "contact.phones.0" → strip the section prefix for the form.
      const details = err?.response?.data?.error?.details;
      if (Array.isArray(details)) {
        applyServerErrors({ response: { data: { error: { details: details.map((d) => ({ ...d, path: d.path.replace(`${section}.`, '') })) } } } }, setError);
      }
      toast.error(getErrorMessage(err, 'Could not save settings'));
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate>
      <FormSection title={def.label}>
        {def.render({ register, control, errors })}
        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" variant="brand" loading={save.isPending} disabled={!isDirty}>
            Save {def.label.toLowerCase()}
          </Button>
        </div>
      </FormSection>
    </form>
  );
}

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: queryKeys.admin.settings, queryFn: adminApi.settings.get });
  const [tab, setTab] = useState('company');
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);

  const switchTab = (key) => {
    if (dirty && !window.confirm('You have unsaved changes on this tab. Discard them?')) return;
    setDirty(false);
    setTab(key);
  };

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div>
      <Helmet>
        <title>Site Settings | Admin</title>
      </Helmet>
      <PageHeader title="Site Settings" description="Company details, page content and contact information shown on the website. Each tab is saved separately." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Settings sections" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-1 lg:w-auto lg:flex-col">
            {Object.entries(SECTIONS).map(([key, s]) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => switchTab(key)}
                  aria-current={tab === key ? 'page' : undefined}
                  className={cn(
                    'min-h-[44px] w-full whitespace-nowrap rounded-lg px-4 text-left text-sm font-semibold transition-colors',
                    tab === key ? 'bg-primary text-white' : 'text-primary-500 hover:bg-white hover:text-primary',
                  )}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          <SectionForm key={tab} section={tab} settings={data} onDirtyChange={setDirty} />
        </div>
      </div>
    </div>
  );
}
