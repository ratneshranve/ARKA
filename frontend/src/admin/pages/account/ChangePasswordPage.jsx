import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { authApi } from '@/api/admin.api';
import { applyServerErrors, getErrorMessage } from '@/api/http';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import { emailSchema, passwordSchema } from '@/lib/validators';
import { useAuth } from '../../auth/AuthProvider';
import { tokenStore } from '../../auth/tokenStore';
import FormSection from '../../components/FormSection';
import PageHeader from '../../components/PageHeader';
import PasswordInput from '../../components/PasswordInput';

const profileSchema = z.object({ name: z.string().trim().min(2, 'Name is required').max(100), email: emailSchema });
const passwordFormSchema = z
  .object({ currentPassword: z.string().min(1, 'Current password is required'), newPassword: passwordSchema, confirm: z.string() })
  .refine((d) => d.newPassword === d.confirm, { path: ['confirm'], message: 'Passwords do not match' })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ['newPassword'], message: 'Choose a different password' });

function ProfileForm() {
  const { admin, updateAdmin } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: admin?.name ?? '', email: admin?.email ?? '' } });

  useEffect(() => {
    reset({ name: admin?.name ?? '', email: admin?.email ?? '' });
  }, [admin, reset]);

  const save = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      updateAdmin(data);
      toast.success('Profile updated');
    },
    onError: (err) => {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate>
      <FormSection title="Profile">
        <Field id="acc-name" label="Name" required error={errors.name?.message}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field id="acc-email" label="Login email" required error={errors.email?.message} hint="Also used for password reset emails.">
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="brand" loading={save.isPending} disabled={!isDirty}>
            Save profile
          </Button>
        </div>
      </FormSection>
    </form>
  );
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(passwordFormSchema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });

  const save = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => authApi.changePassword({ currentPassword, newPassword }),
    onSuccess: (data) => {
      if (data?.accessToken) tokenStore.set(data.accessToken);
      toast.success('Password changed. Other sessions have been logged out.');
      reset();
    },
    onError: (err) => {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate>
      <FormSection title="Change password" description="At least 8 characters, with a letter and a number.">
        <Field id="pw-current" label="Current password" required error={errors.currentPassword?.message}>
          <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
        </Field>
        <Field id="pw-new" label="New password" required error={errors.newPassword?.message}>
          <PasswordInput autoComplete="new-password" {...register('newPassword')} />
        </Field>
        <Field id="pw-confirm" label="Confirm new password" required error={errors.confirm?.message}>
          <PasswordInput autoComplete="new-password" {...register('confirm')} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="brand" loading={save.isPending}>
            Change password
          </Button>
        </div>
      </FormSection>
    </form>
  );
}

export default function ChangePasswordPage() {
  return (
    <div>
      <Helmet>
        <title>My Account | Admin</title>
      </Helmet>
      <PageHeader title="My Account" description="Update your name, login email and password." />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}
