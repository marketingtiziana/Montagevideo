import { Plus } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Page } from '../components/AppShell'
import { Button, Loading, PageHeader, PlatformChip, Section, TextArea, ValidationBadge } from '../components/ui'
import { createProblem } from '../lib/actions'
import { PILLARS } from '../lib/constants'
import { db } from '../lib/db'
import { useDetail } from '../lib/detail'
import { useChannels, useContents, usePillars, useProblems, useProblemUsage } from '../lib/hooks'

export default function Pillars() {
  const pillars = usePillars()
  const problems = useProblems()
  const contents = useContents()
  const channels = useChannels()
  const usage = useProblemUsage(contents)
  const { open } = useDetail()
  const loc = useLocation()
  useEffect(() => {
    if (loc.hash) document.getElementById(`pillar-${loc.hash.slice(1)}`)?.scrollIntoView({ behavior: 'smooth' })
  }, [loc.hash, pillars])
  if (!pillars || !problems || !contents || !channels) return <Loading />

  const channelPillars = channels.flatMap((ch) => ch.sections.filter((s) => s.kind === 'pillars').map((s) => ({ ch, s })))

  return (
    <Page>
      <PageHeader
        eyebrow="Strategy"
        title="Editorial Pillars"
        description="Six piliers structurent la banque des problématiques prospects. Chaque plateforme LinkedIn possède en plus ses propres piliers éditoriaux."
      />
      <div className="space-y-6">
        {pillars.map((p) => {
          const list = problems.filter((x) => x.pillar === p.id)
          const nContents = contents.filter((c) => c.pillar === p.id).length
          return (
            <section key={p.id} id={`pillar-${p.id}`} className="card scroll-mt-6 overflow-hidden">
              <div className="flex flex-wrap items-start gap-4 border-b border-line p-5">
                <span className="display flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[28px] text-white" style={{ background: PILLARS[p.id].color }}>
                  {p.id}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[16px] font-semibold">{p.title}</h2>
                  <TextArea
                    rows={1}
                    className="mt-1 !border-transparent !bg-transparent !px-0 text-[13px] text-ink-2 hover:!border-line focus:!px-2"
                    value={p.summary}
                    onCommit={(v) => db.pillars.update(p.id, { summary: v })}
                  />
                </div>
                <div className="text-right text-[12px] text-ink-3">
                  <div>
                    <b className="tabular text-ink">{list.length}</b> problématiques
                  </div>
                  <div>
                    <b className="tabular text-ink">{nContents}</b> contenus
                  </div>
                </div>
              </div>
              <div className="divide-y divide-line">
                {list.map((pb) => (
                  <button key={pb.id} type="button" onClick={() => open('p', pb.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-left hover:bg-surface-2">
                    <span className="w-[56px] font-mono text-[11px] text-ink-3">{pb.id}</span>
                    <span className="min-w-0 flex-1 text-[13px]">{pb.title}</span>
                    <span className="flex gap-1">
                      {pb.platforms.slice(0, 4).map((pl) => (
                        <PlatformChip key={pl} id={pl} compact />
                      ))}
                    </span>
                    <span className="w-[70px] text-right text-[11.5px] tabular text-ink-3">{usage.get(pb.id)?.length ?? 0} contenu(s)</span>
                    <ValidationBadge value={pb.validation} />
                  </button>
                ))}
              </div>
              <div className="border-t border-line px-5 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Plus size={12} />}
                  onClick={async () => open('p', await createProblem(p.id))}
                >
                  Ajouter une problématique
                </Button>
              </div>
            </section>
          )
        })}
      </div>
      <Section title="Piliers éditoriaux par plateforme" className="mt-10">
        <div className="grid gap-4 md:grid-cols-2">
          {channelPillars.map(({ ch, s }) => (
            <div key={ch.id} className="card p-4">
              <div className="mb-2 text-[13px] font-semibold">{ch.name}</div>
              <ol className="space-y-1">
                {s.items.map((it, i) => (
                  <li key={it.id} className="flex gap-2 text-[12.5px]">
                    <span className="w-4 tabular text-ink-3">{i + 1}</span>
                    {it.text}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  )
}
