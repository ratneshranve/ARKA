import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { emailSchema, messageSchema, nameSchema, normalisePhone, phoneSchema } from '@/lib/validators';
import FormSuccess from './FormSuccess';
import Honeypot from './Honeypot';
import { useEnquirySubmit } from './useEnquirySubmit';

const schema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  subject: z.string().trim().max(150, 'Subject is too long').optional(),
  message: messageSchema,
  website: z.string().optional(),
});

const defaults = { name: '', phone: '', email: '', subject: '', message: '', website: '' };

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: defaults });
  const { submit, isPending, submittedName, formError, reset: resetSubmit } = useEnquirySubmit(setError);

  if (submittedName) {
    return (
      <FormSuccess
        name={submittedName}
        onReset={() => {
          reset(defaults);
          resetSubmit();
        }}
      />
    );
  }

  const onSubmit = (values) => submit({ type: 'general', ...values, phone: normalisePhone(values.phone) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5">
      <Honeypot register={register} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Full name" required error={errors.name?.message}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field id="contact-phone" label="Mobile number" required error={errors.phone?.message} hint="10-digit Indian mobile number">
          <Input type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-email" label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field id="contact-subject" label="Subject" error={errors.subject?.message}>
          <Input autoComplete="off" {...register('subject')} />
        </Field>
      </div>
      <Field id="contact-message" label="Message" required error={errors.message?.message}>
        <Textarea rows={5} {...register('message')} />
      </Field>
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" loading={isPending} className="w-full sm:w-auto">
        {!isPending && <Send className="h-5 w-5" aria-hidden="true" />}
        {isPending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  );
}
