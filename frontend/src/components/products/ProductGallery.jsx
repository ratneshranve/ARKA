import { Expand } from 'lucide-react';
import { useState } from 'react';
import Lightbox from '@/components/common/Lightbox';
import Img from '@/components/ui/Img';
import { IMG } from '@/lib/cloudinary';
import { cn } from '@/lib/cn';

/** Main image + thumbnail strip; clicking the main image opens the lightbox. */
export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const current = images[active] ?? images[0];

  return (
    <div>
      <button
        type="button"
        onClick={() => images.length && setLightbox(active)}
        className="group relative block w-full overflow-hidden rounded-xl border border-border bg-white"
        aria-label={`View ${name} image full screen`}
      >
        <Img image={current} alt={current?.alt || name} size={IMG.detail} ratio="4/3" fit="contain" priority className="bg-white" />
        <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow opacity-80 group-hover:opacity-100">
          <Expand className="h-5 w-5" aria-hidden="true" />
        </span>
      </button>

      {images.length > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img.publicId || i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active || undefined}
                className={cn(
                  'block w-20 overflow-hidden rounded-lg border-2 sm:w-24',
                  i === active ? 'border-accent' : 'border-transparent opacity-75 hover:opacity-100',
                )}
              >
                <Img image={img} alt="" size={IMG.thumb} ratio="4/3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox images={images} index={lightbox} onIndexChange={setLightbox} onClose={() => setLightbox(null)} title={name} />
    </div>
  );
}
