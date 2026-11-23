import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { useBanners } from '@/hooks/usePublicData';
import { useSettings } from '@/hooks/useSettings';
import { cldUrl, IMG } from '@/lib/cloudinary';
import { cn } from '@/lib/cn';
import { HERO_LOGO, ROUTES } from '@/lib/constants';

const HEIGHT = 'h-[540px] sm:h-[520px] lg:h-[600px]';

/** Company logo above the banner text: icon on top, ARKA wordmark below (light version, transparent background). */
function HeroLogo() {
  return (
    <img
      src={HERO_LOGO}
      alt=""
      aria-hidden="true"
      width="794"
      height="470"
      className="mb-6 h-24 w-auto max-w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:h-28 lg:h-36"
    />
  );
}

function CtaButton({ label, link }) {
  if (!label || !link) return null;
  const external = /^https?:\/\//i.test(link);
  return external ? (
    <Button href={link} size="lg" target="_blank" rel="noopener noreferrer">
      {label} <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Button>
  ) : (
    <Button to={link} size="lg">
      {label} <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}

/** Shown when the admin has no active banners: company name + tagline from Settings. */
function StaticHero() {
  const { company } = useSettings();
  return (
    <section className={cn('relative flex items-center overflow-hidden bg-primary', HEIGHT)}>
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-sun-gradient opacity-40 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-40 left-0 h-80 w-[50rem] rounded-full bg-brand opacity-30 blur-3xl" aria-hidden="true" />
      <div className="container-page relative">
        <HeroLogo />
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{company.name}</h1>
        {company.tagline && <p className="mt-5 max-w-xl text-lg text-primary-100 md:text-xl">{company.tagline}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to={ROUTES.contact} size="lg">
            Get a Quote <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button to={ROUTES.products} size="lg" variant="outline-light">
            Explore Products
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Homepage banners managed in Admin › Homepage Banners. */
export default function HeroSlider() {
  const { data: banners, isLoading } = useBanners();
  const reducedMotion = useReducedMotion();
  const plugins = useMemo(
    () => (reducedMotion ? [] : [Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true })]),
    [reducedMotion],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, plugins);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return undefined;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((i) => emblaApi?.scrollTo(i), [emblaApi]);

  if (isLoading) return <Skeleton className={cn('w-full rounded-none', HEIGHT)} />;
  if (!banners?.length) return <StaticHero />;

  return (
    <section className="relative" aria-roledescription="carousel" aria-label="Highlights">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((b, i) => {
            const Heading = i === 0 ? 'h1' : 'h2';
            return (
              <div
                key={b._id}
                className={cn('relative min-w-0 flex-[0_0_100%]', HEIGHT)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${banners.length}`}
              >
                <picture>
                  {b.mobileImage?.url && <source media="(max-width: 767px)" srcSet={cldUrl(b.mobileImage.url, IMG.bannerMobile)} />}
                  <img
                    src={cldUrl(b.image.url, IMG.bannerDesktop)}
                    alt={b.image.alt || b.title}
                    width="1920"
                    height="800"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    {...(i === 0 && { fetchpriority: 'high' })}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/65 to-primary-900/35 md:bg-gradient-to-r md:from-primary-900/85 md:via-primary-900/50 md:to-transparent" />
                <div className="container-page relative flex h-full items-center pb-20 pt-4 md:pb-24">
                  <div className="max-w-2xl">
                    <HeroLogo />
                    <Heading className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[52px]">{b.title}</Heading>
                    {b.subtitle && <p className="mt-4 text-base text-primary-100 sm:text-lg">{b.subtitle}</p>}
                    <div className="mt-7">
                      <CtaButton label={b.ctaLabel} link={b.ctaLink} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30 md:inline-flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30 md:inline-flex"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1">
            {banners.map((b, i) => (
              <button
                key={b._id}
                type="button"
                onClick={() => scrollTo(i)}
                className="group inline-flex h-11 w-11 items-center justify-center"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === selected || undefined}
              >
                <span className={cn('block h-2.5 rounded-full transition-all', i === selected ? 'w-8 bg-accent' : 'w-2.5 bg-white/60 group-hover:bg-white')} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
