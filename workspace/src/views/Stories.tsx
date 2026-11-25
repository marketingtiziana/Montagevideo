import { Plus } from 'lucide-react'
import { Page } from '../components/AppShell'
import { Thumb } from '../components/images/Thumb'
import { BrandChip, Button, EmptyState, Loading, PageHeader, Section, StageBadge, ValidationBadge } from '../components/ui'
import { createContent } from '../lib/actions'
import { OBJECTIVES } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { useById, useContents, useImages } from '../lib/hooks'
import type { Content } from '../lib/types'

const EXPECTED_FN_SEQUENCES = 10

export default function Stories() {
  const contents = useContents()
  const { open } = useDetail()
  if (!contents) return <Loading />
  const stories = contents.filter((c) => c.format === 'story')
  const fnSeq = stories.filter((c) => c.brands.includes('FN') && /^Séquence/.test(c.subject))
  const fnKits = stories.filter((c) => c.brands.includes('FN') && !/^Séquence/.test(c.subject))
  const tz = stories.filter((c) => c.brands.includes('TZ'))

  const create = async (kind: 'FN' | 'TZ') => {
    const id = await createContent(kind, {
      format: 'story',
      subject: 'Séquence Stories — nouvelle',
      platforms: [kind === 'FN' ? 'ig-fn' : 'ig-tz'],
      screens: [],
    })
    open('c', id, 'creative')
  }

  return (
    <Page wide>
      <PageHeader
        eyebrow="Operations"
        title="Story Sequences"
        description="Les séquences de Stories en format 9:16, écran par écran. Pédagogiques, de conversion ou de personal branding : chaque séquence mène à un parcours de conversion précis."
        actions={
          <>
            <Button icon={<Plus size={14} />} onClick={() => create('TZ')}>
              Séquence TZ
            </Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => create('FN')}>
              Séquence FN
            </Button>
          </>
        }
      />
      <Section
        title="Instagram Fynovates — séquences"
        aside={
          <span className="text-[12px] text-ink-3">
            {fnSeq.length} / {EXPECTED_FN_SEQUENCES} séquences du document stratégique intégrées
            {fnSeq.length < EXPECTED_FN_SEQUENCES && ' — les autres sont À RENSEIGNER (document non fourni)'}
          </span>
        }
      >
        <div className="space-y-5">
          {fnSeq.map((c) => (
            <SequenceRow key={c.id} c={c} />
          ))}
          {Array.from({ length: Math.max(0, EXPECTED_FN_SEQUENCES - fnSeq.length) }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => create('FN')}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-line-strong px-4 py-3 text-left text-[12.5px] text-ink-3 hover:bg-surface-2"
            >
              <span>
                Séquence {fnSeq.length + i + 1} — <b className="tracking-[0.05em]">À RENSEIGNER</b>
              </span>
              <span className="inline-flex items-center gap-1">
                <Plus size={12} /> Créer
              </span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Instagram Fynovates — Stories unitaires">
        <div className="space-y-5">
          {fnKits.map((c) => (
            <SequenceRow key={c.id} c={c} />
          ))}
        </div>
      </Section>
      <Section title="Instagram Tiziana">
        {tz.length === 0 ? (
          <EmptyState title="Aucune Story Tiziana" />
        ) : (
          <div className="space-y-5">
            {tz.map((c) => (
              <SequenceRow key={c.id} c={c} />
            ))}
          </div>
        )}
      </Section>
    </Page>
  )
}

function SequenceRow({ c }: { c: Content }) {
  const { open } = useDetail()
  const images = useImages()
  const byId = useById(images)
  const screens = c.screens ?? []
  return (
    <div className="card overflow-hidden">
      <button type="button" onClick={() => open('c', c.id, 'creative')} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-2.5 text-left hover:bg-surface-2">
        <span className="font-mono text-[11px] text-ink-3">{c.id}</span>
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{c.subject}</span>
        {c.brands.map((b) => (
          <BrandChip key={b} id={b} compact />
        ))}
        {c.objective && <span className="text-[11.5px] text-ink-3">{OBJECTIVES[c.objective]}</span>}
        <StageBadge id={c.status} />
        <ValidationBadge value={c.validation} />
      </button>
      <div className="flex gap-3 overflow-x-auto p-4 scroll-thin">
        {screens.length === 0 && <div className="text-[12.5px] text-ink-3">Aucun écran — ouvre la fiche pour construire la séquence.</div>}
        {screens.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => open('c', c.id, 'creative')}
            className="relative aspect-[9/16] w-[150px] shrink-0 overflow-hidden rounded-[14px] border border-line bg-[#141a33] text-left"
          >
            {s.imageId && i === 0 && <Thumb img={byId.get(s.imageId)} className="absolute inset-0 h-full w-full opacity-40" />}
            <div className="absolute inset-x-2 top-2 flex gap-0.5">
              {screens.map((_, k) => (
                <span key={k} className={`h-[2px] flex-1 rounded-full ${k <= i ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
            <div className="absolute inset-x-2.5 top-6 line-clamp-[9] text-[9.5px] font-medium leading-snug text-white">{s.text}</div>
            {s.interaction && <div className="absolute inset-x-2.5 bottom-9 rounded bg-white/95 px-1.5 py-1 text-center text-[8.5px] text-[#17171a]">{s.interaction}</div>}
            {s.cta && <div className="absolute inset-x-2.5 bottom-3 truncate text-[8.5px] text-white/70">{s.cta}</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
