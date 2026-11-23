import { ArrowRight } from 'lucide-react';
import ProjectCard from '@/components/projects/ProjectCard';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { useProjects } from '@/hooks/usePublicData';
import { ROUTES } from '@/lib/constants';

const HOME_LIMIT = 4;
// One row of 4 on desktop, 2 per row on tablet, 1 on mobile
const gridCls = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4';

/** Home "Projects" section — the first 4 featured projects (admin-defined order) + a link to all projects. */
export default function FeaturedProjects() {
  const { data, isLoading, isError } = useProjects({ featured: true, limit: HOME_LIMIT });
  const items = data?.items ?? [];
  if (isError || (!isLoading && !items.length)) return null;

  return (
    <section id="projects" className="section">
      <div className="container-page">
        <SectionHeading eyebrow="Our Projects" title="Solar installations we are proud of" />
        {isLoading ? (
          <GridSkeleton count={HOME_LIMIT} className={gridCls} />
        ) : (
          <div className={gridCls}>
            {items.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Button to={ROUTES.projects} variant="outline" size="lg" className="w-full sm:w-auto">
            View All Projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
