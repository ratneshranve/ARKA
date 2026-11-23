import { cldUrl, IMG } from '@/lib/cloudinary';
import Breadcrumbs from './Breadcrumbs';

/** Page banner with title (the page's single <h1>), breadcrumb and optional background image. */
export default function PageHero({ title, subtitle, breadcrumbs = [], image }) {
  const bg = image?.url ? cldUrl(image.url, IMG.bannerDesktop) : null;

  return (
    <section className="relative overflow-hidden bg-primary">
      {bg ? (
        <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
      ) : (
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sun-gradient opacity-25 blur-2xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-[40rem] rounded-full bg-brand opacity-20 blur-3xl" />
          <svg className="absolute bottom-0 right-0 h-full w-1/2 text-white/[0.04]" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0 200 L200 40 L400 200Z" fill="currentColor" />
          </svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/70 to-primary-900/30" aria-hidden="true" />
      <div className="container-page relative py-12 md:py-16 lg:py-20">
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} light className="mb-4" />}
        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-primary-100 md:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
