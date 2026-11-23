import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { getErrorMessage } from '@/api/http';
import PageLoader from '@/components/common/PageLoader';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/lib/constants';
import { emailSchema } from '@/lib/validators';
import { useAuth } from '../auth/AuthProvider';
import AuthCard from '../components/AuthCard';
import PasswordInput from '../components/PasswordInput';

const schema = z.object({ email: emailSchema, password: z.string().min(1, 'Password is required') });

/** Only allow redirects inside the admin area. */
const safeNext = (next) => (next && next.startsWith('/admin') && !next.startsWith('//') ? next : ROUTES.admin.root);

export default function LoginPage() {
  const { status, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const next = safeNext(params.get('next'));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  if (status === 'loading') return <PageLoader fullScreen />;
  if (status === 'authenticated') return <Navigate to={next} replace />;

  const onSubmit = async (values) => {
    setError('');
    try {
      await login(values);
      navigate(next, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not log in. Please try again.'));
    }
  };

  return (
    <AuthCard title="Admin Login" subtitle="Sign in to manage your website." footer={<a href="/" className="hover:text-primary">← Back to website</a>}>
      {params.get('expired') && !error && (
        <p className="mb-4 rounded-lg bg-accent-50 px-4 py-3 text-sm text-[#8A5300]">Your session has expired. Please log in again.</p>
      )}
      {params.get('reset') && !error && (
        <p className="mb-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-dark">Password updated. Please log in with your new password.</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field id="login-email" label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="username" autoFocus {...register('email')} />
        </Field>
        <Field id="login-password" label="Password" required error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" {...register('password')} />
        </Field>
        <div className="flex justify-end">
          <Link to={ROUTES.admin.forgot} className="link inline-flex min-h-[44px] items-center text-sm">
            Forgot password?
          </Link>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {!isSubmitting && <LogIn className="h-5 w-5" aria-hidden="true" />} Log in
        </Button>
      </form>
    </AuthCard>
  );
}
