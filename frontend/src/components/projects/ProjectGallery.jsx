import { Expand } from 'lucide-react';
import { useState } from 'react';
import Lightbox from '@/components/common/Lightbox';
import Img from '@/components/ui/Img';
import { IMG } from '@/lib/cloudinary';

/** Cover image with a grid of gallery thumbnails below; any image opens the lightbox. */
export default function ProjectGallery({ cover, gallery = [], title }) {
  const images = [cover, ...gallery].filter(Boolean);
  const [lightbox, setLightbox] = useState(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(0)}
        className="group relative block w-full overflow-hidden rounded-xl"
        aria-label={`View ${title} images full screen`}
      >
        <Img image={cover} alt={cover?.alt || title} size={IMG.detail} ratio="16/9" priority />
        <span className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow">
          <Expand className="h-5 w-5" aria-hidden="true" />
        </span>
      </button>

      {gallery.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {gallery.map((img, i) => (
            <li key={img.publicId || i}>
              <button
                type="button"
                onClick={() => setLightbox(i + 1)}
                className="block w-full overflow-hidden rounded-lg opacity-90 hover:opacity-100"
                aria-label={`Open image ${i + 2}`}
              >
                <Img image={img} alt="" size={IMG.thumb} ratio="4/3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox images={images} index={lightbox} onIndexChange={setLightbox} onClose={() => setLightbox(null)} title={title} />
    </div>
  );
}
