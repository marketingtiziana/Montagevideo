import { AlertTriangle } from 'lucide-react'
import { BRANDS, IMAGE_TYPES, PLATFORMS } from '../../lib/constants'
import { useDetail } from '../../lib/detail'
import { isToClassify } from '../../lib/hooks'
import type { ImageAsset } from '../../lib/types'
import { Dot } from '../ui'
import { Thumb } from './Thumb'

export function ImageCard({ img, usage = 0, natural }: { img: ImageAsset; usage?: number; natural?: boolean }) {
  const { open } = useDetail()
  return (
    <button
      type="button"
      onClick={() => open('i', img.id)}
      className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-line bg-surface text-left shadow-[var(--shadow)] transition-shadow hover:shadow-[var(--shadow-lg)]"
    >
      <div className="relative">
        <Thumb img={img} className={natural ? 'max-h-[440px] w-full object-top' : 'aspect-[4/3] w-full object-top'} />
        {img.warnings.length > 0 && (
          <span
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-surface/95 px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--v-expert)] shadow"
            title={img.warnings.join('\n')}
          >
            <AlertTriangle size={11} /> {img.warnings.length}
          </span>
        )}
      </div>
      <div className="space-y-1 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-ink-3">{img.id}</span>
          <span className="text-[11px] text-ink-3">{usage ? `${usage} contenu(s)` : ''}</span>
        </div>
        <div className="line-clamp-2 text-[12.5px] leading-snug text-ink">{img.description || img.originalName}</div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-[11px] text-ink-3">
          <span>{IMAGE_TYPES[img.type]}</span>
          {img.brand && (
            <span className="inline-flex items-center gap-1">
              <Dot color={BRANDS[img.brand].color} /> {BRANDS[img.brand].short}
            </span>
          )}
          {img.platform && <span>{PLATFORMS[img.platform].label}</span>}
          {isToClassify(img) && <span className="font-semibold text-[var(--v-idea)]">À CLASSER</span>}
        </div>
      </div>
    </button>
  )
}
