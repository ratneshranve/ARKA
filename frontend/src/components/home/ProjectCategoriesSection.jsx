import { ArrowRight, ChevronLeft, ChevronRight, SunMedium } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { useProjects } from '@/hooks/usePublicData';
import { cldUrl, IMG } from '@/lib/cloudinary';
import { cn } from '@/lib/cn';
import { PROJECT_TYPES, ROUTES } from '@/lib/constants';

const CATEGORY_META = {
  residential: {
    title: 'Residential Solar',
    desc: 'Custom rooftop solar installations for villas and modern homes with seamless net-metering and 25-year warranty.',
    tag: 'Home Rooftops',
  },
  commercial: {
    title: 'Commercial Solar',
    desc: 'High-performance solar systems for malls, office complexes, and institutions to cut operating electricity overheads.',
    tag: 'Commercial & Retail',
  },
  industrial: {
    title: 'Industrial Solar',
    desc: 'Heavy-duty rooftop and shed-mounted solar plants engineered for factories, manufacturing units, and warehouses.',
    tag: 'Factories & Sheds',
  },
  agricultural: {
    title: 'Agricultural Solar',
    desc: 'Solar water pumps and rural clean energy installations providing reliable, diesel-free irrigation for farms.',
    tag: 'Pumps & Farming',
  },
  institutional: {
    title: 'Institutional Solar',
    desc: 'Eco-friendly solar infrastructure designed for schools, universities, hospitals, and campus facilities.',
    tag: 'Campuses & Hospitals',
  },
  other: {
    title: 'Specialized Solar Projects',
    desc: 'Bespoke ground-mounted plants, micro-grids, and hybrid solar storage systems tailored to unique site requirements.',
    tag: 'Custom EPC',
  },
};

/** Interactive image slider for each category card with auto-slide and controls. */
function CategoryImageSlider({ images, categoryTitle, categoryLink }) {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return undefined;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActive((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActive((prev) => (prev + 1) % images.length);
  };

  const currentImage = images[active] || images[0];

  return (
    <div
      className="group relative aspect-[16/10] w-full overflow-hidden bg-muted"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={categoryLink} className="block h-full w-full">
        {images.map((img, i) => (
          <img
            key={img.url || i}
            src={cldUrl(img.url, IMG.card)}
            alt={img.alt || `${categoryTitle} photo ${i + 1}`}
            loading="lazy"
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out',
              i === active ? 'scale-100 opacity-100' : 'scale-105 opacity-0 pointer-events-none',
            )}
          />
        ))}
        {/* Subtle dark gradient for badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </Link>

      {/* Slide Navigation arrows if 2+ images */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur transition hover:bg-black/70 group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur transition hover:bg-black/70 group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActive(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-5 bg-accent' : 'w-1.5 bg-white/70 hover:bg-white',
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Image Counter Badge */}
      {images.length > 1 && (
        <span className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          {active + 1}/{images.length} Photos
        </span>
      )}
    </div>
  );
}

export default function ProjectCategoriesSection() {
  const { data, isLoading, isError } = useProjects({ limit: 50 });
  const allProjects = data?.items ?? [];

  // Group projects and aggregate all admin-uploaded images (coverImage + gallery) by category
  const categories = useMemo(() => {
    const grouped = {};

    for (const project of allProjects) {
      const type = project.projectType || 'residential';
      if (!grouped[type]) {
        grouped[type] = {
          projects: [],
          images: [],
        };
      }
      grouped[type].projects.push(project);

      // Add cover image
      if (project.coverImage?.url) {
        grouped[type].images.push(project.coverImage);
      }
      // Add gallery images uploaded from admin
      if (Array.isArray(project.gallery)) {
        for (const g of project.gallery) {
          if (g?.url && !grouped[type].images.some((img) => img.url === g.url)) {
            grouped[type].images.push(g);
          }
        }
      }
    }

    // Build the ordered category list using defined PROJECT_TYPES or active ones
    const list = [];
    for (const pt of PROJECT_TYPES) {
      const typeData = grouped[pt.value];
      const meta = CATEGORY_META[pt.value] || {
        title: `${pt.label} Solar`,
        desc: `High quality ${pt.label.toLowerCase()} solar systems engineered for high savings and clean power.`,
        tag: pt.label,
      };

      // Only show categories that have projects or images
      if (typeData && typeData.projects.length > 0) {
        list.push({
          key: pt.value,
          label: pt.label,
          title: meta.title,
          desc: meta.desc,
          tag: meta.tag,
          projectCount: typeData.projects.length,
          images: typeData.images,
          projects: typeData.projects,
          link: `${ROUTES.projects}?type=${pt.value}`,
        });
      }
    }

    // If no projects uploaded yet, fallback to main categories with placeholder
    if (!list.length && allProjects.length === 0) {
      return [
        {
          key: 'residential',
          label: 'Residential',
          title: CATEGORY_META.residential.title,
          desc: CATEGORY_META.residential.desc,
          tag: CATEGORY_META.residential.tag,
          projectCount: 0,
          images: [{ url: '/images/demo/project-residential.svg' }],
          projects: [],
          link: `${ROUTES.projects}?type=residential`,
        },
        {
          key: 'commercial',
          label: 'Commercial',
          title: CATEGORY_META.commercial.title,
          desc: CATEGORY_META.commercial.desc,
          tag: CATEGORY_META.commercial.tag,
          projectCount: 0,
          images: [{ url: '/images/demo/project-commercial.svg' }],
          projects: [],
          link: `${ROUTES.projects}?type=commercial`,
        },
        {
          key: 'industrial',
          label: 'Industrial',
          title: CATEGORY_META.industrial.title,
          desc: CATEGORY_META.industrial.desc,
          tag: CATEGORY_META.industrial.tag,
          projectCount: 0,
          images: [{ url: '/images/demo/project-industrial.svg' }],
          projects: [],
          link: `${ROUTES.projects}?type=industrial`,
        },
      ];
    }

    return list;
  }, [allProjects]);

  if (isError) return null;

  return (
    <section id="projects" className="section bg-slate-50/70 border-y border-border/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Projects & Sectors"
          title="Solar Installations by Category"
          subtitle="Explore our completed solar engineering projects across residential, commercial, industrial, and agricultural sectors."
        />

        {isLoading ? (
          <GridSkeleton count={3} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition hover:border-brand/40 hover:shadow-md"
              >
                {/* Category Slider for uploaded images */}
                <CategoryImageSlider
                  images={cat.images.length > 0 ? cat.images : [{ url: '/images/placeholder.svg' }]}
                  categoryTitle={cat.title}
                  categoryLink={cat.link}
                />

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {cat.tag}
                    </span>
                    <span className="text-xs font-medium text-ink-muted">
                      {cat.projectCount} {cat.projectCount === 1 ? 'Project' : 'Projects'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-ink transition group-hover:text-primary">
                    <Link to={cat.link} className="hover:underline">
                      {cat.title}
                    </Link>
                  </h3>

                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-muted">{cat.desc}</p>

                  <div className="mt-5 border-t border-border/60 pt-4">
                    <Link
                      to={cat.link}
                      className="inline-flex w-full items-center justify-between rounded-lg bg-muted/60 px-4 py-2.5 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white"
                    >
                      <span>View {cat.label} Projects</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button to={ROUTES.projects} variant="outline" size="lg">
            View All Projects & Case Studies <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
