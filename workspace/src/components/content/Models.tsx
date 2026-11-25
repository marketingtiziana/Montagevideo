import clsx from 'clsx'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { newKey, updateContent } from '../../lib/actions'
import { useById, useImages } from '../../lib/hooks'
import type { Content, InfoBlock, InfographicModel, Scene, Slide, StoryScreen } from '../../lib/types'
import { ImagePicker } from '../images/ImagePicker'
import { Placeholder, Thumb } from '../images/Thumb'
import { Button, EmptyState, Field, IconButton, Select, TextArea, TextInput } from '../ui'

function move<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d
  if (j < 0 || j >= arr.length) return arr
  const out = [...arr]
  ;[out[i], out[j]] = [out[j], out[i]]
  return out
}

function ImageSlot({
  imageId,
  onChange,
  className,
  label,
}: {
  imageId: string | null
  onChange: (id: string | null) => void
  className?: string
  label?: string
}) {
  const images = useImages()
  const byId = useById(images)
  const [open, setOpen] = useState(false)
  const img = imageId ? byId.get(imageId) : null
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={clsx('group relative block overflow-hidden rounded-md border border-line', className)}>
        {img ? <Thumb img={img} className="h-full w-full" /> : <Placeholder className="h-full w-full" label={label ?? 'RÉFÉRENCE VISUELLE'} />}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/70 py-1 text-[10.5px] text-bg opacity-0 transition-opacity group-hover:opacity-100">
          <ImagePlus size={11} /> {img ? img.id : 'Associer'}
        </span>
      </button>
      <ImagePicker
        open={open}
        onClose={() => setOpen(false)}
        single
        selected={imageId ? [imageId] : []}
        onChange={(ids) => onChange(ids[0] ?? null)}
        title="Référence visuelle"
      />
    </>
  )
}

/* ============================================================ MODÈLE A — INFOGRAPHIE */

export function InfographicEditor({ c }: { c: Content }) {
  const m = c.infographic
  if (!m)
    return (
      <EmptyState
        title="Aucune structure d’infographie"
        description="Crée une proposition de structure : titre, 3 à 5 blocs d’information, hiérarchie et composition."
        action={
          <Button
            variant="primary"
            onClick={() =>
              updateContent(c.id, {
                infographic: {
                  title: c.hook || c.subject,
                  blocks: [1, 2, 3].map((n) => ({ id: newKey(), title: `Bloc ${n}`, body: '', level: 2 as const })),
                  dataHierarchy: '',
                  composition: '',
                  imageId: null,
                },
              })
            }
          >
            Créer la structure
          </Button>
        }
      />
    )
  const set = (patch: Partial<InfographicModel>) => updateContent(c.id, { infographic: { ...m, ...patch } })
  const setBlock = (i: number, patch: Partial<InfoBlock>) => set({ blocks: m.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)) })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <Field label="Titre de l’infographie">
          <TextInput value={m.title} onCommit={(v) => set({ title: v })} />
        </Field>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11.5px] font-medium text-ink-2">Blocs d’information ({m.blocks.length})</span>
            <Button size="sm" icon={<Plus size={13} />} onClick={() => set({ blocks: [...m.blocks, { id: newKey(), title: 'Nouveau bloc', body: '', level: 2 }] })}>
              Bloc
            </Button>
          </div>
          <div className="space-y-2">
            {m.blocks.map((b, i) => (
              <div key={b.id} className="rounded-lg border border-line bg-surface p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="tabular w-5 text-[11px] text-ink-3">{i + 1}</span>
                  <TextInput value={b.title} onCommit={(v) => setBlock(i, { title: v })} className="flex-1 font-medium" />
                  <Select
                    className="w-[132px]"
                    value={String(b.level) as '1' | '2' | '3'}
                    onChange={(v) => v && setBlock(i, { level: Number(v) as 1 | 2 | 3 })}
                    options={[
                      { value: '1', label: 'Niveau 1 · fort' },
                      { value: '2', label: 'Niveau 2' },
                      { value: '3', label: 'Niveau 3 · note' },
                    ]}
                  />
                  <IconButton label="Monter" onClick={() => set({ blocks: move(m.blocks, i, -1) })}>
                    <ArrowUp size={13} />
                  </IconButton>
                  <IconButton label="Descendre" onClick={() => set({ blocks: move(m.blocks, i, 1) })}>
                    <ArrowDown size={13} />
                  </IconButton>
                  <IconButton label="Supprimer le bloc" onClick={() => set({ blocks: m.blocks.filter((_, j) => j !== i) })}>
                    <Trash2 size={13} />
                  </IconButton>
                </div>
                <TextArea rows={2} value={b.body} onCommit={(v) => setBlock(i, { body: v })} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Hiérarchie des données">
            <TextArea rows={2} value={m.dataHierarchy} onCommit={(v) => set({ dataHierarchy: v })} />
          </Field>
          <Field label="Proposition de composition">
            <TextArea rows={2} value={m.composition} onCommit={(v) => set({ composition: v })} />
          </Field>
        </div>
      </div>
      <div>
        <div className="eyebrow mb-2">Aperçu filaire · 4:5</div>
        <div className="aspect-[4/5] overflow-hidden rounded-lg border border-line bg-white p-4 text-[#17171a] shadow-[var(--shadow)]">
          <div className="mb-2 flex justify-between text-[6.5px] tracking-[0.2em] text-[#85858c]">
            <span className="font-semibold text-[#17171a]">{c.brands.includes('TZ') && !c.brands.includes('FN') ? 'TIZIANA' : 'FYNOVATES'}</span>
            <span>INFOGRAPHIE</span>
          </div>
          <div className="mb-3 text-[11.5px] font-semibold leading-tight">{m.title}</div>
          <div className="space-y-1.5">
            {m.blocks.map((b, i) => (
              <div
                key={b.id}
                className={clsx(
                  'rounded-[3px] px-2 py-1.5',
                  b.level === 1 ? 'bg-[#141a33] text-white' : b.level === 2 ? 'border border-[#e4e2dc]' : 'bg-[#f0efeb] text-[#47474d]',
                )}
              >
                <div className="text-[7.5px] font-semibold leading-tight">{b.title || `Bloc ${i + 1}`}</div>
                {b.body && <div className="mt-0.5 line-clamp-2 text-[6.5px] leading-snug opacity-80">{b.body}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <div className="eyebrow mb-1.5">Emplacement référence visuelle</div>
          <ImageSlot imageId={m.imageId} onChange={(id) => set({ imageId: id })} className="aspect-[4/3] w-full" />
        </div>
      </div>
    </div>
  )
}

/* ============================================================ MODÈLE B — CARROUSEL */

export function CarouselEditor({ c }: { c: Content }) {
  const slides = c.slides ?? []
  const [sel, setSel] = useState(0)
  const set = (s: Slide[]) => updateContent(c.id, { slides: s })
  const blank = (n: number): Slide => ({ id: newKey(), title: `Slide ${n}`, message: '', body: '', role: '', composition: '', imageId: null })
  if (!slides.length)
    return (
      <EmptyState
        title="Aucune slide"
        description="Construis le carrousel slide par slide : titre, message, contenu, fonction narrative, composition, référence."
        action={
          <Button variant="primary" onClick={() => set([1, 2, 3, 4, 5].map(blank))}>
            Créer 5 slides
          </Button>
        }
      />
    )
  const i = Math.min(sel, slides.length - 1)
  const s = slides[i]
  const upd = (patch: Partial<Slide>) => set(slides.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const photoOnly = c.format === 'carrousel-photo'

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-3 scroll-thin">
        {slides.map((x, j) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setSel(j)}
            className={clsx(
              'flex w-[132px] shrink-0 flex-col overflow-hidden rounded-lg border bg-surface text-left transition-shadow',
              j === i ? 'border-ink shadow-[var(--shadow-lg)]' : 'border-line hover:border-line-strong',
            )}
          >
            <div className="relative aspect-[4/5] w-full bg-surface-2 p-2">
              {x.imageId ? (
                <SlideImage id={x.imageId} />
              ) : (
                <div className={clsx('flex h-full flex-col justify-end rounded-sm p-1.5', j === 0 || j === slides.length - 1 ? 'bg-[#141a33] text-white' : 'bg-white text-[#17171a]')}>
                  {!photoOnly && <div className="line-clamp-4 text-[8.5px] font-semibold leading-tight">{x.title}</div>}
                </div>
              )}
              <span className="absolute left-1.5 top-1.5 rounded bg-surface/90 px-1 text-[10px] tabular text-ink-2">{j + 1}</span>
            </div>
            <div className="truncate px-2 py-1.5 text-[11px] text-ink-3">{x.role || 'Fonction à définir'}</div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            set([...slides, blank(slides.length + 1)])
            setSel(slides.length)
          }}
          className="flex aspect-[4/5] w-[132px] shrink-0 items-center justify-center rounded-lg border border-dashed border-line-strong text-[12px] text-ink-3 hover:bg-surface-2"
        >
          <Plus size={14} className="mr-1" /> Slide
        </button>
      </div>
      <div className="mt-2 grid gap-5 rounded-xl border border-line bg-surface p-4 md:grid-cols-[1fr_200px]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="eyebrow">Slide {i + 1} / {slides.length}</span>
            <div className="ml-auto flex">
              <IconButton label="Déplacer à gauche" onClick={() => { set(move(slides, i, -1)); setSel(Math.max(0, i - 1)) }}>
                <ArrowLeft size={13} />
              </IconButton>
              <IconButton label="Déplacer à droite" onClick={() => { set(move(slides, i, 1)); setSel(Math.min(slides.length - 1, i + 1)) }}>
                <ArrowRight size={13} />
              </IconButton>
              <IconButton label="Supprimer la slide" onClick={() => { set(slides.filter((_, j) => j !== i)); setSel(Math.max(0, i - 1)) }}>
                <Trash2 size={13} />
              </IconButton>
            </div>
          </div>
          {photoOnly && (
            <div className="rounded-md bg-surface-2 px-3 py-2 text-[12px] text-ink-2">
              Carrousel photographique : aucun texte incrusté. Les champs texte servent de brief interne uniquement.
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titre">
              <TextInput value={s.title} onCommit={(v) => upd({ title: v })} />
            </Field>
            <Field label="Fonction narrative">
              <TextInput value={s.role} onCommit={(v) => upd({ role: v })} placeholder="Accroche, problème, explication, preuve, CTA…" />
            </Field>
          </div>
          <Field label="Message">
            <TextInput value={s.message} onCommit={(v) => upd({ message: v })} />
          </Field>
          <Field label="Contenu">
            <TextArea value={s.body} onCommit={(v) => upd({ body: v })} />
          </Field>
          <Field label="Composition proposée">
            <TextInput value={s.composition} onCommit={(v) => upd({ composition: v })} />
          </Field>
        </div>
        <div>
          <div className="eyebrow mb-1.5">Référence visuelle</div>
          <ImageSlot imageId={s.imageId} onChange={(id) => upd({ imageId: id })} className="aspect-[4/5] w-full" />
        </div>
      </div>
    </div>
  )
}

function SlideImage({ id }: { id: string }) {
  const images = useImages()
  const img = useById(images).get(id)
  return <Thumb img={img} className="h-full w-full rounded-sm" />
}

/* ============================================================ MODÈLE C — STORYBOARD REEL */

export function StoryboardEditor({ c }: { c: Content }) {
  const scenes = c.scenes ?? []
  const set = (s: Scene[]) => updateContent(c.id, { scenes: s })
  const blank = (): Scene => ({ id: newKey(), duration: '', image: '', dialogue: '', camera: '', voiceover: '', transition: '', goal: '', imageId: null })
  if (!scenes.length)
    return (
      <EmptyState
        title="Aucune scène"
        description="Découpe la vidéo en scènes : durée, image, texte ou dialogue, mouvement de caméra, voix off, transition, objectif narratif."
        action={
          <Button variant="primary" onClick={() => set([blank(), blank(), blank()])}>
            Créer 3 scènes
          </Button>
        }
      />
    )
  const upd = (i: number, patch: Partial<Scene>) => set(scenes.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  return (
    <div className="relative">
      <div className="absolute bottom-4 left-[15px] top-4 w-px bg-line-strong" aria-hidden />
      <ol className="space-y-3">
        {scenes.map((s, i) => (
          <li key={s.id} className="relative flex gap-4">
            <span className="relative z-10 mt-3 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-[11px] font-semibold tabular">
              {i + 1}
            </span>
            <div className="grid min-w-0 flex-1 gap-3 rounded-xl border border-line bg-surface p-3.5 md:grid-cols-[96px_1fr]">
              <ImageSlot imageId={s.imageId} onChange={(id) => upd(i, { imageId: id })} className="aspect-[9/16] w-[96px]" label="IMAGE" />
              <div className="min-w-0 space-y-2.5">
                <div className="flex items-center gap-2">
                  <TextInput value={s.duration} onCommit={(v) => upd(i, { duration: v })} placeholder="Durée (ex. 0–3 s)" className="w-[130px]" />
                  <TextInput value={s.goal} onCommit={(v) => upd(i, { goal: v })} placeholder="Objectif narratif" className="flex-1" />
                  <IconButton label="Monter" onClick={() => set(move(scenes, i, -1))}>
                    <ArrowUp size={13} />
                  </IconButton>
                  <IconButton label="Descendre" onClick={() => set(move(scenes, i, 1))}>
                    <ArrowDown size={13} />
                  </IconButton>
                  <IconButton label="Supprimer la scène" onClick={() => set(scenes.filter((_, j) => j !== i))}>
                    <Trash2 size={13} />
                  </IconButton>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Field label="Image">
                    <TextInput value={s.image} onCommit={(v) => upd(i, { image: v })} />
                  </Field>
                  <Field label="Mouvement de caméra">
                    <TextInput value={s.camera} onCommit={(v) => upd(i, { camera: v })} />
                  </Field>
                </div>
                <Field label="Texte ou dialogue">
                  <TextArea rows={2} value={s.dialogue} onCommit={(v) => upd(i, { dialogue: v })} />
                </Field>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Field label="Voix off">
                    <TextInput value={s.voiceover} onCommit={(v) => upd(i, { voiceover: v })} />
                  </Field>
                  <Field label="Transition">
                    <TextInput value={s.transition} onCommit={(v) => upd(i, { transition: v })} />
                  </Field>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <Button className="ml-[47px] mt-3" size="sm" icon={<Plus size={13} />} onClick={() => set([...scenes, blank()])}>
        Ajouter une scène
      </Button>
    </div>
  )
}

/* ============================================================ MODÈLE D — STORY INSTAGRAM */

export function StoryEditor({ c }: { c: Content }) {
  const screens = c.screens ?? []
  const [sel, setSel] = useState(0)
  const set = (s: StoryScreen[]) => updateContent(c.id, { screens: s })
  const blank = (): StoryScreen => ({ id: newKey(), visual: '', text: '', typography: '', textPosition: '', interaction: '', cta: '', imageId: null })
  const isTZ = c.brands.length === 1 && c.brands[0] === 'TZ'
  if (!screens.length)
    return (
      <EmptyState
        title="Aucun écran"
        description="Construis la séquence écran par écran au format 9:16 : visuel, texte, typographie, position, interaction, CTA."
        action={
          <Button variant="primary" onClick={() => set([blank(), blank(), blank()])}>
            Créer 3 écrans
          </Button>
        }
      />
    )
  const i = Math.min(sel, screens.length - 1)
  const s = screens[i]
  const upd = (patch: Partial<StoryScreen>) => set(screens.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  return (
    <div>
      {isTZ && (
        <div className="mb-3 rounded-md bg-surface-2 px-3 py-2 text-[12px] text-ink-2">
          Stories Tiziana : typographies natives Instagram uniquement — sérif noir sur bandeaux blancs, ou sans-sérif noir/blanc sur photographie.
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto pb-3 scroll-thin">
        {screens.map((x, j) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setSel(j)}
            className={clsx(
              'relative aspect-[9/16] w-[112px] shrink-0 overflow-hidden rounded-[12px] border bg-[#141a33] text-left',
              j === i ? 'border-ink ring-2 ring-ink' : 'border-line',
            )}
          >
            {x.imageId && <ScreenImage id={x.imageId} />}
            <div className="absolute inset-x-1.5 top-2 flex gap-0.5">
              {screens.map((_, k) => (
                <span key={k} className={clsx('h-[2px] flex-1 rounded-full', k <= j ? 'bg-white' : 'bg-white/35')} />
              ))}
            </div>
            {!x.imageId && (
              <div className="absolute inset-x-2 top-6 line-clamp-6 text-[8.5px] font-medium leading-snug text-white">{x.text || 'Texte à définir'}</div>
            )}
            {x.interaction && <div className="absolute inset-x-2 bottom-7 rounded bg-white/90 px-1 py-0.5 text-center text-[7.5px] text-[#17171a]">{x.interaction}</div>}
            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/40 px-1 text-[9.5px] tabular text-white">{j + 1}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            set([...screens, blank()])
            setSel(screens.length)
          }}
          className="flex aspect-[9/16] w-[112px] shrink-0 items-center justify-center rounded-[12px] border border-dashed border-line-strong text-[12px] text-ink-3 hover:bg-surface-2"
        >
          <Plus size={14} className="mr-1" /> Écran
        </button>
      </div>
      <div className="mt-2 grid gap-5 rounded-xl border border-line bg-surface p-4 md:grid-cols-[1fr_150px]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="eyebrow">Écran {i + 1} / {screens.length}</span>
            <div className="ml-auto flex">
              <IconButton label="Déplacer à gauche" onClick={() => { set(move(screens, i, -1)); setSel(Math.max(0, i - 1)) }}>
                <ArrowLeft size={13} />
              </IconButton>
              <IconButton label="Déplacer à droite" onClick={() => { set(move(screens, i, 1)); setSel(Math.min(screens.length - 1, i + 1)) }}>
                <ArrowRight size={13} />
              </IconButton>
              <IconButton label="Supprimer l’écran" onClick={() => { set(screens.filter((_, j) => j !== i)); setSel(Math.max(0, i - 1)) }}>
                <Trash2 size={13} />
              </IconButton>
            </div>
          </div>
          <Field label="Visuel">
            <TextInput value={s.visual} onCommit={(v) => upd({ visual: v })} />
          </Field>
          <Field label="Texte">
            <TextArea value={s.text} onCommit={(v) => upd({ text: v })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Typographie">
              <TextInput value={s.typography} onCommit={(v) => upd({ typography: v })} />
            </Field>
            <Field label="Position du texte">
              <TextInput value={s.textPosition} onCommit={(v) => upd({ textPosition: v })} />
            </Field>
            <Field label="Interaction">
              <TextInput value={s.interaction} onCommit={(v) => upd({ interaction: v })} placeholder="Sondage, quiz, question, lien…" />
            </Field>
            <Field label="CTA">
              <TextInput value={s.cta} onCommit={(v) => upd({ cta: v })} />
            </Field>
          </div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">Visuel 9:16</div>
          <ImageSlot imageId={s.imageId} onChange={(id) => upd({ imageId: id })} className="aspect-[9/16] w-full" />
        </div>
      </div>
    </div>
  )
}

function ScreenImage({ id }: { id: string }) {
  const images = useImages()
  const img = useById(images).get(id)
  return <Thumb img={img} className="absolute inset-0 h-full w-full opacity-80" />
}
