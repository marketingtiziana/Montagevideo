import clsx from 'clsx'
import { AlertTriangle, Copy, ImagePlus, Link2, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteContent, duplicateContent, updateContent } from '../../lib/actions'
import {
  BRANDS,
  CREATIVE_FIELDS,
  FORMAT_IDS,
  FORMATS,
  modelFor,
  OBJECTIVES,
  PILLAR_IDS,
  PILLARS,
  PLATFORM_IDS,
  PLATFORMS,
  STAGES,
  TECH,
  VALIDATIONS,
} from '../../lib/constants'
import { useDetail } from '../../lib/detail'
import { useById, useContent, useContents, useImages, useMatrix, useProblems } from '../../lib/hooks'
import type { BrandId, Content, Objective, PillarId, Stage, TechValidation, Validation } from '../../lib/types'
import { EntityPicker } from '../EntityPicker'
import { ImagePicker } from '../images/ImagePicker'
import { Thumb } from '../images/Thumb'
import {
  Button,
  Confirm,
  Field,
  IconButton,
  PillarChip,
  Select,
  Sheet,
  Tabs,
  TextArea,
  TextInput,
  ToggleChips,
  useToast,
  ValidationBadge,
} from '../ui'
import { CarouselEditor, InfographicEditor, StoryboardEditor, StoryEditor } from './Models'

type Tab = 'fiche' | 'creative' | 'relations'

export function ContentDetail() {
  const { contentId, close, tab: tabParam } = useDetail()
  const c = useContent(contentId)
  const [tab, setTab] = useState<Tab>('fiche')
  useEffect(() => {
    setTab(tabParam === 'creative' || tabParam === 'relations' ? tabParam : 'fiche')
  }, [contentId, tabParam])
  return (
    <Sheet open={!!contentId} onClose={close} label="Fiche contenu" width="max-w-[1040px]">
      {!c ? (
        <div className="p-8 text-[13px] text-ink-3">{contentId ? `Contenu ${contentId} introuvable.` : ''}</div>
      ) : (
        <Body c={c} tab={tab} setTab={setTab} onClose={close} />
      )}
    </Sheet>
  )
}

function Body({ c, tab, setTab, onClose }: { c: Content; tab: Tab; setTab: (t: Tab) => void; onClose: () => void }) {
  const toast = useToast()
  const { open } = useDetail()
  const [confirm, setConfirm] = useState(false)
  const u = (patch: Partial<Content>) => updateContent(c.id, patch).catch((e) => toast(String(e), 'error'))
  const tzOnFeed = c.platforms.includes('ig-tz') && !['reel', 'story', 'photo', 'carrousel-photo', 'face-camera', 'video'].includes(c.format)

  return (
    <>
      <div className="border-b border-line bg-surface px-5 pb-0 pt-4 md:px-7">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] text-ink-3">{c.id}</span>
              {c.brands.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 text-[11.5px] text-ink-2">
                  <span className="h-2.5 w-[3px] rounded-full" style={{ background: BRANDS[b].color }} /> {BRANDS[b].label}
                </span>
              ))}
              <ValidationBadge value={c.validation} />
            </div>
            <TextInput value={c.subject} onCommit={(v) => u({ subject: v })} className="!border-transparent !bg-transparent !px-0 text-[20px] font-semibold tracking-[-0.01em] hover:!border-line focus:!px-2" />
          </div>
          <div className="flex shrink-0 items-center gap-1 pt-1">
            <IconButton
              label="Dupliquer"
              onClick={async () => {
                const id = await duplicateContent(c.id)
                toast(`${id} créé`)
                open('c', id)
              }}
            >
              <Copy size={15} />
            </IconButton>
            <IconButton label="Supprimer" onClick={() => setConfirm(true)}>
              <Trash2 size={15} />
            </IconButton>
            <IconButton label="Fermer" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
        </div>
        <Tabs
          className="mt-3 pb-2"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'fiche', label: 'Fiche' },
            { value: 'creative', label: 'Direction créative' },
            { value: 'relations', label: 'Relations', count: c.relatedIds.length + c.problemIds.length + c.imageIds.length },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 scroll-thin md:px-7">
        {tzOnFeed && (
          <div className="mb-4 flex gap-2 rounded-lg border border-[color-mix(in_srgb,var(--v-expert)_30%,transparent)] bg-[color-mix(in_srgb,var(--v-expert)_6%,transparent)] p-3 text-[12.5px]">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
            <span>
              Règle Instagram Tiziana : le feed accepte uniquement des photographies (aucun texte incrusté, aucune infographie, aucun logo).
              Le format « {FORMATS[c.format]} » n’est pas compatible.
            </span>
          </div>
        )}
        {tab === 'fiche' && <Fiche c={c} u={u} />}
        {tab === 'creative' && <Creative c={c} u={u} />}
        {tab === 'relations' && <Relations c={c} u={u} />}
      </div>
      <Confirm
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Supprimer ${c.id} ?`}
        message="Le contenu sera retiré des contenus associés et de la matrice de déclinaison. Cette action est définitive."
        onConfirm={async () => {
          await deleteContent(c.id)
          toast(`${c.id} supprimé`)
          onClose()
        }}
      />
    </>
  )
}

type U = (patch: Partial<Content>) => void

function Fiche({ c, u }: { c: Content; u: U }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <Field label="Accroche">
          <TextArea rows={2} value={c.hook} onCommit={(v) => u({ hook: v })} className="text-[14.5px]" />
        </Field>
        <Field label="Angle éditorial">
          <TextArea rows={2} value={c.angle} onCommit={(v) => u({ angle: v })} />
        </Field>
        <Field label="Déroulé du contenu">
          <TextArea rows={4} value={c.outline} onCommit={(v) => u({ outline: v })} />
        </Field>
        <Field label="Proposition de script" hint={<span className="text-[10.5px] font-semibold tracking-[0.06em] text-[var(--v-proposal)]">PROPOSITION</span>}>
          <TextArea rows={4} value={c.script} onCommit={(v) => u({ script: v })} />
        </Field>
        <Field label="CTA">
          <TextInput value={c.cta} onCommit={(v) => u({ cta: v })} />
        </Field>
        <Field label="Notes">
          <TextArea rows={3} value={c.notes} onCommit={(v) => u({ notes: v })} placeholder="Notes internes" />
        </Field>
        <div className="text-[11.5px] text-ink-3">
          Source : {c.source || '—'} · Modifié le {new Date(c.updatedAt).toLocaleString('fr-FR')}
        </div>
      </div>
      <div className="space-y-3.5">
        <Field label="Statut de production">
          <Select<Stage> value={c.status} onChange={(v) => v && u({ status: v })} options={STAGES.map((s) => ({ value: s.id, label: s.label }))} />
        </Field>
        <Field label="Statut stratégique">
          <Select<Validation> value={c.validation} onChange={(v) => v && u({ validation: v })} options={VALIDATIONS.map((v) => ({ value: v, label: v }))} />
        </Field>
        <Field label="Validation technique">
          <Select<TechValidation>
            value={c.techValidation}
            onChange={(v) => v && u({ techValidation: v })}
            options={(Object.keys(TECH) as TechValidation[]).map((t) => ({ value: t, label: TECH[t] }))}
          />
        </Field>
        <Field label="Marque">
          <ToggleChips<BrandId>
            value={c.brands}
            onChange={(v) => v.length && u({ brands: v })}
            options={(['FN', 'TZ'] as BrandId[]).map((b) => ({ value: b, label: BRANDS[b].label, color: BRANDS[b].color }))}
          />
        </Field>
        <Field label="Plateformes">
          <ToggleChips
            value={c.platforms}
            onChange={(v) => u({ platforms: v })}
            options={PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label, color: PLATFORMS[p].color }))}
          />
        </Field>
        <Field label="Pilier éditorial">
          <Select<PillarId>
            value={c.pillar}
            allowEmpty
            onChange={(v) => u({ pillar: v })}
            options={PILLAR_IDS.map((p) => ({ value: p, label: `${p} — ${PILLARS[p].short}` }))}
          />
        </Field>
        <Field label="Format">
          <Select value={c.format} onChange={(v) => v && u({ format: v })} options={FORMAT_IDS.map((f) => ({ value: f, label: FORMATS[f] }))} />
        </Field>
        <Field label="Objectif">
          <Select<Objective>
            value={c.objective}
            allowEmpty
            onChange={(v) => u({ objective: v })}
            options={(Object.keys(OBJECTIVES) as Objective[]).map((o) => ({ value: o, label: OBJECTIVES[o] }))}
          />
        </Field>
        <Field label="Responsable">
          <TextInput value={c.owner} onCommit={(v) => u({ owner: v })} />
        </Field>
        <Field label="Date de publication">
          <input type="date" className="input" value={c.publishDate} onChange={(e) => u({ publishDate: e.target.value })} />
        </Field>
      </div>
    </div>
  )
}

function Creative({ c, u }: { c: Content; u: U }) {
  const images = useImages()
  const byId = useById(images)
  const [pick, setPick] = useState(false)
  const { open } = useDetail()
  const model = modelFor(c.format)
  return (
    <div className="space-y-8">
      <div
        className={clsx(
          'flex flex-wrap items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-[12.5px]',
          c.creativeIsProposal ? 'bg-[color-mix(in_srgb,var(--v-proposal)_8%,transparent)] text-ink' : 'bg-[color-mix(in_srgb,var(--v-ok)_8%,transparent)]',
        )}
      >
        <span>
          {c.creativeIsProposal ? (
            <>
              <b className="tracking-[0.04em] text-[var(--v-proposal)]">PROPOSITION CRÉATIVE</b> — non validée, à arbitrer avant production.
            </>
          ) : (
            <>
              <b className="tracking-[0.04em] text-[var(--v-ok)]">DIRECTION CRÉATIVE VALIDÉE</b>
            </>
          )}
        </span>
        <Button size="sm" onClick={() => u({ creativeIsProposal: !c.creativeIsProposal })}>
          {c.creativeIsProposal ? 'Marquer comme validée' : 'Repasser en proposition'}
        </Button>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Références visuelles</h3>
          <Button size="sm" icon={<ImagePlus size={13} />} onClick={() => setPick(true)}>
            Associer
          </Button>
        </div>
        {c.imageIds.length === 0 ? (
          <button
            type="button"
            onClick={() => setPick(true)}
            className="flex w-full items-center justify-center rounded-xl border border-dashed border-line-strong py-8 text-[12.5px] text-ink-3 hover:bg-surface-2"
          >
            Aucune référence — associer une image de la bibliothèque
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {c.imageIds.map((id) => {
              const img = byId.get(id)
              return (
                <button key={id} type="button" onClick={() => open('i', id)} className="overflow-hidden rounded-lg border border-line bg-surface text-left hover:border-line-strong">
                  <Thumb img={img} className="aspect-[4/3] w-full object-top" />
                  <div className="px-2 py-1.5 font-mono text-[10.5px] text-ink-3">{id}</div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-[13px] font-semibold">Creative direction</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {CREATIVE_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <TextArea rows={2} value={c.creative[f.key]} onCommit={(v) => u({ creative: { ...c.creative, [f.key]: v } })} />
            </Field>
          ))}
        </div>
      </section>

      {model && (
        <section>
          <h3 className="mb-1 text-[13px] font-semibold">
            {model === 'infographic' && 'Modèle A — Infographie'}
            {model === 'carousel' && 'Modèle B — Carrousel'}
            {model === 'storyboard' && 'Modèle C — Storyboard'}
            {model === 'story' && 'Modèle D — Story Instagram'}
          </h3>
          <p className="mb-4 text-[12px] text-ink-3">Modèle déterminé par le format « {FORMATS[c.format]} ».</p>
          {model === 'infographic' && <InfographicEditor c={c} />}
          {model === 'carousel' && <CarouselEditor c={c} />}
          {model === 'storyboard' && <StoryboardEditor c={c} />}
          {model === 'story' && <StoryEditor c={c} />}
        </section>
      )}

      <ImagePicker open={pick} onClose={() => setPick(false)} selected={c.imageIds} onChange={(ids) => u({ imageIds: ids })} />
    </div>
  )
}

function Relations({ c, u }: { c: Content; u: U }) {
  const contents = useContents()
  const problems = useProblems()
  const matrix = useMatrix()
  const cById = useById(contents)
  const pById = useById(problems)
  const { open } = useDetail()
  const [pickC, setPickC] = useState(false)
  const [pickP, setPickP] = useState(false)
  const inMatrix = (matrix ?? []).filter((r) => Object.values(r.cells).some((cell) => cell?.contentId === c.id))

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Problématiques prospects</h3>
          <Button size="sm" icon={<Link2 size={13} />} onClick={() => setPickP(true)}>
            Relier
          </Button>
        </div>
        <div className="space-y-2">
          {c.problemIds.length === 0 && <div className="text-[12.5px] text-ink-3">Aucune problématique reliée.</div>}
          {c.problemIds.map((id) => {
            const p = pById.get(id)
            return (
              <div key={id} className="flex items-start gap-2 rounded-lg border border-line bg-surface p-2.5">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open('p', id)}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink-3">{id}</span>
                    {p && <PillarChip id={p.pillar} />}
                  </div>
                  <div className="text-[13px] hover:underline">{p?.title ?? 'Problématique supprimée'}</div>
                </button>
                <IconButton label="Délier" onClick={() => u({ problemIds: c.problemIds.filter((x) => x !== id) })}>
                  <X size={13} />
                </IconButton>
              </div>
            )
          })}
        </div>
      </section>
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Contenus associés</h3>
          <Button size="sm" icon={<Link2 size={13} />} onClick={() => setPickC(true)}>
            Relier
          </Button>
        </div>
        <div className="space-y-2">
          {c.relatedIds.length === 0 && <div className="text-[12.5px] text-ink-3">Aucun contenu associé.</div>}
          {c.relatedIds.map((id) => {
            const r = cById.get(id)
            return (
              <div key={id} className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2.5">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => open('c', id)}>
                  <span className="font-mono text-[11px] text-ink-3">{id}</span>
                  <span className="truncate text-[13px] hover:underline">{r?.subject}</span>
                </button>
                <span className="hidden shrink-0 text-[11px] text-ink-3 sm:inline">{r && FORMATS[r.format]}</span>
                <IconButton label="Délier" onClick={() => u({ relatedIds: c.relatedIds.filter((x) => x !== id) })}>
                  <X size={13} />
                </IconButton>
              </div>
            )
          })}
        </div>
      </section>
      <section className="lg:col-span-2">
        <h3 className="mb-2.5 text-[13px] font-semibold">Présence dans la matrice de déclinaison</h3>
        {inMatrix.length === 0 ? (
          <div className="text-[12.5px] text-ink-3">Ce contenu n’est rattaché à aucune ligne de la matrice.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {inMatrix.map((r) => (
              <span key={r.id} className="rounded-md border border-line bg-surface px-2.5 py-1 text-[12.5px]">
                {r.topic}
              </span>
            ))}
          </div>
        )}
      </section>
      <EntityPicker
        open={pickP}
        onClose={() => setPickP(false)}
        title="Relier des problématiques"
        items={(problems ?? []).map((p) => ({ id: p.id, label: p.title, meta: PILLARS[p.pillar].short }))}
        selected={c.problemIds}
        onChange={(ids) => u({ problemIds: ids, pillar: c.pillar ?? (ids[0] ? pById.get(ids[0])?.pillar ?? null : null) })}
      />
      <EntityPicker
        open={pickC}
        onClose={() => setPickC(false)}
        title="Relier des contenus"
        items={(contents ?? []).filter((x) => x.id !== c.id).map((x) => ({ id: x.id, label: x.subject, meta: FORMATS[x.format] }))}
        selected={c.relatedIds}
        onChange={(ids) => u({ relatedIds: ids })}
      />
    </div>
  )
}
