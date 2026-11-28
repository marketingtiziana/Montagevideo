import { Link } from 'react-router-dom'
import { ctaById, type CtaId } from '../lib/seed/cta'

const TONE: Record<CtaId, string> = {
  video: 'var(--c-yt)',
  rdv: 'var(--c-fn)',
  message: 'var(--c-fn)',
  bio: 'var(--c-li)',
  interaction: 'var(--c-tz)',
  soft: 'var(--ink-3)',
}

export function CtaBadge({ id, link = true }: { id: CtaId; link?: boolean }) {
  const c = ctaById[id]
  const el = (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11.5px] font-medium"
      style={{ color: TONE[id], borderColor: `color-mix(in srgb, ${TONE[id]} 30%, var(--line))`, background: `color-mix(in srgb, ${TONE[id]} 6%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE[id] }} />
      CTA · {c.name}
    </span>
  )
  return link ? <Link to={`/journeys#cta-${id}`}>{el}</Link> : el
}
