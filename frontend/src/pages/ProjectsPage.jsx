import { SunMedium } from 'lucide-react';
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
import { PAGE_SIZE, ROUTES } from '@/lib/constants';

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const topRef = useRef(null);
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useProjects({ page, limit: PAGE_SIZE.projects });

  const changePage = (p) => {
    setParams(p > 1 ? { page: String(p) } : {});
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Seo title="Projects" description="Residential, commercial, industrial and agricultural solar projects we have designed and installed." />
      <PageHero title="Our Projects" subtitle="A selection of solar installations we have designed, supplied and commissioned." breadcrumbs={[{ label: 'Projects' }]} />

      <section className="section" ref={topRef} id="project-list">
        <div className="container-page">
          {isLoading ? (
            <GridSkeleton count={6} className={projectGridCls} />
          ) : isError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : !data?.items.length ? (
            <EmptyState
              icon={SunMedium}
              title="Projects coming soon"
              description="We are adding our completed installations. Contact us to discuss your project."
              action={<Button to={ROUTES.contact}>Contact Us</Button>}
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
