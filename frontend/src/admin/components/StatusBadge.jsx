import Badge from '@/components/ui/Badge';
import { statusLabel } from '@/lib/constants';

const VARIANT = { new: 'accent', in_progress: 'panel', closed: 'neutral' };

export default function StatusBadge({ status }) {
  return <Badge variant={VARIANT[status] ?? 'neutral'}>{statusLabel(status)}</Badge>;
}
