import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/http';
import Switch from '@/components/ui/Switch';

/**
 * Optimistic toggle for Published/Featured/Active flags.
 * `mutationFn(next)` performs the API call; `invalidate` is a list of query keys to refresh.
 */
export default function VisibilityToggle({ checked, mutationFn, invalidate = [], label, successMessage }) {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState(null);

  const mutation = useMutation({
    mutationFn,
    onMutate: (next) => setOptimistic(next),
    onSuccess: (_d, next) => {
      toast.success(successMessage?.(next) ?? 'Saved');
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setOptimistic(null),
  });

  const value = optimistic ?? checked;
  return <Switch checked={value} onChange={(next) => mutation.mutate(next)} disabled={mutation.isPending} label={label} srOnlyLabel />;
}
