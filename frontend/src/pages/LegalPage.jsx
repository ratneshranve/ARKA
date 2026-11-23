import { FileText } from 'lucide-react';
import Markdown from '@/components/common/Markdown';
import PageHero from '@/components/common/PageHero';
import Seo from '@/components/common/Seo';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useSettings } from '@/hooks/useSettings';
import { formatDate } from '@/lib/format';

/** Shared layout for Privacy Policy and Terms & Conditions (content comes from Settings › Legal). */
export default function LegalPage({ title, field, description }) {
  const { settings, isLoading, isError, error, refetch } = useSettings();
  const content = settings.legal?.[field];
  const updatedAt = settings.legal?.updatedAt;

  return (
    <>
      <Seo title={title} description={description} />
      <PageHero title={title} breadcrumbs={[{ label: title }]} />
      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-prose">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : isError ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : content ? (
              <>
                {updatedAt && <p className="mb-6 text-sm text-ink-muted">Last updated: {formatDate(updatedAt, { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                <Markdown>{content}</Markdown>
              </>
            ) : (
              <EmptyState icon={FileText} title="Content coming soon" description="This page is being updated. Please check back later." />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
