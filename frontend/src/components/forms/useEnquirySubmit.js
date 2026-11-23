import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { applyServerErrors, getErrorMessage, getErrorStatus } from '@/api/http';
import { publicApi } from '@/api/public.api';

/** Shared submit logic for both enquiry forms: success panel, toast, 429 and server-field errors. */
export function useEnquirySubmit(setError) {
  const [submittedName, setSubmittedName] = useState(null);
  const [formError, setFormError] = useState('');

  const mutation = useMutation({
    mutationFn: publicApi.createEnquiry,
    onSuccess: (_data, variables) => {
      setFormError('');
      setSubmittedName(variables.name);
      toast.success('Your enquiry has been sent.');
    },
    onError: (err) => {
      const message =
        getErrorStatus(err) === 429
          ? 'Too many requests, please try again in a few minutes.'
          : getErrorMessage(err, 'Sorry, we could not send your enquiry. Please try again.');
      if (!applyServerErrors(err, setError)) setFormError(message);
      else setFormError('');
      toast.error(message);
    },
  });

  return {
    submit: (payload) => mutation.mutateAsync({ ...payload, pageUrl: window.location.href }).catch(() => {}),
    isPending: mutation.isPending,
    submittedName,
    formError,
    reset: () => {
      setSubmittedName(null);
      setFormError('');
      mutation.reset();
    },
  };
}
