import clsx from 'clsx'
import { AlertTriangle } from 'lucide-react'
import { BRANDS, FORMATS, PILLARS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { getImage } from '../lib/hooks'
import { setups, type LongForm } from '../lib/seed/longform'
import type { Content, ImageAsset } from '../lib/types'
import { Thumb } from './images/Thumb'
import { SetupSchema } from './Previews'
import { PlatformChip } from './ui'

export function IdeaCard({ c, showImage = true }: { c: Content; showImage?: boolean }) {
  const { open } = useDetail()
  const img = getImage(c.imageIds[0])
  return (
    <button type="button" onClick={() => open('c', c.id)} className="card group flex flex-col overflow-hidden text-left transition-shadow hover:shadow-[var(--shadow-lg)]">
      {showImage && img && <Thumb img={img} className="aspect-[16/9] w-full border-b border-line object-top" />}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] text-ink-3">
          <span className="h-2.5 w-[3px] rounded-full" style={{ background: BRANDS[c.brands[0]].color }} />
          <span className="font-mono">{c.id}</span>
          <span className="truncate">· {FORMATS[c.format]}</span>
          {c.techValidation === 'requise' && (
            <span className="ml-auto shrink-0" title="Validation expert requise">
              <AlertTriangle size={12} className="text-[var(--v-expert)]" />
            </span>
          )}
        </div>
        <div className="line-clamp-3 text-[13.5px] font-medium leading-snug">{c.hook && c.hook !== 'À RENSEIGNER' ? c.hook : c.subject}</div>
        {c.angle && <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-3">{c.angle}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-3">
          {c.platforms.slice(0, 3).map((p) => (
            <PlatformChip key={p} id={p} compact />
          ))}
          {c.pillar && <span className="ml-auto text-[11px] text-ink-3">{PILLARS[c.pillar].short}</span>}
        </div>
      </div>
    </button>
  )
}

export function LongFormCard({ l }: { l: LongForm }) {
  const { open } = useDetail()
  const s = setups.find((x) => x.id === l.setup)!
  return (
    <button type="button" onClick={() => open('l', l.id)} className="card group flex flex-col overflow-hidden text-left transition-shadow hover:shadow-[var(--shadow-lg)]">
      <SetupSchema id={l.setup} className="!rounded-none !border-0 !border-b !border-line" />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] text-ink-3">
          <span className="h-2.5 w-[3px] rounded-full" style={{ background: BRANDS[s.brand].color }} />
          <span className="font-mono">{l.id}</span>
          <span>· {s.short}</span>
          <span>· {s.duration}</span>
          {l.expert && <AlertTriangle size={12} className="ml-auto text-[var(--v-expert)]" />}
        </div>
        <div className="text-[14.5px] font-semibold leading-snug">{l.title}</div>
        <p className="mt-2 line-clamp-2 text-[12.5px] italic leading-relaxed text-ink-2">« {l.hook.replace(/^«\s*|\s*»$/g, '')} »</p>
        <div className="mt-auto pt-3 text-[11.5px] text-ink-3">
          {l.chapters.length} chapitres · {l.shorts.length} déclinaisons courtes
        </div>
      </div>
    </button>
  )
}

export function ImageTile({ img, className, natural }: { img: ImageAsset; className?: string; natural?: boolean }) {
  const { open } = useDetail()
  return (
    <button
      type="button"
      onClick={() => open('i', img.id)}
      className={clsx('group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-line bg-surface text-left shadow-[var(--shadow)] transition-shadow hover:shadow-[var(--shadow-lg)]', className)}
    >
      <Thumb img={img} className={natural ? 'max-h-[460px] w-full object-top' : 'aspect-[4/3] w-full object-top'} />
      <div className="px-3 py-2">
        <div className="font-mono text-[10.5px] text-ink-3">{img.id}</div>
        <div className="line-clamp-2 text-[12px] leading-snug text-ink-2">{img.description}</div>
      </div>
    </button>
  )
}
