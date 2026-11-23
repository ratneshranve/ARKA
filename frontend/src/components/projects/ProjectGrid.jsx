import ProjectCard from './ProjectCard';

export const projectGridCls = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

export default function ProjectGrid({ projects }) {
  return (
    <div className={projectGridCls}>
      {projects.map((p) => (
        <ProjectCard key={p._id} project={p} />
      ))}
    </div>
  );
}
