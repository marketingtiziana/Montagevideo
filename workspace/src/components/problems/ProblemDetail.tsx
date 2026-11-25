import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { createContent, deleteProblem, updateProblem, type ContentKind } from '../../lib/actions'
import { BRANDS, FORMAT_IDS, FORMATS, PILLAR_IDS, PILLARS, PLATFORM_IDS, PLATFORMS, VALIDATIONS } from '../../lib/constants'
import { useDetail } from '../../lib/detail'
import { useById, useContents, useImages, useProblem } from '../../lib/hooks'
import type { BrandId, PillarId, Problem, Validation } from '../../lib/types'
import { ImagePicker } from '../images/ImagePicker'
import { Thumb } from '../images/Thumb'
import {
  Button,
  Confirm,
  Field,
  IconButton,
  PlatformChip,
  Select,
  Sheet,
  StageBadge,
  TextArea,
  TextInput,
  ToggleChips,
  useToast,
  ValidationBadge,
} from '../ui'

export function ProblemDetail() {
  const { problemId, close, open } = useDetail()
  const p = useProblem(problemId)
  const contents = useContents()
  const images = useImages()
  const imgById = useById(images)
  const [confirm, setConfirm] = useState(false)
  const [pickImg, setPickImg] = useState(false)
  const toast = useToast()

  const linked = (contents ?? []).filter((c) => problemId && c.problemIds.includes(problemId))
  const u = (patch: Partial<Problem>) => p && updateProblem(p.id, patch)

  const newContent = async (kind: ContentKind) => {
    if (!p) return
    const id = await createContent(kind, {
      subject: p.title,
      problemIds: [p.id],
      pillar: p.pillar,
      platforms: p.platforms.filter((pl) => kind === 'DB' || PLATFORMS[pl].brand === kind),
      format: p.formats[0] ?? 'reel',
      source: `Créé depuis ${p.id}`,
    })
    toast(`${id} créé et relié à ${p.id}`)
    open('c', id)
  }

  return (
    <Sheet open={!!problemId} onClose={close} label="Fiche problématique" width="max-w-[920px]">
      {!p ? (
        <div className="p-8 text-[13px] text-ink-3">{problemId ? `Problématique ${problemId} introuvable.` : ''}</div>
      ) : (
        <>
          <div className="border-b border-line bg-surface px-5 py-4 md:px-7">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] text-ink-3">{p.id}</span>
                  <span className="text-[11.5px] text-ink-2">Pilier {p.pillar} · {PILLARS[p.pillar].label}</span>
                  <ValidationBadge value={p.validation} />
                </div>
                <TextInput value={p.title} onCommit={(v) => u({ title: v })} className="!border-transparent !bg-transparent !px-0 text-[20px] font-semibold hover:!border-line focus:!px-2" />
              </div>
              <IconButton label="Supprimer" onClick={() => setConfirm(true)}>
                <Trash2 size={15} />
              </IconButton>
              <IconButton label="Fermer" onClick={close}>
                <X size={16} />
              </IconButton>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 scroll-thin md:px-7">
            <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
              <div className="space-y-4">
                <Field label="Situation concrète">
                  <TextArea value={p.situation} onCommit={(v) => u({ situation: v })} />
                </Field>
                <Field label="Angle pédagogique">
                  <TextArea value={p.pedagogicalAngle} onCommit={(v) => u({ pedagogicalAngle: v })} />
                </Field>
                <Field label="Angle commercial éventuel">
                  <TextArea rows={2} value={p.commercialAngle} onCommit={(v) => u({ commercialAngle: v })} />
                </Field>
                <Field label="Notes">
                  <TextArea rows={2} value={p.notes} onCommit={(v) => u({ notes: v })} placeholder="Notes, points de validation" />
                </Field>
                <div className="text-[11.5px] text-ink-3">Source : {p.source}</div>

                <div className="pt-2">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[13px] font-semibold">Contenus liés ({linked.length})</h3>
                    <div className="flex gap-1.5">
                      {(['FN', 'TZ', 'DB'] as ContentKind[]).map((k) => (
                        <Button key={k} size="sm" icon={<Plus size={12} />} onClick={() => newContent(k)}>
                          {k}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {linked.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-line-strong px-3 py-5 text-center text-[12.5px] text-ink-3">
                      Aucun contenu lié. Crée une déclinaison FN, TZ ou DB depuis cette problématique.
                    </div>
                  ) : (
                    <div className="divide-y divide-line rounded-lg border border-line bg-surface">
                      {linked.map((c) => (
                        <button key={c.id} type="button" onClick={() => open('c', c.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-left hover:bg-surface-2">
                          <span className="w-[54px] font-mono text-[11px] text-ink-3">{c.id}</span>
                          <span className="min-w-0 flex-1 truncate text-[13px]">{c.hook || c.subject}</span>
                          <span className="flex gap-1">
                            {c.platforms.slice(0, 3).map((pl) => (
                              <PlatformChip key={pl} id={pl} compact />
                            ))}
                          </span>
                          <StageBadge id={c.status} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3.5">
                <Field label="Pilier">
                  <Select<PillarId> value={p.pillar} onChange={(v) => v && u({ pillar: v })} options={PILLAR_IDS.map((x) => ({ value: x, label: `${x} — ${PILLARS[x].short}` }))} />
                </Field>
                <Field label="Statut">
                  <Select<Validation> value={p.validation} onChange={(v) => v && u({ validation: v })} options={VALIDATIONS.map((v) => ({ value: v, label: v }))} />
                </Field>
                <Field label="Marque">
                  <ToggleChips<BrandId>
                    value={p.brands}
                    onChange={(v) => u({ brands: v })}
                    options={(['FN', 'TZ'] as BrandId[]).map((b) => ({ value: b, label: BRANDS[b].label, color: BRANDS[b].color }))}
                  />
                </Field>
                <Field label="Plateformes">
                  <ToggleChips
                    value={p.platforms}
                    onChange={(v) => u({ platforms: v })}
                    options={PLATFORM_IDS.map((x) => ({ value: x, label: PLATFORMS[x].label, color: PLATFORMS[x].color }))}
                  />
                </Field>
                <Field label="Formats">
                  <ToggleChips value={p.formats} onChange={(v) => u({ formats: v })} options={FORMAT_IDS.map((f) => ({ value: f, label: FORMATS[f] }))} />
                </Field>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11.5px] font-medium text-ink-2">Références visuelles</span>
                    <IconButton label="Associer des images" onClick={() => setPickImg(true)}>
                      <ImagePlus size={14} />
                    </IconButton>
                  </div>
                  {p.imageIds.length === 0 ? (
                    <div className="text-[12px] text-ink-3">Aucune.</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {p.imageIds.map((id) => (
                        <button key={id} type="button" onClick={() => open('i', id)} className="overflow-hidden rounded-md border border-line" title={id}>
                          <Thumb img={imgById.get(id)} className="aspect-square w-full object-top" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <ImagePicker open={pickImg} onClose={() => setPickImg(false)} selected={p.imageIds} onChange={(ids) => u({ imageIds: ids })} />
          <Confirm
            open={confirm}
            onClose={() => setConfirm(false)}
            title={`Supprimer ${p.id} ?`}
            message={`La problématique sera déliée de ${linked.length} contenu(s). Les contenus ne sont pas supprimés.`}
            onConfirm={async () => {
              await deleteProblem(p.id)
              toast(`${p.id} supprimée`)
              close()
            }}
          />
        </>
      )}
    </Sheet>
  )
}
