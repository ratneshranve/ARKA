import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin.api';
import { getErrorMessage } from '@/api/http';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { queryKeys } from '@/lib/queryKeys';

/** Inline "+ New category" from the product form. Calls onCreated(category). */
export default function CategoryQuickAdd({ open, onClose, onCreated }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: () => adminApi.categories.create({ name: name.trim() }),
    onSuccess: (category) => {
      toast.success(`Category “${category.name}” created`);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      onCreated(category);
      setName('');
      onClose();
    },
    onError: (err) => setError(err?.response?.data?.error?.details?.[0]?.message || getErrorMessage(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    create.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New category"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit} loading={create.isPending}>
            Create category
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Field id="quick-category" label="Category name" required error={error}>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} data-autofocus />
        </Field>
      </form>
    </Modal>
  );
}
