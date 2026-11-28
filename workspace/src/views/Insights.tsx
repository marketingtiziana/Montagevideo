import { useState } from 'react'
import { Page } from '../components/AppShell'
import { PageHeader, Tabs } from '../components/ui'
import { PILLAR_IDS, PILLARS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useContents, useProblems } from '../lib/hooks'
import { longforms } from '../lib/seed/longform'
import type { PillarId } from '../lib/types'

export default function Insights() {
  const problems = useProblems()
  const contents = useContents()
  const { open } = useDetail()
  const [pillar, setPillar] = useState<PillarId | 'all'>('all')
  const list = problems.filter((p) => pillar === 'all' || p.pillar === pillar)
  return (
    <Page wide>
      <PageHeader
        eyebrow="Stratégie"
        title="Problématiques prospects"
        description="Les situations concrètes que vivent les prospects, regroupées en six piliers. Chaque problématique est une source d’idées : clique pour voir les contenus et long formats qui la traitent."
      />
      <Tabs
        className="mb-5"
        value={pillar}
        onChange={setPillar}
        items={[
          { value: 'all' as const, label: 'Tous', count: problems.length },
          ...PILLAR_IDS.map((p) => ({ value: p, label: `${p} · ${PILLARS[p].short}`, count: problems.filter((x) => x.pillar === p).length })),
        ]}
      />
      {PILLAR_IDS.filter((p) => pillar === 'all' || p === pillar).map((p) => (
        <section key={p} className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="display flex h-9 w-9 items-center justify-center rounded-lg text-[20px] text-white" style={{ background: PILLARS[p].color }}>
              {p}
            </span>
            <h2 className="text-[15px] font-semibold">{PILLARS[p].label}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list
              .filter((x) => x.pillar === p)
              .map((x) => {
                const n = contents.filter((c) => c.problemIds.includes(x.id)).length
                const lf = longforms.filter((l) => l.problemIds.includes(x.id)).length
                return (
                  <button key={x.id} type="button" onClick={() => open('p', x.id)} className="card flex flex-col p-4 text-left transition-shadow hover:shadow-[var(--shadow-lg)]">
                    <div className="mb-1 font-mono text-[11px] text-ink-3">{x.id}</div>
                    <div className="text-[13.5px] font-semibold leading-snug">{x.title}</div>
                    <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-ink-2">{x.situation}</p>
                    <div className="mt-auto pt-3 text-[11.5px] text-ink-3">
                      {n} idée(s){lf ? ` · ${lf} long format(s)` : ''}
                    </div>
                  </button>
                )
              })}
          </div>
        </section>
      ))}
    </Page>
  )
}
