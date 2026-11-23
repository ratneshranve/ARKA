import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { authApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/lib/constants';
import { emailSchema } from '@/lib/validators';
import AuthCard from '../components/AuthCard';

const schema = z.object({ email: emailSchema });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    setError('');
    try {
      await authApi.forgotPassword(values);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthCard
      title="Forgot password"
      subtitle={sent ? undefined : 'Enter your admin email and we will send you a reset link.'}
      footer={
        <Link to={ROUTES.admin.login} className="hover:text-primary">
          ← Back to login
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-brand" aria-hidden="true" />
          <p className="mt-3 text-ink">If an account exists for this email, a reset link has been sent. The link is valid for 30 minutes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Field id="forgot-email" label="Email" required error={errors.email?.message}>
            <Input type="email" autoComplete="username" autoFocus {...register('email')} />
          </Field>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
