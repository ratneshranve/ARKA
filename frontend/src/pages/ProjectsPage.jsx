import { Filter, SunMedium, X } from 'lucide-react';
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import CtaBand from '@/components/common/CtaBand';
import PageHero from '@/components/common/PageHero';
import Seo from '@/components/common/Seo';
import ProjectGrid, { projectGridCls } from '@/components/projects/ProjectGrid';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pagination from '@/components/ui/Pagination';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { useProjects } from '@/hooks/usePublicData';
import { cn } from '@/lib/cn';
import { PAGE_SIZE, PROJECT_TYPES, ROUTES } from '@/lib/constants';

const FILTER_TABS = [
  { value: '', label: 'All Projects' },
  ...PROJECT_TYPES.filter((t) => t.value !== 'other'),
];

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const selectedType = params.get('type') || '';
  const topRef = useRef(null);

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useProjects({
    page,
    limit: PAGE_SIZE.projects,
    type: selectedType || undefined,
  });

  const changePage = (p) => {
    const next = new URLSearchParams(params);
    if (p > 1) {
      next.set('page', String(p));
    } else {
      next.delete('page');
    }
    setParams(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectType = (val) => {
    const next = new URLSearchParams(params);
    if (val) {
      next.set('type', val);
    } else {
      next.delete('type');
    }
    next.delete('page');
    setParams(next);
  };

  const activeLabel = PROJECT_TYPES.find((t) => t.value === selectedType)?.label;

  return (
    <>
      <Seo
        title={activeLabel ? `${activeLabel} Solar Projects` : 'Projects'}
        description="Residential, commercial, industrial and agricultural solar projects we have designed and installed."
      />
      <PageHero
        title={activeLabel ? `${activeLabel} Projects` : 'Our Projects'}
        subtitle="A selection of solar installations we have designed, supplied and commissioned."
        breadcrumbs={activeLabel ? [{ label: 'Projects', to: ROUTES.projects }, { label: activeLabel }] : [{ label: 'Projects' }]}
      />

      <section className="section" ref={topRef} id="project-list">
        <div className="container-page">
          {/* Category Filter Tabs */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted sm:inline-flex mr-2">
                <Filter className="h-3.5 w-3.5" /> Category:
              </span>
              {FILTER_TABS.map((tab) => {
                const isActive = selectedType === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleSelectType(tab.value)}
                    className={cn(
                      'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted/70 text-ink-muted hover:bg-muted hover:text-ink',
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {selectedType && (
              <button
                type="button"
                onClick={() => handleSelectType('')}
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-danger self-start sm:self-auto"
              >
                <X className="h-3.5 w-3.5" /> Clear category filter
              </button>
            )}
          </div>

          {isLoading ? (
            <GridSkeleton count={6} className={projectGridCls} />
          ) : isError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : !data?.items.length ? (
            <EmptyState
              icon={SunMedium}
              title={selectedType ? `No ${activeLabel} projects yet` : 'Projects coming soon'}
              description={
                selectedType
                  ? `We are currently updating our portfolio for ${activeLabel.toLowerCase()} solar installations. Try viewing all projects or contact us.`
                  : 'We are adding our completed installations. Contact us to discuss your project.'
              }
              action={
                selectedType ? (
                  <Button variant="outline" onClick={() => handleSelectType('')}>
                    View All Projects
                  </Button>
                ) : (
                  <Button to={ROUTES.contact}>Contact Us</Button>
                )
              }
            />
          ) : (
            <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={isPlaceholderData}>
              <ProjectGrid projects={data.items} />
              <Pagination className="mt-10" page={data.meta.page} totalPages={data.meta.totalPages} onChange={changePage} />
            </div>
          )}
        </div>
      </section>
      <CtaBand title="Want a similar installation?" />
    </>
  );
}
