import { useRef, useState } from 'react'
import { createContent, createProblem, importImages, type ContentKind } from '../lib/actions'
import { FORMAT_IDS, FORMATS, PILLAR_IDS, PILLARS, PLATFORM_IDS, PLATFORMS } from '../lib/constants'
import { useDetail } from '../lib/detail'
import type { Format, PillarId, PlatformId } from '../lib/types'
import { Button, Dialog, Field, Select, Tabs, ToggleChips, useToast } from './ui'

export function QuickCreate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'content' | 'problem' | 'image'>('content')
  const [kind, setKind] = useState<ContentKind>('FN')
  const [subject, setSubject] = useState('')
  const [format, setFormat] = useState<Format>('reel')
  const [platforms, setPlatforms] = useState<PlatformId[]>([])
  const [pillar, setPillar] = useState<PillarId>('A')
  const fileRef = useRef<HTMLInputElement>(null)
  const { open: openDetail } = useDetail()
  const toast = useToast()

  const reset = () => {
    setSubject('')
    setPlatforms([])
  }

  const submit = async () => {
    try {
      if (tab === 'content') {
        const id = await createContent(kind, { subject: subject.trim() || 'Nouveau contenu', format, platforms, pillar })
        toast(`${id} créé`)
        openDetail('c', id)
      } else if (tab === 'problem') {
        const id = await createProblem(pillar, { title: subject.trim() || 'Nouvelle problématique' })
        toast(`${id} créée`)
        openDetail('p', id)
      }
      reset()
      onClose()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Création impossible', 'error')
    }
  }

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const { added, rejected } = await importImages([...files])
    if (added.length) toast(`${added.length} image(s) importée(s) dans « Visuels à classer »`)
    rejected.forEach((r) => toast(r, 'error'))
    if (added.length === 1) openDetail('i', added[0])
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Créer"
      footer={
        tab !== 'image' ? (
          <>
            <Button onClick={onClose}>Annuler</Button>
            <Button variant="primary" onClick={submit}>
              Créer et ouvrir
            </Button>
          </>
        ) : undefined
      }
    >
      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'content', label: 'Contenu' },
          { value: 'problem', label: 'Problématique' },
          { value: 'image', label: 'Images' },
        ]}
      />
      {tab === 'content' && (
        <div className="space-y-3.5">
          <Field label="Type d’identifiant">
            <ToggleChips
              value={[kind]}
              onChange={(v) => v.length && setKind(v[v.length - 1] as ContentKind)}
              options={[
                { value: 'FN', label: 'FN — Fynovates', color: 'var(--c-fn)' },
                { value: 'TZ', label: 'TZ — Tiziana', color: 'var(--c-tz)' },
                { value: 'DB', label: 'DB — Déclinaison double' },
              ]}
            />
          </Field>
          <Field label="Sujet">
            <input
              className="input"
              autoFocus
              value={subject}
              placeholder="Ex. Société étrangère et TVA française"
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Format">
              <Select value={format} onChange={(v) => v && setFormat(v)} options={FORMAT_IDS.map((f) => ({ value: f, label: FORMATS[f] }))} />
            </Field>
            <Field label="Pilier">
              <Select value={pillar} onChange={(v) => v && setPillar(v)} options={PILLAR_IDS.map((p) => ({ value: p, label: `${p} — ${PILLARS[p].short}` }))} />
            </Field>
          </div>
          <Field label="Plateformes">
            <ToggleChips
              value={platforms}
              onChange={setPlatforms}
              options={PLATFORM_IDS.filter((p) => kind === 'DB' || PLATFORMS[p].brand === kind || p === 'yt-fn').map((p) => ({
                value: p,
                label: PLATFORMS[p].label,
                color: PLATFORMS[p].color,
              }))}
            />
          </Field>
        </div>
      )}
      {tab === 'problem' && (
        <div className="space-y-3.5">
          <Field label="Pilier">
            <Select value={pillar} onChange={(v) => v && setPillar(v)} options={PILLAR_IDS.map((p) => ({ value: p, label: `${p} — ${PILLARS[p].label}` }))} />
          </Field>
          <Field label="Problématique">
            <input
              className="input"
              autoFocus
              value={subject}
              placeholder="Ex. Banque qui bloque les virements"
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </Field>
        </div>
      )}
      {tab === 'image' && (
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              onFiles(e.dataTransfer.files)
            }}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-10 text-center hover:bg-surface-2"
          >
            <span className="text-[13.5px] font-medium">Déposer des images ou cliquer pour choisir</span>
            <span className="mt-1 text-[12px] text-ink-3">
              JPG, PNG, WebP — 25 Mo max. Chaque image reçoit un identifiant IMG-xxx et arrive dans « Visuels à classer ».
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        </div>
      )}
    </Dialog>
  )
}
