import { zodResolver } from '@hookform/resolvers/zod';
import { PackageCheck, Send } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';
import { emailSchema, messageSchema, nameSchema, normalisePhone, phoneSchema } from '@/lib/validators';
import FormSuccess from './FormSuccess';
import Honeypot from './Honeypot';
import { useEnquirySubmit } from './useEnquirySubmit';

const schema = z.object({
  intent: z.enum(['enquiry', 'order']),
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  quantity: z.string().trim().max(50, 'Keep this under 50 characters').optional(),
  message: messageSchema,
  website: z.string().optional(),
});

const INTENTS = [
  { value: 'enquiry', label: 'Send Enquiry', hint: 'Ask about price, availability or installation' },
  { value: 'order', label: 'Request Order', hint: 'Tell us what you would like to order' },
];

/** Product enquiry/order form. `intent` is controlled by the page so the CTA buttons can preset it. */
export default function ProductEnquiryForm({ product, intent = 'enquiry', onIntentChange }) {
  const defaults = { intent, name: '', phone: '', email: '', quantity: '', message: '', website: '' };
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: defaults });
  const { submit, isPending, submittedName, formError, reset: resetSubmit } = useEnquirySubmit(setError);
  const current = watch('intent');

  useEffect(() => {
    setValue('intent', intent);
  }, [intent, setValue]);

  if (submittedName) {
    return (
      <FormSuccess
        name={submittedName}
        onReset={() => {
          reset({ ...defaults, intent: current });
          resetSubmit();
        }}
      />
    );
  }

  const onSubmit = (values) =>
    submit({ type: 'product', productId: product._id, ...values, phone: normalisePhone(values.phone) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5">
      <Honeypot register={register} />

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3">
        <PackageCheck className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
        <p className="min-w-0 text-sm">
          <span className="text-ink-muted">Selected product: </span>
          <span className="font-semibold text-primary">{product.name}</span>
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-primary">I would like to</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTENTS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border-2 px-4 py-3 transition-colors',
                current === opt.value ? 'border-accent bg-accent-50' : 'border-border hover:border-primary-300',
              )}
            >
              <input
                type="radio"
                value={opt.value}
                className="mt-1 h-4 w-4 accent-brand"
                {...register('intent', { onChange: (e) => onIntentChange?.(e.target.value) })}
              />
              <span>
                <span className="block font-semibold text-primary">{opt.label}</span>
                <span className="block text-sm text-ink-muted">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pe-name" label="Full name" required error={errors.name?.message}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field id="pe-phone" label="Mobile number" required error={errors.phone?.message} hint="10-digit Indian mobile number">
          <Input type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pe-email" label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field id="pe-qty" label="Quantity (optional)" error={errors.quantity?.message}>
          <Input placeholder="e.g. 10 panels" autoComplete="off" {...register('quantity')} />
        </Field>
      </div>
      <Field id="pe-message" label="Message / requirement" required error={errors.message?.message}>
        <Textarea rows={4} {...register('message')} />
      </Field>
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" loading={isPending} className="w-full sm:w-auto">
        {!isPending && <Send className="h-5 w-5" aria-hidden="true" />}
        {isPending ? 'Sending…' : current === 'order' ? 'Send Order Request' : 'Send Enquiry'}
      </Button>
    </form>
  );
}
