import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Img from '@/components/ui/Img';
import { IMG } from '@/lib/cloudinary';
import { projectTypeLabel, ROUTES } from '@/lib/constants';

export default function ProjectCard({ project }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <Img
        image={project.coverImage}
        alt={project.coverImage?.alt || project.title}
        size={IMG.card}
        imgClassName="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <span className="truncate">{project.location}</span>
        </p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-primary">
          <Link to={ROUTES.project(project.slug)} className="after:absolute after:inset-0 focus:outline-none">
            {project.title}
          </Link>
        </h3>
        {(project.capacity || project.projectType) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {project.capacity && <Badge variant="accent">{project.capacity}</Badge>}
            {project.projectType && <Badge variant="panel">{projectTypeLabel(project.projectType)}</Badge>}
          </div>
        )}
        <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{project.shortDescription}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-dark group-hover:text-brand">
          View Project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-accent ring-offset-2 group-focus-within:ring-2" aria-hidden="true" />
    </article>
  );
}
