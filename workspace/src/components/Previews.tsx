import clsx from 'clsx'
import { getImage } from '../lib/hooks'
import type { SetupId } from '../lib/seed/longform'
import type { InfographicModel, Scene, Slide, StoryScreen } from '../lib/types'
import { Thumb } from './images/Thumb'

const NAVY = '#0D092E'

/* ---------------- Modèle A — infographie ---------------- */
export function InfographicPreview({ m, className }: { m: InfographicModel; className?: string }) {
  return (
    <div className={clsx('aspect-[4/5] overflow-hidden rounded-lg border border-line bg-white p-4 text-[#17171a] shadow-[var(--shadow)]', className)}>
      <div className="mb-2 flex justify-between border-b border-[#e4e2dc] pb-1.5 text-[6.5px] tracking-[0.25em] text-[#85858c]">
        <span className="font-semibold text-[#17171a]">FYNOVATES</span>
        <span>INFOGRAPHIE</span>
      </div>
      <div className="mb-3 text-[11.5px] font-bold leading-tight tracking-[-0.01em]">{m.title}</div>
      <div className="space-y-1.5">
        {m.blocks.map((b) => (
          <div
            key={b.id}
            className={clsx('rounded-[3px] px-2 py-1.5', b.level === 1 ? 'text-white' : b.level === 2 ? 'border border-[#e4e2dc]' : 'bg-[#F1F1F3] text-[#47474d]')}
            style={b.level === 1 ? { background: NAVY } : undefined}
          >
            <div className="text-[7.5px] font-semibold leading-tight">{b.title}</div>
            {b.body && <div className="mt-0.5 line-clamp-2 text-[6.5px] leading-snug opacity-80">{b.body}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Modèle B — carrousel ---------------- */
export function SlidesStrip({ slides, size = 'md' }: { slides: Slide[]; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 'w-[92px]' : 'w-[150px]'
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scroll-thin">
      {slides.map((s, i) => {
        const dark = i === 0 || i === slides.length - 1
        const img = getImage(s.imageId)
        return (
          <div key={s.id} className={clsx('shrink-0', w)}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line" style={{ background: dark ? NAVY : '#fff' }}>
              {img && i === 0 ? (
                <Thumb img={img} className="h-full w-full" />
              ) : (
                <div className={clsx('flex h-full flex-col p-2', dark ? 'justify-end text-white' : 'text-[#17171a]')}>
                  <div className="text-[5.5px] tracking-[0.25em] opacity-60">FYNOVATES</div>
                  <div className={clsx('mt-auto font-semibold leading-tight', size === 'sm' ? 'line-clamp-4 text-[7px]' : 'line-clamp-5 text-[9.5px]')}>{s.title}</div>
                  {size === 'md' && s.body && !dark && <div className="mt-1 line-clamp-4 text-[6.5px] leading-snug opacity-70">{s.body}</div>}
                </div>
              )}
              <span className="absolute right-1.5 top-1.5 rounded bg-black/30 px-1 text-[9px] tabular text-white">{i + 1}</span>
            </div>
            {size === 'md' && <div className="mt-1.5 text-[11px] leading-snug text-ink-3">{s.role}</div>}
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Modèle D — Story ---------------- */
export function StoryStrip({ screens, size = 'md' }: { screens: StoryScreen[]; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 'w-[84px]' : 'w-[150px]'
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scroll-thin">
      {screens.map((s, i) => {
        const img = i === 0 ? getImage(s.imageId) : undefined
        return (
          <div key={s.id} className={clsx('shrink-0', w)}>
            <div className="relative aspect-[9/16] overflow-hidden rounded-[14px] border border-line" style={{ background: NAVY }}>
              {img && <Thumb img={img} className="absolute inset-0 h-full w-full opacity-35" />}
              <div className="absolute inset-x-2 top-2 flex gap-0.5">
                {screens.map((_, k) => (
                  <span key={k} className={clsx('h-[2px] flex-1 rounded-full', k <= i ? 'bg-white' : 'bg-white/30')} />
                ))}
              </div>
              <div className={clsx('absolute inset-x-2.5 top-6 font-medium leading-snug text-white', size === 'sm' ? 'line-clamp-[8] text-[6.5px]' : 'line-clamp-[10] text-[9.5px]')}>{s.text}</div>
              {s.interaction && size === 'md' && (
                <div className="absolute inset-x-2.5 bottom-9 rounded bg-white/95 px-1.5 py-1 text-center text-[8.5px] text-[#17171a]">{s.interaction}</div>
              )}
              {s.cta && size === 'md' && <div className="absolute inset-x-2.5 bottom-3 truncate text-[8.5px] text-white/70">{s.cta}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Modèle C — storyboard ---------------- */
export function ScenesList({ scenes }: { scenes: Scene[] }) {
  return (
    <ol className="relative space-y-2">
      <span className="absolute bottom-3 left-[13px] top-3 w-px bg-line-strong" aria-hidden />
      {scenes.map((s, i) => (
        <li key={s.id} className="relative flex gap-3">
          <span className="relative z-10 mt-2 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-[11px] font-semibold tabular">{i + 1}</span>
          <div className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2">
            <div className="flex flex-wrap items-baseline gap-x-3 text-[11px] text-ink-3">
              <span className="tabular font-medium text-ink-2">{s.duration}</span>
              <span>{s.image}</span>
              {s.goal && <span className="ml-auto">{s.goal}</span>}
            </div>
            <div className="mt-0.5 text-[13px] leading-snug">{s.dialogue}</div>
            {(s.camera || s.voiceover || s.transition) && (
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-ink-3">
                {s.camera && <span>Caméra : {s.camera}</span>}
                {s.voiceover && <span>Voix off : {s.voiceover}</span>}
                {s.transition && <span>Transition : {s.transition}</span>}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------------- Dispositifs de tournage ---------------- */
/** Schéma filaire de chaque dispositif (ce que voit le spectateur). */
export function SetupSchema({ id, className }: { id: SetupId; className?: string }) {
  const face = (cls: string) => (
    <div className={clsx('absolute flex items-end justify-center overflow-hidden rounded-md bg-[#3a3a44]', cls)}>
      <div className="mb-[-12%] h-[70%] w-[55%] rounded-t-full bg-[#6c6c78]" />
      <div className="absolute top-[18%] h-[34%] w-[30%] rounded-full bg-[#8a8a96]" />
    </div>
  )
  const lines = (n: number, cls = 'bg-[#cfcfe0]') => (
    <div className="space-y-1">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={clsx('h-[3px] rounded-full', cls)} style={{ width: `${90 - i * 13}%` }} />
      ))}
    </div>
  )
  return (
    <div className={clsx('relative aspect-video overflow-hidden rounded-lg border border-line bg-[#15151b]', className)}>
      {id === 'ipad-facecam' && (
        <>
          <div className="absolute inset-[8%_30%_8%_6%] rounded-md bg-white p-[4%]">
            <div className="mb-2 h-[5px] w-1/2 rounded-full bg-[#0D092E]" />
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-5 rounded-sm border border-[#d9d9e3]" />
              ))}
            </div>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M18 70 Q40 50 60 72 T88 60" fill="none" stroke="#A49CFF" strokeWidth="1.6" />
              <circle cx="72" cy="38" r="8" fill="none" stroke="#e0533d" strokeWidth="1.2" />
            </svg>
          </div>
          {face('right-[5%] top-[10%] h-[38%] w-[20%]')}
          <Label text="iPad annoté en direct + facecam" />
        </>
      )}
      {id === 'tv-facecam' && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[#24242c]" />
          <div className="absolute left-[8%] top-[14%] h-[50%] w-[48%] rounded-sm border-[3px] border-[#0b0b0f] bg-[#0D092E] p-[3%]">
            <div className="mb-1.5 h-[3px] w-1/3 rounded-full bg-white/40" />
            {lines(3, 'bg-white/70')}
          </div>
          <div className="absolute left-[30%] top-[64%] h-[10%] w-[4%] bg-[#0b0b0f]" />
          {face('right-[14%] bottom-[10%] h-[66%] w-[24%] !bg-transparent')}
          <Label text="Télévision qui affiche le support + Tiziana" />
        </>
      )}
      {id === 'debunk' && (
        <>
          <div className="absolute inset-[10%_34%_10%_6%] flex flex-col justify-center rounded-md bg-white p-[5%]">
            <div className="mb-2 text-[9px] font-semibold tracking-[0.18em] text-[#e0533d]">IDÉE REÇUE</div>
            {lines(2, 'bg-[#17171a]')}
            <div className="absolute right-[8%] top-[12%] rotate-[-8deg] rounded border-2 border-[#e0533d] px-1.5 text-[10px] font-bold text-[#e0533d]">FAUX</div>
          </div>
          {face('right-[5%] top-[10%] h-[80%] w-[26%]')}
          <Label text="Affirmation à l’écran, puis démontage face caméra" />
        </>
      )}
      {id === 'motion-vo' && (
        <>
          <div className="absolute inset-0 p-[7%]" style={{ background: '#0D092E' }}>
            <div className="mb-[4%] text-[8px] tracking-[0.3em] text-white/50">F Y N O V A T E S</div>
            <div className="flex h-[55%] items-end gap-[3%]">
              {[70, 45, 25, 12, 30].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 0 ? '#fff' : i === 4 ? '#A49CFF' : 'rgba(255,255,255,.35)' }} />
              ))}
            </div>
            <div className="absolute bottom-[8%] left-[7%] right-[7%] flex h-[10%] items-center gap-[2px]">
              {Array.from({ length: 48 }).map((_, i) => (
                <span key={i} className="flex-1 rounded-full bg-white/50" style={{ height: `${20 + ((i * 37) % 80)}%` }} />
              ))}
            </div>
          </div>
          <Label text="Animation aux codes Fynovates + voix off" />
        </>
      )}
      {id === 'expert-motion' && (
        <>
          <div className="absolute inset-0 bg-[#e9e7e2]" />
          {face('left-[5%] bottom-0 h-[86%] w-[32%] !rounded-none')}
          <div className="absolute right-[6%] top-[14%] w-[52%] space-y-[6%]">
            {['01', '02', '03'].map((n, i) => (
              <div key={n} className="flex items-center gap-2 rounded-sm px-2 py-1.5" style={{ background: i === 1 ? '#0D092E' : '#fff' }}>
                <span className={clsx('text-[9px] font-semibold', i === 1 ? 'text-white' : 'text-[#0D092E]')}>{n}</span>
                <div className={clsx('h-[3px] flex-1 rounded-full', i === 1 ? 'bg-white/70' : 'bg-[#cfcfe0]')} />
              </div>
            ))}
          </div>
          <Label text="Expert face caméra + motion en surimpression" dark={false} />
        </>
      )}
    </div>
  )
}

function Label({ text, dark = true }: { text: string; dark?: boolean }) {
  return (
    <div className={clsx('absolute bottom-[4%] left-[4%] rounded px-1.5 py-0.5 text-[10px] font-medium', dark ? 'bg-black/55 text-white' : 'bg-white/90 text-[#17171a]')}>
      {text}
    </div>
  )
}
