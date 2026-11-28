import clsx from 'clsx'
import { Page } from '../components/AppShell'
import { PageHeader, Section, ValidationBadge } from '../components/ui'
import { BRANDS, PLATFORMS } from '../lib/constants'
import { DAYS, rhythms, type Rhythm } from '../lib/seed/rhythm'

export function RhythmRows({ list }: { list: Rhythm[] }) {
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-surface">
      {list.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PLATFORMS[r.platform].color }} />
          <div className="min-w-[220px] flex-1">
            <div className="text-[13px] font-medium">{r.label}</div>
            {r.note && <div className="text-[12px] text-ink-3">{r.note}</div>}
          </div>
          <span className={clsx('text-[14px] font-semibold tabular', r.frequency === 'À RENSEIGNER' && 'text-[11px] tracking-[0.06em] text-ink-3')}>{r.frequency}</span>
        </div>
      ))}
    </div>
  )
}

export default function RhythmView() {
  const fn = rhythms.filter((r) => PLATFORMS[r.platform].brand === 'FN')
  const tz = rhythms.filter((r) => PLATFORMS[r.platform].brand === 'TZ')
  const total = (list: Rhythm[]) => {
    const min = list.reduce((a, r) => a + r.perWeek[0], 0)
    const max = list.reduce((a, r) => a + r.perWeek[1], 0)
    return min === max ? `${min}` : `${min} à ${max}`
  }

  return (
    <Page wide>
      <PageHeader
        eyebrow="Stratégie"
        title="Rythme de publication"
        description="La fréquence de publication de chaque compte. Au démarrage, les shorts Fynovates passent à un par jour pour tester la stratégie."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {[
          { b: 'FN' as const, list: fn },
          { b: 'TZ' as const, list: tz },
        ].map(({ b, list }) => (
          <div key={b} className="card p-4">
            <div className="flex items-center gap-2">
              <span className="h-4 w-[3px] rounded-full" style={{ background: BRANDS[b].color }} />
              <span className="text-[13px] font-semibold">{BRANDS[b].label}</span>
            </div>
            <div className="display mt-2 text-[34px] leading-none">{total(list)}</div>
            <div className="mt-1 text-[12px] text-ink-3">publications par semaine{b === 'TZ' ? ' (hors feed et Reels, À RENSEIGNER)' : ''}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Fynovates">
          <RhythmRows list={fn} />
        </Section>
        <Section title="Tiziana / Madame Caci">
          <RhythmRows list={tz} />
        </Section>
      </div>

      <Section title="Semaine type" aside={<ValidationBadge value="STRATÉGIE PROPOSÉE" />}>
        <p className="mb-3 text-[12.5px] text-ink-3">
          Les fréquences sont validées. La répartition par jour des rythmes « 3 par semaine » et « 3 à 4 par semaine » est un exemple, à ajuster. Le jour de sortie du long format YouTube n’est pas défini.
        </p>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface scroll-thin">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr className="bg-surface-2">
                <th className="w-[280px] border-b border-line px-3 py-2 text-left text-[11px] font-medium text-ink-3">Contenu</th>
                {DAYS.map((d) => (
                  <th key={d} className="border-b border-l border-line px-2 py-2 text-center text-[11px] font-medium text-ink-2">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rhythms.map((r) => (
                <tr key={r.id}>
                  <td className="border-b border-line px-3 py-2">
                    <div className="flex items-center gap-2 text-[12.5px]">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PLATFORMS[r.platform].color }} />
                      {r.label}
                    </div>
                    <div className="pl-4 text-[11px] text-ink-3">{r.frequency}</div>
                  </td>
                  {r.days === null ? (
                    <td colSpan={7} className="border-b border-l border-line px-3 py-2 text-center text-[11.5px] text-ink-3">
                      {r.perWeek[1] ? `${r.frequency} — jour à définir` : 'À RENSEIGNER'}
                    </td>
                  ) : (
                    DAYS.map((_, i) => {
                      const on = r.days!.includes(i)
                      const optional = r.perWeek[0] !== r.perWeek[1] && on && i === r.days![r.days!.length - 1]
                      return (
                        <td key={i} className="border-b border-l border-line p-1.5 text-center">
                          {on && (
                            <span
                              className={clsx('mx-auto block h-6 rounded-md', optional && 'opacity-40')}
                              style={{ background: `color-mix(in srgb, ${PLATFORMS[r.platform].color} ${optional ? 40 : 75}%, transparent)` }}
                              title={optional ? 'Optionnel' : undefined}
                            />
                          )}
                        </td>
                      )
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11.5px] text-ink-3">Case claire : publication optionnelle (4e séquence Stories Fynovates).</p>
      </Section>
    </Page>
  )
}
