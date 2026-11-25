import clsx from 'clsx'
import { Plus } from 'lucide-react'
import { Page } from '../components/AppShell'
import { Thumb } from '../components/images/Thumb'
import { BrandChip, Button, EmptyState, Loading, PageHeader, PlatformChip, Section, StageBadge, ValidationBadge } from '../components/ui'
import { createContent } from '../lib/actions'
import { FORMATS, modelFor } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useById, useContents, useImages } from '../lib/hooks'
import type { Content, Format } from '../lib/types'

type Model = 'infographic' | 'carousel' | 'storyboard'
const META: Record<Model, { title: string; letter: string; description: string; format: Format }> = {
  infographic: {
    title: 'Infographics',
    letter: 'A',
    description: 'Modèle A — proposition de structure, titre, blocs d’information, hiérarchie et composition. Les 10 infographies de référence LinkedIn (IMG-001) y sont intégrées.',
    format: 'infographie',
  },
  carousel: {
    title: 'Carousels',
    letter: 'B',
    description: 'Modèle B — chaque slide en miniature avec son titre, son message, sa fonction narrative et sa composition.',
    format: 'carrousel',
  },
  storyboard: {
    title: 'Storyboards',
    letter: 'C',
    description: 'Modèle C — timeline verticale des scènes pour les Reels, shorts, motion design et formats YouTube.',
    format: 'reel',
  },
}

export default function ModelGallery({ model }: { model: Model }) {
  const contents = useContents()
  const { open } = useDetail()
  if (!contents) return <Loading />
  const m = META[model]
  const list = contents.filter((c) => modelFor(c.format) === model)
  const withModel = list.filter((c) => (model === 'infographic' ? c.infographic : model === 'carousel' ? c.slides?.length : c.scenes?.length))
  const without = list.filter((c) => !withModel.includes(c))

  const create = async () => {
    const id = await createContent('FN', { format: m.format })
    open('c', id, 'creative')
  }

  return (
    <Page wide>
      <PageHeader eyebrow="Creative Studio" title={m.title} description={m.description} actions={<Button variant="primary" icon={<Plus size={14} />} onClick={create}>Nouveau</Button>} />
      <Section title={`Modèles construits (${withModel.length})`}>
        {withModel.length === 0 ? (
          <EmptyState title="Aucun modèle construit" description="Ouvre un contenu ci-dessous et construis sa structure dans l’onglet « Direction créative »." />
        ) : (
          <div className={clsx('grid gap-4', model === 'storyboard' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
            {withModel.map((c) => (
              <ModelCard key={c.id} c={c} model={model} />
            ))}
          </div>
        )}
      </Section>
      <Section title={`À structurer (${without.length})`}>
        {without.length === 0 ? (
          <div className="text-[12.5px] text-ink-3">Tous les contenus de ce format ont une structure.</div>
        ) : (
          <div className="divide-y divide-line rounded-xl border border-line bg-surface">
            {without.map((c) => (
              <button key={c.id} type="button" onClick={() => open('c', c.id, 'creative')} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-left hover:bg-surface-2">
                <span className="w-[54px] font-mono text-[11px] text-ink-3">{c.id}</span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{c.subject}</span>
                <span className="text-[11.5px] text-ink-3">{FORMATS[c.format]}</span>
                <StageBadge id={c.status} />
              </button>
            ))}
          </div>
        )}
      </Section>
    </Page>
  )
}

function ModelCard({ c, model }: { c: Content; model: Model }) {
  const { open } = useDetail()
  const images = useImages()
  const byId = useById(images)
  return (
    <button type="button" onClick={() => open('c', c.id, 'creative')} className="card flex flex-col overflow-hidden text-left transition-shadow hover:shadow-[var(--shadow-lg)]">
      <div className="border-b border-line bg-surface-2 p-3">
        {model === 'infographic' && c.infographic && (
          <div className="mx-auto aspect-[4/5] max-w-[220px] rounded-md bg-white p-3 text-[#17171a] shadow-[var(--shadow)]">
            <div className="mb-1.5 text-[5.5px] font-semibold tracking-[0.2em]">FYNOVATES</div>
            <div className="mb-2 line-clamp-3 text-[9px] font-semibold leading-tight">{c.infographic.title}</div>
            <div className="space-y-1">
              {c.infographic.blocks.slice(0, 7).map((b) => (
                <div key={b.id} className={clsx('rounded-[2px] px-1.5 py-1 text-[5.5px] leading-tight', b.level === 1 ? 'bg-[#141a33] text-white' : b.level === 2 ? 'border border-[#e4e2dc]' : 'bg-[#f0efeb]')}>
                  {b.title}
                </div>
              ))}
            </div>
          </div>
        )}
        {model === 'carousel' && (
          <div className="flex gap-1.5 overflow-hidden">
            {(c.slides ?? []).slice(0, 4).map((s, i) => (
              <div key={s.id} className={clsx('relative aspect-[4/5] w-1/4 shrink-0 overflow-hidden rounded-sm', i === 0 ? 'bg-[#141a33] text-white' : 'bg-white text-[#17171a]')}>
                {s.imageId && i === 0 ? (
                  <Thumb img={byId.get(s.imageId)} className="h-full w-full" />
                ) : (
                  <div className="p-1 text-[5.5px] font-semibold leading-tight">{s.title}</div>
                )}
                <span className="absolute bottom-0.5 right-1 text-[6px] opacity-60">{i + 1}</span>
              </div>
            ))}
          </div>
        )}
        {model === 'storyboard' && (
          <ol className="space-y-1">
            {(c.scenes ?? []).slice(0, 5).map((s, i) => (
              <li key={s.id} className="flex gap-2 text-[11px]">
                <span className="w-4 shrink-0 tabular text-ink-3">{i + 1}</span>
                <span className="w-14 shrink-0 tabular text-ink-3">{s.duration}</span>
                <span className="truncate text-ink-2">{s.dialogue || s.image}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink-3">{c.id}</span>
          <span className="ml-auto">
            <ValidationBadge value={c.validation} />
          </span>
        </div>
        <div className="line-clamp-2 text-[13px] font-medium leading-snug">{c.subject}</div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2.5">
          {c.brands.map((b) => (
            <BrandChip key={b} id={b} compact />
          ))}
          {c.platforms.slice(0, 2).map((p) => (
            <PlatformChip key={p} id={p} compact />
          ))}
          <span className="ml-auto text-[11px] text-ink-3">
            {model === 'carousel' ? `${c.slides?.length} slides` : model === 'storyboard' ? `${c.scenes?.length} scènes` : `${c.infographic?.blocks.length} blocs`}
          </span>
        </div>
      </div>
    </button>
  )
}
