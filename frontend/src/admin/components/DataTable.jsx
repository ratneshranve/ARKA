import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

/**
 * Table from `md` up (scrolls inside its own container), stacked cards below `md`.
 * columns: [{ key, header, cell: (row) => node, className }]
 */
export default function DataTable({ columns, rows, rowKey = (r) => r._id, renderMobile, loading, empty, rowClassName }) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border border-border bg-white p-4" role="status" aria-label="Loading">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!rows?.length) return empty ?? null;

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-white shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn('whitespace-nowrap px-4 py-3 font-semibold', c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={rowKey(row)} className={cn('hover:bg-muted/50', rowClassName?.(row))}>
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className={cn('rounded-lg border border-border bg-white p-4 shadow-card', rowClassName?.(row))}>
            {renderMobile(row)}
          </li>
        ))}
      </ul>
    </>
  );
}
