import clsx from 'clsx'
import { ImageOff } from 'lucide-react'
import { useImageUrl } from '../../lib/hooks'
import type { ImageAsset } from '../../lib/types'

export function Thumb({
  img,
  className,
  fit = 'cover',
  label,
}: {
  img: ImageAsset | undefined | null
  className?: string
  fit?: 'cover' | 'contain'
  label?: string
}) {
  const url = useImageUrl(img)
  if (!img || !url)
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-surface-2 text-ink-3 [background-image:repeating-linear-gradient(135deg,transparent_0_9px,var(--line)_9px_10px)]',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-1 rounded bg-surface-2 px-2 py-1 text-center">
          <ImageOff size={14} />
          <span className="text-[10px] font-medium tracking-[0.06em]">{label ?? 'VISUEL À IMPORTER'}</span>
        </div>
      </div>
    )
  return (
    <img
      src={url}
      alt={img.description || img.originalName}
      loading="lazy"
      draggable={false}
      className={clsx('bg-surface-2', fit === 'cover' ? 'object-cover' : 'object-contain', className)}
    />
  )
}

/** Empty, clean placeholder slot for a visual not yet imported. */
export function Placeholder({ label = 'VISUEL À IMPORTER', className }: { label?: string; className?: string }) {
  return <Thumb img={null} label={label} className={className} />
}
