import { Building2, CalendarCheck, MapPin, Zap } from 'lucide-react';
import { projectTypeLabel } from '@/lib/constants';
import { formatMonthYear } from '@/lib/format';

export default function ProjectFacts({ project }) {
  const facts = [
    { label: 'Location', value: project.location, Icon: MapPin },
    { label: 'Capacity', value: project.capacity, Icon: Zap },
    { label: 'Project type', value: projectTypeLabel(project.projectType), Icon: Building2 },
    { label: 'Completed', value: formatMonthYear(project.completedOn), Icon: CalendarCheck },
  ].filter((f) => f.value);

  return (
    <aside className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6" aria-labelledby="project-facts">
      <h2 id="project-facts" className="text-lg font-bold">
        Project Details
      </h2>
      <dl className="mt-4 space-y-4">
        {facts.map(({ label, value, Icon }) => (
          <div key={label} className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-deep">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className="font-semibold text-primary">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      {project.details?.length > 0 && (
        <dl className="mt-5 divide-y divide-border border-t border-border">
          {project.details.map((d, i) => (
            <div key={`${d.label}-${i}`} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-ink-muted">{d.label}</dt>
              <dd className="text-right font-semibold text-primary">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}
