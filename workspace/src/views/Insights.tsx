import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Page } from '../components/AppShell'
import { BrandChip, Button, EmptyState, Loading, PageHeader, PillarChip, PlatformChip, Select, Tabs, ValidationBadge } from '../components/ui'
import { createProblem } from '../lib/actions'
import { FORMATS, PILLAR_IDS, PILLARS, PLATFORM_IDS, PLATFORMS, VALIDATIONS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useContents, useProblems, useProblemUsage } from '../lib/hooks'
import type { PillarId, PlatformId, Validation } from '../lib/types'

export default function Insights() {
  const problems = useProblems()
  const contents = useContents()
  const usage = useProblemUsage(contents)
  const { open } = useDetail()
  const [pillar, setPillar] = useState<PillarId | 'all'>('all')
  const [q, setQ] = useState('')
  const [platform, setPlatform] = useState<PlatformId | null>(null)
  const [validation, setValidation] = useState<Validation | null>(null)
  const [orphans, setOrphans] = useState(false)

  const list = useMemo(() => {
    const s = q.toLowerCase()
    return (problems ?? []).filter(
      (p) =>
        (pillar === 'all' || p.pillar === pillar) &&
        (!platform || p.platforms.includes(platform)) &&
        (!validation || p.validation === validation) &&
        (!orphans || !usage.get(p.id)?.length) &&
        (!s || `${p.id} ${p.title} ${p.situation} ${p.pedagogicalAngle}`.toLowerCase().includes(s)),
    )
  }, [problems, pillar, platform, validation, orphans, q, usage])

  if (!problems || !contents) return <Loading />

  return (
    <Page wide>
      <PageHeader
        eyebrow="Strategy"
        title="Prospect Insights"
        description="La banque centrale des problématiques prospects. Chaque sujet est relié aux contenus qui le traitent ; les sujets récurrents sont conservés et reliés, jamais supprimés."
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={async () => open('p', await createProblem(pillar === 'all' ? 'A' : pillar))}>
            Nouvelle problématique
          </Button>
        }
      />
      <Tabs
        className="mb-3"
        value={pillar}
        onChange={setPillar}
        items={[
          { value: 'all' as const, label: 'Tous les piliers', count: problems.length },
          ...PILLAR_IDS.map((p) => ({ value: p, label: `${p} · ${PILLARS[p].short}`, count: problems.filter((x) => x.pillar === p).length })),
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input className="input !w-[260px]" placeholder="Rechercher une problématique…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="!w-[180px]" allowEmpty emptyLabel="Plateforme" value={platform} onChange={setPlatform} options={PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label }))} />
        <Select className="!w-[200px]" allowEmpty emptyLabel="Statut" value={validation} onChange={setValidation} options={VALIDATIONS.map((v) => ({ value: v, label: v }))} />
        <label className="flex items-center gap-2 text-[12.5px] text-ink-2">
          <input type="checkbox" checked={orphans} onChange={(e) => setOrphans(e.target.checked)} /> Sans contenu lié
        </label>
        <span className="ml-auto text-[12px] text-ink-3">{list.length} problématique(s)</span>
      </div>
      {list.length === 0 ? (
        <EmptyState title="Aucune problématique" description="Modifie les filtres ou crée une nouvelle problématique." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <button key={p.id} type="button" onClick={() => open('p', p.id)} className="card flex flex-col p-4 text-left transition-shadow hover:shadow-[var(--shadow-lg)]">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-3">{p.id}</span>
                <PillarChip id={p.pillar} />
                <span className="ml-auto">
                  <ValidationBadge value={p.validation} />
                </span>
              </div>
              <div className="text-[14px] font-semibold leading-snug">{p.title}</div>
              <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-ink-2">{p.situation}</p>
              <div className="mt-3 border-t border-line pt-2.5">
                <div className="eyebrow mb-1">Angle pédagogique</div>
                <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-3">{p.pedagogicalAngle}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                {p.brands.map((b) => (
                  <BrandChip key={b} id={b} compact />
                ))}
                {p.platforms.slice(0, 3).map((pl) => (
                  <PlatformChip key={pl} id={pl} compact />
                ))}
                {p.platforms.length > 3 && <span className="text-[11px] text-ink-3">+{p.platforms.length - 3}</span>}
                <span className="ml-auto text-[11.5px] tabular text-ink-3">
                  {usage.get(p.id)?.length ?? 0} contenu(s) · {p.formats.slice(0, 1).map((f) => FORMATS[f]).join('')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Page>
  )
}
