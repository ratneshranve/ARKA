import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { authApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { ROUTES } from '@/lib/constants';
import { passwordSchema } from '@/lib/validators';
import AuthCard from '../components/AuthCard';
import PasswordInput from '../components/PasswordInput';

const schema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { password: '', confirm: '' } });

  const backLink = (
    <Link to={ROUTES.admin.login} className="hover:text-primary">
      ← Back to login
    </Link>
  );

  if (!token) {
    return (
      <AuthCard title="Invalid reset link" footer={backLink}>
        <p className="text-ink-muted">This password reset link is missing or incomplete.</p>
        <Button to={ROUTES.admin.forgot} className="mt-5 w-full">
          Request a new link
        </Button>
      </AuthCard>
    );
  }

  const onSubmit = async ({ password }) => {
    setError('');
    try {
      await authApi.resetPassword({ token, password });
      navigate(`${ROUTES.admin.login}?reset=1`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthCard title="Choose a new password" subtitle="At least 8 characters, with a letter and a number." footer={backLink}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field id="reset-password" label="New password" required error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" autoFocus {...register('password')} />
        </Field>
        <Field id="reset-confirm" label="Confirm new password" required error={errors.confirm?.message}>
          <PasswordInput autoComplete="new-password" {...register('confirm')} />
        </Field>
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}{' '}
            <Link to={ROUTES.admin.forgot} className="font-semibold underline">
              Request a new link
            </Link>
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
