import { AlertTriangle, ExternalLink, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BRANDS, CREATIVE_FIELDS, FORMATS, IMAGE_TYPES, OBJECTIVES, PILLARS, PLATFORMS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import { getContent, getImage, getProblem, useContents, useContent, useImage, useProblem } from '../lib/hooks'
import { longforms, setups } from '../lib/seed/longform'
import type { Content } from '../lib/types'
import { InfographicPreview, ScenesList, SetupSchema, SlidesStrip, StoryStrip } from './Previews'
import { Thumb } from './images/Thumb'
import { IconButton, PillarChip, PlatformChip, Sheet, ValidationBadge } from './ui'

function Head({ id, title, onClose, children }: { id: string; title: string; onClose: () => void; children?: React.ReactNode }) {
  return (
    <div className="border-b border-line bg-surface px-5 py-4 md:px-7">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-3">
            <span className="font-mono">{id}</span>
            {children}
          </div>
          <h2 className="text-[20px] font-semibold leading-snug tracking-[-0.01em]">{title}</h2>
        </div>
        <IconButton label="Fermer" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>
    </div>
  )
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="text-[13.5px] leading-relaxed text-ink">{children}</div>
    </div>
  )
}

export function ExpertNote() {
  return (
    <div className="flex gap-2 rounded-lg bg-[color-mix(in_srgb,var(--v-expert)_7%,transparent)] px-3 py-2 text-[12.5px]">
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
      Contenu fiscal ou réglementaire : à faire valider par un expert avant tournage ou publication.
    </div>
  )
}

function RelatedIdeas({ ids }: { ids: string[] }) {
  const { open } = useDetail()
  const list = ids.map(getContent).filter(Boolean) as Content[]
  if (!list.length) return null
  return (
    <Block label="Idées liées">
      <div className="divide-y divide-line rounded-lg border border-line bg-surface">
        {list.map((c) => (
          <button key={c.id} type="button" onClick={() => open('c', c.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-2">
            <span className="w-[50px] shrink-0 font-mono text-[11px] text-ink-3">{c.id}</span>
            <span className="min-w-0 flex-1 truncate text-[13px]">{c.hook || c.subject}</span>
            <span className="hidden shrink-0 text-[11px] text-ink-3 sm:inline">{FORMATS[c.format]}</span>
          </button>
        ))}
      </div>
    </Block>
  )
}

function Refs({ ids }: { ids: string[] }) {
  const { open } = useDetail()
  if (!ids.length) return null
  return (
    <Block label="Références visuelles">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {ids.map((id) => (
          <button key={id} type="button" onClick={() => open('i', id)} className="overflow-hidden rounded-md border border-line bg-surface text-left hover:border-line-strong">
            <Thumb img={getImage(id)} className="aspect-[4/3] w-full object-top" />
            <div className="px-1.5 py-1 font-mono text-[10px] text-ink-3">{id}</div>
          </button>
        ))}
      </div>
    </Block>
  )
}

/* ---------------- Idée de contenu ---------------- */
export function IdeaSheet() {
  const { contentId, close } = useDetail()
  const c = useContent(contentId)
  return (
    <Sheet open={!!contentId} onClose={close} label="Idée de contenu" width="max-w-[900px]">
      {c && (
        <>
          <Head id={c.id} title={c.hook && c.hook !== 'À RENSEIGNER' ? c.hook : c.subject} onClose={close}>
            {c.brands.map((b) => (
              <span key={b} className="inline-flex items-center gap-1">
                <span className="h-2.5 w-[3px] rounded-full" style={{ background: BRANDS[b].color }} /> {BRANDS[b].label}
              </span>
            ))}
            <span>· {FORMATS[c.format]}</span>
            <ValidationBadge value={c.validation} />
          </Head>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 scroll-thin md:px-7">
            {c.techValidation === 'requise' && <ExpertNote />}
            <div className="flex flex-wrap gap-1.5">
              {c.platforms.map((p) => (
                <PlatformChip key={p} id={p} />
              ))}
              {c.pillar && <PillarChip id={c.pillar} full />}
              {c.objective && <span className="text-[12px] text-ink-3">· {OBJECTIVES[c.objective]}</span>}
            </div>
            {c.hook && c.hook !== c.subject && <Block label="Sujet">{c.subject}</Block>}
            {c.angle && <Block label="Angle">{c.angle}</Block>}
            {c.outline && (
              <Block label="Déroulé">
                <div className="whitespace-pre-line">{c.outline}</div>
              </Block>
            )}
            {c.infographic && (
              <Block label="Structure de l’infographie">
                <InfographicPreview m={c.infographic} className="max-w-[320px]" />
              </Block>
            )}
            {c.slides && c.slides.length > 0 && (
              <Block label={`Carrousel — ${c.slides.length} slides`}>
                <SlidesStrip slides={c.slides} />
              </Block>
            )}
            {c.screens && c.screens.length > 0 && (
              <Block label={`Séquence Stories — ${c.screens.length} écrans`}>
                <StoryStrip screens={c.screens} />
              </Block>
            )}
            {c.scenes && c.scenes.length > 0 && (
              <Block label="Storyboard">
                <ScenesList scenes={c.scenes} />
              </Block>
            )}
            {c.cta && <Block label="CTA">{c.cta}</Block>}
            {CREATIVE_FIELDS.some((f) => c.creative[f.key]) && (
              <Block label={c.creativeIsProposal ? 'Direction artistique (proposition)' : 'Direction artistique'}>
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {CREATIVE_FIELDS.filter((f) => c.creative[f.key]).map((f) => (
                    <div key={f.key}>
                      <dt className="text-[11.5px] text-ink-3">{f.label}</dt>
                      <dd className="text-[13px]">{c.creative[f.key]}</dd>
                    </div>
                  ))}
                </dl>
              </Block>
            )}
            <Refs ids={c.imageIds} />
            <ProblemsList ids={c.problemIds} />
            <RelatedIdeas ids={c.relatedIds} />
            {c.notes && <Block label="Notes">{c.notes}</Block>}
            <div className="text-[11.5px] text-ink-3">Source : {c.source}</div>
          </div>
        </>
      )}
    </Sheet>
  )
}

function ProblemsList({ ids }: { ids: string[] }) {
  const { open } = useDetail()
  if (!ids.length) return null
  return (
    <Block label="Problématiques prospects">
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const p = getProblem(id)
          return (
            <button key={id} type="button" onClick={() => open('p', id)} className="rounded-md border border-line bg-surface px-2 py-1 text-left text-[12.5px] hover:border-line-strong">
              <span className="font-mono text-[11px] text-ink-3">{id}</span> {p?.title}
            </button>
          )
        })}
      </div>
    </Block>
  )
}

/* ---------------- Problématique ---------------- */
export function ProblemSheet() {
  const { problemId, close, open } = useDetail()
  const p = useProblem(problemId)
  const contents = useContents()
  const ideas = contents.filter((c) => problemId && c.problemIds.includes(problemId))
  const lfs = longforms.filter((l) => problemId && l.problemIds.includes(problemId))
  return (
    <Sheet open={!!problemId} onClose={close} label="Problématique" width="max-w-[860px]">
      {p && (
        <>
          <Head id={p.id} title={p.title} onClose={close}>
            <span>Pilier {p.pillar} · {PILLARS[p.pillar].label}</span>
            <ValidationBadge value={p.validation} />
          </Head>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 scroll-thin md:px-7">
            <Block label="Situation concrète">{p.situation}</Block>
            <Block label="Angle pédagogique">{p.pedagogicalAngle}</Block>
            {p.commercialAngle && p.commercialAngle !== 'À RENSEIGNER' && <Block label="Angle commercial">{p.commercialAngle}</Block>}
            {lfs.length > 0 && (
              <Block label="Long formats YouTube">
                <div className="space-y-1.5">
                  {lfs.map((l) => (
                    <button key={l.id} type="button" onClick={() => open('l', l.id)} className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left hover:border-line-strong">
                      <span className="w-[46px] font-mono text-[11px] text-ink-3">{l.id}</span>
                      <span className="flex-1 text-[13px]">{l.title}</span>
                      <span className="text-[11px] text-ink-3">{setups.find((s) => s.id === l.setup)?.short}</span>
                    </button>
                  ))}
                </div>
              </Block>
            )}
            <RelatedIdeas ids={ideas.map((c) => c.id)} />
            <Refs ids={p.imageIds} />
            {p.notes && <Block label="Notes">{p.notes}</Block>}
            <div className="text-[11.5px] text-ink-3">Source : {p.source}</div>
          </div>
        </>
      )}
    </Sheet>
  )
}

/* ---------------- Long format ---------------- */
export function LongFormSheet() {
  const { longformId, close } = useDetail()
  const l = longforms.find((x) => x.id === longformId)
  const s = l && setups.find((x) => x.id === l.setup)
  return (
    <Sheet open={!!longformId} onClose={close} label="Idée de long format" width="max-w-[900px]">
      {l && s && (
        <>
          <Head id={l.id} title={l.title} onClose={close}>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-[3px] rounded-full" style={{ background: BRANDS[s.brand].color }} /> Univers {s.brand === 'TZ' ? 'Tiziana' : 'Fynovates'}
            </span>
            <span>· {s.name} · {s.duration}</span>
            <ValidationBadge value="IDÉE À VALIDER" />
          </Head>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 scroll-thin md:px-7">
            {l.expert && <ExpertNote />}
            <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
              <SetupSchema id={s.id} />
              <div className="space-y-3">
                <Block label="Format">{s.description}</Block>
                <Block label="À l’écran">{l.onScreen}</Block>
                <div className="text-[12px] text-ink-3">Caméra : {s.camera}</div>
              </div>
            </div>
            <Block label="Accroche — 15 premières secondes">« {l.hook.replace(/^«\s*|\s*»$/g, '')} »</Block>
            <Block label="Déroulé en chapitres">
              <ol className="space-y-1.5">
                {l.chapters.map((ch, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-5 shrink-0 tabular text-ink-3">{i + 1}</span>
                    {ch}
                  </li>
                ))}
              </ol>
            </Block>
            <Block label="Déclinaisons courtes">
              <ul className="space-y-1">
                {l.shorts.map((x, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink-3" />
                    {x}
                  </li>
                ))}
              </ul>
            </Block>
            <Block label="CTA">{l.cta}</Block>
            <Refs ids={l.support} />
            <ProblemsList ids={l.problemIds} />
            <RelatedIdeas ids={l.basedOn} />
            <Block label="Conseils de tournage">
              <ul className="space-y-1 text-[13px]">
                {s.tips.map((t, i) => (
                  <li key={i}>— {t}</li>
                ))}
              </ul>
            </Block>
          </div>
        </>
      )}
    </Sheet>
  )
}

/* ---------------- Image ---------------- */
export function ImageSheet() {
  const { imageId, close, open } = useDetail()
  const img = useImage(imageId)
  const contents = useContents()
  const used = contents.filter((c) => imageId && c.imageIds.includes(imageId))
  return (
    <Sheet open={!!imageId} onClose={close} label="Visuel" width="max-w-[1100px]">
      {img && (
        <>
          <Head id={img.id} title={img.description} onClose={close}>
            <span>{IMAGE_TYPES[img.type]}</span>
            {img.brand && <span>· {BRANDS[img.brand].label}</span>}
            {img.platform && <span>· {PLATFORMS[img.platform].label}</span>}
          </Head>
          <div className="grid min-h-0 flex-1 overflow-y-auto scroll-thin md:grid-cols-[1.5fr_1fr]">
            <div className="bg-surface-2 p-5">
              <a href={img.src} target="_blank" rel="noreferrer" className="block">
                <Thumb img={img} fit="contain" className="max-h-[76vh] w-full" />
              </a>
              <a href={img.src} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink">
                <ExternalLink size={12} /> Ouvrir en taille réelle
              </a>
            </div>
            <div className="space-y-5 p-5">
              {img.warnings.map((w, i) => (
                <div key={i} className="flex gap-2 text-[12.5px]">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
                  {w}
                </div>
              ))}
              {img.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {img.tags.map((t) => (
                    <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-ink-2">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-[11.5px] text-ink-3">Fichier d’origine : {img.originalName}</div>
              {used.length > 0 && (
                <Block label="Utilisé dans">
                  <div className="space-y-1">
                    {used.map((c) => (
                      <button key={c.id} type="button" onClick={() => open('c', c.id)} className="block w-full truncate text-left text-[12.5px] hover:underline">
                        <span className="font-mono text-ink-3">{c.id}</span> {c.subject}
                      </button>
                    ))}
                  </div>
                </Block>
              )}
              <Link to="/gallery" onClick={close} className="inline-block text-[12px] text-ink-3 hover:text-ink">
                ← Galerie visuelle
              </Link>
            </div>
          </div>
        </>
      )}
    </Sheet>
  )
}
