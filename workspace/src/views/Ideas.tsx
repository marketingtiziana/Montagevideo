import { useMemo, useState } from 'react'
import { Page } from '../components/AppShell'
import { IdeaCard } from '../components/Cards'
import { EmptyState, PageHeader, Select, Tabs } from '../components/ui'
import { FORMATS, PILLAR_IDS, PILLARS, PLATFORM_IDS, PLATFORMS } from '../lib/constants'
import { useContents } from '../lib/hooks'
import type { Format, PillarId, PlatformId } from '../lib/types'

export default function Ideas() {
  const contents = useContents()
  const [platform, setPlatform] = useState<PlatformId | 'all'>('all')
  const [pillar, setPillar] = useState<PillarId | null>(null)
  const [format, setFormat] = useState<Format | null>(null)
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const s = q.toLowerCase()
    return contents.filter(
      (c) =>
        (platform === 'all' || c.platforms.includes(platform)) &&
        (!pillar || c.pillar === pillar) &&
        (!format || c.format === format) &&
        (!s || `${c.id} ${c.subject} ${c.hook} ${c.angle}`.toLowerCase().includes(s)),
    )
  }, [contents, platform, pillar, format, q])
  const formats = [...new Set(contents.map((c) => c.format))]

  return (
    <Page wide>
      <PageHeader
        eyebrow="Idées de contenus"
        title="Idées par plateforme"
        description="Posts, Reels, Stories, carrousels et infographies : l’accroche, le format, l’angle et la référence visuelle de chaque idée. Clique sur une idée pour voir son déroulé et sa maquette."
      />
      <Tabs
        className="mb-3"
        value={platform}
        onChange={setPlatform}
        items={[
          { value: 'all' as const, label: 'Toutes', count: contents.length },
          ...PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label, count: contents.filter((c) => c.platforms.includes(p)).length })),
        ]}
      />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input className="input !w-[240px]" placeholder="Rechercher une idée…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="!w-[200px]" allowEmpty emptyLabel="Tous les piliers" value={pillar} onChange={setPillar} options={PILLAR_IDS.map((p) => ({ value: p, label: `${p} — ${PILLARS[p].short}` }))} />
        <Select className="!w-[220px]" allowEmpty emptyLabel="Tous les formats" value={format} onChange={setFormat} options={formats.map((f) => ({ value: f, label: FORMATS[f] }))} />
        <span className="ml-auto text-[12px] text-ink-3">{list.length} idée(s)</span>
      </div>
      {list.length === 0 ? (
        <EmptyState title="Aucune idée ne correspond" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <IdeaCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </Page>
  )
}
