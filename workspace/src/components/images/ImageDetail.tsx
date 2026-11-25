import { AlertTriangle, Expand, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { deleteImage, setImageLink, updateImage } from '../../lib/actions'
import { BRANDS, FORMATS, IMAGE_TYPES, PLATFORM_IDS, PLATFORMS, VALIDATIONS } from '../../lib/constants'
import { useDetail } from '../../lib/detail'
import { useContents, useImage, useImageUrl, useProblems } from '../../lib/hooks'
import type { BrandId, ImageType, PlatformId, Validation } from '../../lib/types'
import { EntityPicker } from '../EntityPicker'
import { Button, Confirm, Field, IconButton, Select, Sheet, TextArea, TextInput, useToast, ValidationBadge } from '../ui'
import { Thumb } from './Thumb'

export function ImageDetail() {
  const { imageId, close, open } = useDetail()
  const img = useImage(imageId)
  const contents = useContents()
  const problems = useProblems()
  const url = useImageUrl(img)
  const [pick, setPick] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [zoom, setZoom] = useState(false)
  const toast = useToast()

  const linked = (contents ?? []).filter((c) => imageId && c.imageIds.includes(imageId))
  const linkedProblems = (problems ?? []).filter((p) => imageId && p.imageIds.includes(imageId))

  return (
    <Sheet open={!!imageId} onClose={close} label="Fiche image" width="max-w-[980px]">
      {!img ? (
        <div className="p-8 text-[13px] text-ink-3">{imageId ? `Image ${imageId} introuvable.` : ''}</div>
      ) : (
        <>
          <div className="flex items-center gap-3 border-b border-line px-5 py-3">
            <span className="font-mono text-[12px] text-ink-3">{img.id}</span>
            <ValidationBadge value={img.validation} />
            <div className="ml-auto flex items-center gap-1">
              <IconButton label="Agrandir" onClick={() => setZoom(true)}>
                <Expand size={15} />
              </IconButton>
              <IconButton label="Supprimer l’image" onClick={() => setConfirm(true)}>
                <Trash2 size={15} />
              </IconButton>
              <IconButton label="Fermer" onClick={close}>
                <X size={16} />
              </IconButton>
            </div>
          </div>
          <div className="grid min-h-0 flex-1 overflow-y-auto scroll-thin md:grid-cols-[1.25fr_1fr]">
            <div className="border-b border-line bg-surface-2 p-5 md:border-b-0 md:border-r">
              <button type="button" className="block w-full" onClick={() => setZoom(true)} aria-label="Agrandir l’image">
                <Thumb img={img} fit="contain" className="max-h-[72vh] w-full rounded-lg" />
              </button>
              <div className="mt-3 text-[11.5px] text-ink-3">
                {img.originalName} · {img.width} × {img.height}px {img.hasBlob ? '· importée' : '· ressource fournie'}
              </div>
            </div>
            <div className="space-y-4 p-5">
              {img.warnings.length > 0 && (
                <div className="space-y-1.5 rounded-lg border border-[color-mix(in_srgb,var(--v-expert)_30%,transparent)] bg-[color-mix(in_srgb,var(--v-expert)_6%,transparent)] p-3">
                  {img.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 text-[12.5px] text-ink">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[var(--v-expert)]" />
                      <span className="flex-1">{w}</span>
                      <button
                        type="button"
                        className="text-[11px] text-ink-3 hover:text-ink"
                        onClick={() => updateImage(img.id, { warnings: img.warnings.filter((_, j) => j !== i) })}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Field label="Description">
                <TextArea value={img.description} onCommit={(v) => updateImage(img.id, { description: v })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <Select<ImageType>
                    value={img.type}
                    onChange={(v) => v && updateImage(img.id, { type: v })}
                    options={(Object.keys(IMAGE_TYPES) as ImageType[]).map((t) => ({ value: t, label: IMAGE_TYPES[t] }))}
                  />
                </Field>
                <Field label="Statut">
                  <Select<Validation>
                    value={img.validation}
                    onChange={(v) => {
                      if (!v) return
                      if (v === 'PHOTO RÉELLE TIZIANA' && img.brand !== 'TZ')
                        toast('Associe d’abord l’image à la marque Tiziana', 'error')
                      else updateImage(img.id, { validation: v, ...(v === 'PHOTO RÉELLE TIZIANA' ? { type: 'photo-tiziana' as const } : {}) })
                    }}
                    options={VALIDATIONS.filter((v) => v === 'RÉFÉRENCE VISUELLE' || v === 'PHOTO RÉELLE TIZIANA' || v === 'IDÉE À VALIDER').map((v) => ({
                      value: v,
                      label: v,
                    }))}
                  />
                </Field>
                <Field label="Marque">
                  <Select<BrandId>
                    value={img.brand}
                    allowEmpty
                    emptyLabel="À classer"
                    onChange={(v) => updateImage(img.id, { brand: v })}
                    options={(['FN', 'TZ'] as BrandId[]).map((b) => ({ value: b, label: BRANDS[b].label }))}
                  />
                </Field>
                <Field label="Plateforme">
                  <Select<PlatformId>
                    value={img.platform}
                    allowEmpty
                    emptyLabel="À classer"
                    onChange={(v) => updateImage(img.id, { platform: v })}
                    options={PLATFORM_IDS.map((p) => ({ value: p, label: PLATFORMS[p].label }))}
                  />
                </Field>
              </div>
              <Field label="Tags" hint={<span className="text-[11px] text-ink-3">séparés par des virgules</span>}>
                <TextInput
                  value={img.tags.join(', ')}
                  placeholder="Ex. banque, couverture, bleu nuit"
                  onCommit={(v) => updateImage(img.id, { tags: v.split(',').map((t) => t.trim()).filter(Boolean) })}
                />
              </Field>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-ink-2">Contenus associés ({linked.length})</span>
                  <Button size="sm" onClick={() => setPick(true)}>
                    Associer
                  </Button>
                </div>
                {linked.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-line-strong px-3 py-4 text-center text-[12px] text-ink-3">Aucun contenu associé.</div>
                ) : (
                  <div className="divide-y divide-line rounded-lg border border-line bg-surface">
                    {linked.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 px-3 py-2 text-[12.5px]">
                        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left hover:underline" onClick={() => open('c', c.id)}>
                          <span className="font-mono text-[11px] text-ink-3">{c.id}</span>
                          <span className="truncate">{c.subject}</span>
                        </button>
                        <span className="shrink-0 text-[11px] text-ink-3">{FORMATS[c.format]}</span>
                        <IconButton label="Dissocier" onClick={() => setImageLink(img.id, c.id, false)}>
                          <X size={13} />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {linkedProblems.length > 0 && (
                <div>
                  <div className="mb-1.5 text-[11.5px] font-medium text-ink-2">Problématiques associées</div>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedProblems.map((p) => (
                      <button key={p.id} type="button" onClick={() => open('p', p.id)} className="rounded border border-line bg-surface px-2 py-0.5 text-[11.5px] hover:border-line-strong">
                        <span className="font-mono text-ink-3">{p.id}</span> {p.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <EntityPicker
            open={pick}
            onClose={() => setPick(false)}
            title={`Associer ${img.id} à des contenus`}
            items={(contents ?? []).map((c) => ({ id: c.id, label: c.subject, meta: FORMATS[c.format] }))}
            selected={linked.map((c) => c.id)}
            onChange={async (ids) => {
              const before = linked.map((c) => c.id)
              for (const id of ids.filter((x) => !before.includes(x))) await setImageLink(img.id, id, true)
              for (const id of before.filter((x) => !ids.includes(x))) await setImageLink(img.id, id, false)
              toast('Associations mises à jour')
            }}
          />
          <Confirm
            open={confirm}
            onClose={() => setConfirm(false)}
            title={`Supprimer ${img.id} ?`}
            message={`L’image sera retirée de ${linked.length} contenu(s) et de la bibliothèque.`}
            onConfirm={async () => {
              await deleteImage(img.id)
              toast(`${img.id} supprimée`)
              close()
            }}
          />
          {zoom && url && (
            <div className="fade-in fixed inset-0 z-[55] flex items-center justify-center bg-[rgb(10_10_12/0.92)] p-4" onClick={() => setZoom(false)} role="dialog" aria-label="Image agrandie">
              <img src={url} alt={img.description} className="max-h-full max-w-full object-contain" />
              <button type="button" className="absolute right-4 top-4 rounded-md bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Fermer" onClick={() => setZoom(false)}>
                <X size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </Sheet>
  )
}
