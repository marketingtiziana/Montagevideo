import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { EmptyState, PageHeader, Section, ValidationBadge } from '../components/ui'
import { BRANDS, PLATFORMS } from '../lib/constants'
import { useBrands, useChannels } from '../lib/hooks'
import type { BrandId, StrategySection } from '../lib/types'

export function SectionList({ s }: { s: StrategySection }) {
  const isRules = s.kind === 'rules'
  return (
    <div className={`rounded-xl border bg-surface p-4 ${isRules ? 'border-[color-mix(in_srgb,var(--v-expert)_28%,var(--line))]' : 'border-line'}`}>
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="text-[12.5px] font-semibold">{s.title}</h3>
        {isRules && <span className="text-[10px] font-semibold tracking-[0.08em] text-[var(--v-expert)]">RÈGLE</span>}
      </div>
      <ul className="space-y-1">
        {s.items.map((it, i) => (
          <li key={it.id} className="flex items-start gap-2 text-[13px] leading-relaxed">
            {s.kind === 'pillars' ? (
              <span className="w-4 shrink-0 tabular text-ink-3">{i + 1}</span>
            ) : (
              <span className={`mt-[9px] h-1 w-1 shrink-0 rounded-full ${isRules ? 'bg-[var(--v-expert)]' : 'bg-ink-3'}`} />
            )}
            <span className="flex-1">{it.text}</span>
            {it.validation !== 'VALIDÉ' && <ValidationBadge value={it.validation} className="mt-0.5" />}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Brand() {
  const { id } = useParams<{ id: BrandId }>()
  const b = useBrands().find((x) => x.id === id)
  const channels = useChannels().filter((c) => c.brand === id)
  if (!b || !id) return <Page><EmptyState title="Marque introuvable" /></Page>
  return (
    <Page>
      <PageHeader
        eyebrow={id === 'FN' ? 'Marque cabinet' : 'Personal branding'}
        title={b.name}
        description={
          <>
            <div className="text-ink-3">{b.descriptor}</div>
            <div className="mt-2 text-[15px] text-ink">{b.positioning}</div>
          </>
        }
        actions={
          <Link to={`/da/${id}`} className="rounded-md border border-line bg-surface px-3 py-1.5 text-[13px] hover:border-line-strong">
            Voir la charte →
          </Link>
        }
      />
      <div className="mb-8 h-1.5 w-24 rounded-full" style={{ background: BRANDS[id].color }} />
      <div className="grid gap-4 md:grid-cols-2">
        {b.sections.map((s) => (
          <SectionList key={s.id} s={s} />
        ))}
      </div>
      <Section title="Plateformes" className="mt-10">
        <div className="grid gap-3 md:grid-cols-2">
          {channels.map((ch) => (
            <Link key={ch.id} to={`/channel/${ch.id}`} className="rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <span className="h-2 w-2 rounded-full" style={{ background: PLATFORMS[ch.id].color }} />
                {ch.name}
              </div>
              <p className="mt-1 text-[12.5px] text-ink-3">{ch.role}</p>
            </Link>
          ))}
        </div>
      </Section>
    </Page>
  )
}
