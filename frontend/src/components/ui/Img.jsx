import { useState } from 'react';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/cn';
import { PLACEHOLDER_IMG } from '@/lib/constants';

/**
 * Image with a fixed aspect-ratio wrapper (no layout shift), Cloudinary transforms,
 * lazy loading by default and a placeholder fallback.
 */
export default function Img({ image, src, alt, ratio = '4/3', size, priority = false, className, imgClassName, sizes, fit = 'cover' }) {
  const [failed, setFailed] = useState(false);
  const raw = src || image?.url;
  const url = !raw || failed ? PLACEHOLDER_IMG : cldUrl(raw, size);

  return (
    <div className={cn('relative overflow-hidden bg-primary-50', className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      <img
        src={url}
        alt={alt ?? image?.alt ?? ''}
        width={size?.w || image?.width}
        height={size?.h || image?.height}
        loading={priority ? 'eager' : 'lazy'}
        {...(priority && { fetchpriority: 'high' })}
        decoding="async"
        sizes={sizes}
        onError={() => setFailed(true)}
        className={cn('h-full w-full', fit === 'cover' ? 'object-cover' : 'object-contain', imgClassName)}
      />
    </div>
  );
}
