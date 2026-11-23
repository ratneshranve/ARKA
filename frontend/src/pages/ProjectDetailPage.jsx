import { MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getErrorStatus } from '@/api/http';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CtaBand from '@/components/common/CtaBand';
import Markdown from '@/components/common/Markdown';
import Seo from '@/components/common/Seo';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFacts from '@/components/projects/ProjectFacts';
import ProjectGallery from '@/components/projects/ProjectGallery';
import Badge from '@/components/ui/Badge';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useProject } from '@/hooks/usePublicData';
import { projectTypeLabel, ROUTES } from '@/lib/constants';
import NotFoundPage from './NotFoundPage';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data: project, isLoading, isError, error, refetch } = useProject(slug);

  if (isLoading) {
    return (
      <div className="container-page py-10" role="status" aria-label="Loading project">
        <Skeleton className="mb-6 h-4 w-64" />
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="mb-8 h-5 w-48" />
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="aspect-video w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  if (isError && getErrorStatus(error) === 404) return <NotFoundPage title="Project not found" />;
  if (isError) {
    return (
      <div className="container-page section">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={project.metaTitle || project.title}
        description={project.metaDescription || project.shortDescription}
        image={project.coverImage?.url}
        type="article"
      />

      <div className="border-b border-border bg-muted">
        <div className="container-page py-4">
          <Breadcrumbs items={[{ label: 'Projects', to: ROUTES.projects }, { label: project.title }]} />
        </div>
      </div>

      <section className="container-page py-8 md:py-12">
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">{project.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1.5 text-ink-muted">
            <MapPin className="h-4 w-4 text-brand" aria-hidden="true" /> {project.location}
          </span>
          {project.capacity && <Badge variant="accent">{project.capacity}</Badge>}
          {project.projectType && <Badge variant="panel">{projectTypeLabel(project.projectType)}</Badge>}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="min-w-0 lg:col-span-2">
            <ProjectGallery key={project._id} cover={project.coverImage} gallery={project.gallery} title={project.title} />
            {project.description && (
              <div className="mt-10">
                <h2 className="mb-4 text-2xl font-bold">About this Project</h2>
                <Markdown>{project.description}</Markdown>
              </div>
            )}
            {project.additionalInfo && (
              <div className="mt-10">
                <h2 className="mb-4 text-2xl font-bold">Additional Information</h2>
                <Markdown>{project.additionalInfo}</Markdown>
              </div>
            )}
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProjectFacts project={project} />
          </div>
        </div>
      </section>

      <CtaBand title="Want a similar installation?" text="Tell us about your site and requirement — we will design the right solar system for you." />

      {project.related?.length > 0 && (
        <section className="section pt-0">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-bold sm:text-3xl">More Projects</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {project.related.map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
