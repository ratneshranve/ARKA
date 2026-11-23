import Spinner from '@/components/ui/Spinner';

export default function PageLoader({ fullScreen = false }) {
  return (
    <div className={fullScreen ? 'flex min-h-screen items-center justify-center bg-muted' : 'flex min-h-[50vh] items-center justify-center'}>
      <div className="flex flex-col items-center gap-3 text-brand">
        <Spinner className="scale-150" />
        <span className="text-sm text-ink-muted">Loading…</span>
      </div>
    </div>
  );
}
