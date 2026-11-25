import clsx from 'clsx'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, FileText, History, ImagePlus, Link2, MessageSquare, Paperclip, Pencil, RotateCcw, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { diffLines } from '../../lib/brand/diff'
import type { ContentStatus, DocId } from '../../lib/brand/docs'
import { renderMarkdown, validationItems } from '../../lib/brand/markdown'
import {
  addEvidenceFiles,
  addEvidenceImage,
  addEvidenceLink,
  addNote,
  approvalLabel,
  bdb,
  deleteEvidence,
  deleteNote,
  identity,
  restoreVersion,
  saveSection,
  setApproval,
  setField,
  syncDocs,
  updateEvidence,
  type Approval,
  type EvidenceRow,
  type Role,
  type SectionRow,
} from '../../lib/brand/store'
import { useImages } from '../../lib/hooks'
import { Thumb } from '../images/Thumb'
import { Button, Confirm, Field, IconButton, Select, Sheet, Tabs, TextInput, useToast } from '../ui'

/* ---------------- boot ---------------- */

let syncPromise: Promise<void> | null = null
export function useBrandReady() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    syncPromise ??= syncDocs()
    syncPromise.then(() => setReady(true)).catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])
  return { ready, error }
}

/* ---------------- identity ---------------- */

export function useIdentity() {
  const [role, setRoleState] = useState<Role>(identity.role())
  const [name, setNameState] = useState(identity.name())
  return {
    role,
    name,
    setRole: (r: Role) => {
      identity.setRole(r)
      setRoleState(r)
    },
    setName: (n: string) => {
      identity.setName(n)
      setNameState(n)
    },
    canEdit: role !== 'lecteur',
    canApprove: role === 'valideur',
  }
}

export function IdentityBar({ id }: { id: ReturnType<typeof useIdentity> }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-[12px]">
      <span className="text-ink-3">Vous :</span>
      <TextInput value={id.name} onCommit={id.setName} placeholder="Votre nom" className="!h-7 !w-[150px] !py-0 text-[12px]" />
      <Select<Role>
        className="!h-7 !w-[130px] !py-0 text-[12px]"
        value={id.role}
        onChange={(v) => v && id.setRole(v)}
        options={[
          { value: 'lecteur', label: 'Lecteur' },
          { value: 'editeur', label: 'Éditeur' },
          { value: 'valideur', label: 'Valideur' },
        ]}
      />
      <span className="text-[11px] text-ink-3" title="Rôle enregistré dans ce navigateur. Ce n’est pas un système d’authentification.">rôle local</span>
    </div>
  )
}

/* ---------------- badges ---------------- */

const STATUS_TONE: Record<ContentStatus, string> = {
  CONFIRMÉ: 'var(--v-ok)',
  RECOMMANDATION: 'var(--v-proposal)',
  HYPOTHÈSE: 'var(--v-ref)',
  'À VALIDER': 'var(--v-idea)',
}
export function StatusBadge({ s }: { s: ContentStatus }) {
  const c = STATUS_TONE[s]
  return (
    <span className="inline-flex items-center rounded px-1.5 py-[1px] text-[10px] font-semibold tracking-[0.05em]" style={{ color: c, background: `color-mix(in srgb, ${c} 10%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 25%, transparent)` }}>
      {s}
    </span>
  )
}
const APPROVAL_TONE: Record<Approval, string> = { draft: 'var(--ink-3)', review: 'var(--v-idea)', approved: 'var(--v-ok)' }
export function ApprovalBadge({ a }: { a: Approval }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: APPROVAL_TONE[a] }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: APPROVAL_TONE[a] }} />
      {approvalLabel(a)}
    </span>
  )
}

export function Markdown({ md, className }: { md: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(md), [md])
  return <div className={clsx('prose-brand', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

/* ---------------- section card ---------------- */

export function SectionCard({
  s,
  id,
  onOpenPanel,
}: {
  s: SectionRow
  id: ReturnType<typeof useIdentity>
  onOpenPanel: (key: string, tab: PanelTab) => void
}) {
  const [editing, setEditing] = useState(false)
  const toast = useToast()
  const counts = useLiveQuery(
    async () => ({
      notes: await bdb.notes.where('key').equals(s.key).count(),
      evidence: await bdb.evidence.where('key').equals(s.key).count(),
      versions: await bdb.versions.where('key').equals(s.key).count(),
    }),
    [s.key],
    { notes: 0, evidence: 0, versions: 0 },
  )
  const items = validationItems(s.body)

  const approve = async (a: Approval) => {
    try {
      await setApproval(s.key, a)
      toast(a === 'approved' ? `Section ${s.sid} approuvée` : `Section ${s.sid} : ${approvalLabel(a)}`)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Action impossible', 'error')
    }
  }

  return (
    <article id={`s-${s.sid}`} className="print-section scroll-mt-20 border-b border-line py-8 last:border-0">
      <header className="mb-3 flex flex-wrap items-start gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-ink-3">{s.sid}</span>
            <StatusBadge s={s.status} />
            <ApprovalBadge a={s.approval} />
            {s.approvedBy && <span className="text-[11px] text-ink-3">par {s.approvedBy}, {new Date(s.approvedAt!).toLocaleDateString('fr-FR')}</span>}
          </div>
          <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.01em]">{s.title}</h3>
        </div>
        <div className="no-print flex flex-wrap items-center gap-1">
          {id.canEdit && !editing && (
            <Button size="sm" variant="ghost" icon={<Pencil size={13} />} onClick={() => setEditing(true)}>
              Modifier
            </Button>
          )}
          {id.canEdit && s.approval === 'draft' && (
            <Button size="sm" variant="ghost" onClick={() => approve('review')}>
              Soumettre en revue
            </Button>
          )}
          {id.canApprove && s.approval !== 'approved' && (
            <Button size="sm" icon={<Check size={13} />} onClick={() => approve('approved')}>
              Approuver
            </Button>
          )}
          {id.canApprove && s.approval === 'approved' && (
            <Button size="sm" variant="ghost" onClick={() => approve('review')}>
              Retirer l’approbation
            </Button>
          )}
          <IconButton label={`Notes (${counts.notes})`} onClick={() => onOpenPanel(s.key, 'notes')}>
            <span className="relative">
              <MessageSquare size={14} />
              {counts.notes > 0 && <Dot />}
            </span>
          </IconButton>
          <IconButton label={`Références et preuves (${counts.evidence})`} onClick={() => onOpenPanel(s.key, 'evidence')}>
            <span className="relative">
              <Paperclip size={14} />
              {counts.evidence > 0 && <Dot />}
            </span>
          </IconButton>
          <IconButton label={`Historique (${counts.versions} version(s))`} onClick={() => onOpenPanel(s.key, 'history')}>
            <span className="relative">
              <History size={14} />
              {counts.versions > 0 && <Dot />}
            </span>
          </IconButton>
        </div>
      </header>
      {editing ? <SectionEditor s={s} onClose={() => setEditing(false)} /> : <Markdown md={s.body} />}
      {items.length > 0 && !editing && <ValidationFields s={s} items={items} canEdit={id.canEdit} />}
    </article>
  )
}

const Dot = () => <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-ink" />

function SectionEditor({ s, onClose }: { s: SectionRow; onClose: () => void }) {
  const [body, setBody] = useState(s.body)
  const [title, setTitle] = useState(s.title)
  const [status, setStatus] = useState<ContentStatus>(s.status)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [preview, setPreview] = useState(false)
  const timer = useRef<number | null>(null)
  const latest = useRef({ body, title, status })
  latest.current = { body, title, status }

  const flush = async () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
    setState('saving')
    try {
      await saveSection(s.key, latest.current)
      setState('saved')
    } catch {
      setState('error')
    }
  }
  const schedule = () => {
    setState('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, 1000)
  }
  useEffect(() => () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      saveSection(s.key, latest.current)
    }
  }, [s.key])

  return (
    <div className="no-print space-y-3 rounded-xl border border-line bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <Field label="Titre">
          <input className="input" value={title} onChange={(e) => { setTitle(e.target.value); schedule() }} />
        </Field>
        <Field label="Statut du contenu">
          <Select<ContentStatus>
            value={status}
            onChange={(v) => { if (v) { setStatus(v); schedule() } }}
            options={(['CONFIRMÉ', 'RECOMMANDATION', 'HYPOTHÈSE', 'À VALIDER'] as ContentStatus[]).map((x) => ({ value: x, label: x }))}
          />
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <Tabs value={preview ? 'p' : 'e'} onChange={(v) => setPreview(v === 'p')} items={[{ value: 'e', label: 'Markdown' }, { value: 'p', label: 'Aperçu' }]} />
        <span className="ml-auto text-[11.5px] text-ink-3" aria-live="polite">
          {state === 'saving' && 'Enregistrement…'}
          {state === 'saved' && 'Enregistré automatiquement'}
          {state === 'error' && <span className="text-[var(--v-expert)]">Échec de l’enregistrement</span>}
        </span>
      </div>
      {preview ? (
        <div className="rounded-lg border border-line bg-bg p-4">
          <Markdown md={body} />
        </div>
      ) : (
        <textarea
          className="input min-h-[360px] font-mono text-[12.5px] leading-[1.65]"
          value={body}
          onChange={(e) => { setBody(e.target.value); schedule() }}
          spellCheck
          aria-label="Contenu de la section en Markdown"
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11.5px] text-ink-3">
          Libellés recommandés : **Principe.** **Pourquoi c’est important.** **Application.** **Exemples.** **À éviter.** **Mesure.** — Champ à valider : « &gt; À VALIDER : … »
        </span>
        <Button variant="primary" size="sm" onClick={async () => { await flush(); onClose() }}>
          Terminer
        </Button>
      </div>
    </div>
  )
}

function ValidationFields({ s, items, canEdit }: { s: SectionRow; items: string[]; canEdit: boolean }) {
  const rows = useLiveQuery(() => bdb.fields.where('doc').equals(s.doc).toArray(), [s.doc], [])
  const map = new Map(rows.map((r) => [r.key, r]))
  return (
    <div className="no-print mt-4 rounded-xl border border-[color-mix(in_srgb,var(--v-idea)_30%,var(--line))] bg-surface p-4">
      <div className="eyebrow mb-2 !text-[var(--v-idea)]">Champs à valider ({items.filter((_, i) => map.get(`${s.key}#${i}`)?.resolved).length}/{items.length} résolus)</div>
      <div className="space-y-3">
        {items.map((q, i) => {
          const k = `${s.key}#${i}`
          const f = map.get(k)
          return (
            <div key={k} className="grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-start">
              <p className={clsx('text-[12.5px] leading-relaxed', f?.resolved && 'text-ink-3 line-through')}>{q}</p>
              <TextInput
                value={f?.answer ?? ''}
                placeholder={canEdit ? 'Réponse / information fournie' : '—'}
                onCommit={(v) => canEdit && setField(s.doc, k, { answer: v })}
                className="text-[12.5px]"
              />
              <label className="flex items-center gap-1.5 whitespace-nowrap pt-1.5 text-[12px] text-ink-2">
                <input type="checkbox" disabled={!canEdit} checked={!!f?.resolved} onChange={(e) => setField(s.doc, k, { resolved: e.target.checked })} />
                Résolu
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- side panel: notes · evidence · history ---------------- */

export type PanelTab = 'notes' | 'evidence' | 'history'

export function SectionPanel({
  doc,
  sectionKey,
  tab,
  setTab,
  onClose,
  id,
}: {
  doc: DocId
  sectionKey: string | null
  tab: PanelTab
  setTab: (t: PanelTab) => void
  onClose: () => void
  id: ReturnType<typeof useIdentity>
}) {
  const s = useLiveQuery(() => (sectionKey && !sectionKey.endsWith(':*') ? bdb.sections.get(sectionKey) : undefined), [sectionKey])
  const isDoc = !!sectionKey?.endsWith(':*')
  return (
    <Sheet open={!!sectionKey} onClose={onClose} label="Panneau de section" width="max-w-[760px]">
      {sectionKey && (
        <>
          <div className="flex items-start gap-3 border-b border-line bg-surface px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[11px] text-ink-3">{isDoc ? 'Document entier' : `Section ${s?.sid ?? ''}`}</div>
              <div className="text-[16px] font-semibold">{isDoc ? 'Références et notes du document' : s?.title}</div>
            </div>
            <IconButton label="Fermer" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
          <div className="border-b border-line px-5 py-2">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: 'notes', label: 'Notes' },
                { value: 'evidence', label: 'Références & preuves' },
                ...(isDoc ? [] : [{ value: 'history' as const, label: 'Historique' }]),
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 scroll-thin">
            {tab === 'notes' && <NotesTab doc={doc} k={sectionKey} canEdit={id.canEdit} />}
            {tab === 'evidence' && <EvidenceTab doc={doc} k={sectionKey} id={id} />}
            {tab === 'history' && s && <HistoryTab s={s} canEdit={id.canEdit} />}
          </div>
        </>
      )}
    </Sheet>
  )
}

function NotesTab({ doc, k, canEdit }: { doc: DocId; k: string; canEdit: boolean }) {
  const notes = useLiveQuery(() => bdb.notes.where('key').equals(k).reverse().sortBy('createdAt'), [k], [])
  const [text, setText] = useState('')
  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="space-y-2">
          <textarea className="input" rows={3} placeholder="Ajouter une note (contexte, décision, question…)" value={text} onChange={(e) => setText(e.target.value)} />
          <Button
            size="sm"
            variant="primary"
            disabled={!text.trim()}
            onClick={async () => {
              await addNote(doc, k, text)
              setText('')
            }}
          >
            Ajouter la note
          </Button>
        </div>
      )}
      {notes.length === 0 && <div className="text-[12.5px] text-ink-3">Aucune note.</div>}
      {notes.map((n) => (
        <div key={n.id} className="rounded-lg border border-line bg-surface p-3">
          <div className="whitespace-pre-line text-[13px] leading-relaxed">{n.text}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-3">
            <span>
              {n.author} · {new Date(n.createdAt).toLocaleString('fr-FR')}
            </span>
            {canEdit && (
              <IconButton label="Supprimer la note" onClick={() => deleteNote(n.id!)}>
                <Trash2 size={12} />
              </IconButton>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function EvidenceTab({ doc, k, id }: { doc: DocId; k: string; id: ReturnType<typeof useIdentity> }) {
  const rows = useLiveQuery(() => bdb.evidence.where('key').equals(k).reverse().sortBy('createdAt'), [k], [])
  const images = useImages()
  const fileRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [imgId, setImgId] = useState<string | null>(null)
  const toast = useToast()
  return (
    <div className="space-y-5">
      {id.canEdit && (
        <div className="space-y-3 rounded-xl border border-line bg-surface p-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" icon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>
              Importer un fichier
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              accept="image/*,application/pdf,.doc,.docx,.txt,.md"
              onChange={async (e) => {
                const rejected = await addEvidenceFiles(doc, k, [...(e.target.files ?? [])])
                rejected.forEach((r) => toast(r, 'error'))
                if (e.target.files?.length && !rejected.length) toast('Fichier ajouté')
                e.target.value = ''
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ImagePlus size={14} className="text-ink-3" />
            <Select className="!w-[260px]" allowEmpty emptyLabel="Associer une image de la galerie" value={imgId} onChange={setImgId} options={images.map((i) => ({ value: i.id, label: `${i.id} — ${i.description.slice(0, 50)}` }))} />
            <Button size="sm" disabled={!imgId} onClick={async () => { if (imgId) { await addEvidenceImage(doc, k, imgId, images.find((i) => i.id === imgId)?.description ?? ''); setImgId(null); toast('Référence associée') } }}>
              Associer
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link2 size={14} className="text-ink-3" />
            <input className="input !w-[260px]" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button
              size="sm"
              disabled={!url.trim()}
              onClick={async () => {
                try {
                  await addEvidenceLink(doc, k, url.trim(), '')
                  setUrl('')
                  toast('Lien ajouté')
                } catch (e) {
                  toast(e instanceof Error ? e.message : 'Lien invalide', 'error')
                }
              }}
            >
              Ajouter le lien
            </Button>
          </div>
        </div>
      )}
      {rows.length === 0 && <div className="text-[12.5px] text-ink-3">Aucune référence ni preuve.</div>}
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <EvidenceCard key={r.id} r={r} id={id} />
        ))}
      </div>
    </div>
  )
}

function useBlobUrl(blob?: Blob) {
  const [u, setU] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) return setU(null)
    const x = URL.createObjectURL(blob)
    setU(x)
    return () => URL.revokeObjectURL(x)
  }, [blob])
  return u
}

export function EvidenceCard({ r, id }: { r: EvidenceRow; id: ReturnType<typeof useIdentity> }) {
  const images = useImages()
  const url = useBlobUrl(r.blob)
  const [confirm, setConfirm] = useState(false)
  const img = r.imageId ? images.find((i) => i.id === r.imageId) : undefined
  const isImg = r.kind === 'image' || r.mime.startsWith('image/')
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {isImg && (img ? <Thumb img={img} className="aspect-[4/3] w-full object-top" /> : url ? <img src={url} alt={r.name} className="aspect-[4/3] w-full bg-surface-2 object-contain" /> : null)}
      <div className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          {!isImg && <FileText size={14} className="mt-0.5 shrink-0 text-ink-3" />}
          <div className="min-w-0 flex-1 break-words text-[12.5px] font-medium">
            {r.kind === 'link' ? (
              <a href={r.url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
                {r.name}
              </a>
            ) : url && !isImg ? (
              <a href={url} download={r.name} className="underline underline-offset-2">
                {r.name}
              </a>
            ) : (
              r.name
            )}
          </div>
        </div>
        <TextInput value={r.description} placeholder={id.canEdit ? 'Description' : ''} onCommit={(v) => id.canEdit && updateEvidence(r.id!, { description: v })} className="text-[12px]" />
        <div className="flex items-center justify-between text-[11px] text-ink-3">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" disabled={!id.canApprove} checked={r.approved} onChange={(e) => updateEvidence(r.id!, { approved: e.target.checked })} />
            Asset approuvé
          </label>
          {id.canEdit && (
            <IconButton label="Supprimer" onClick={() => setConfirm(true)}>
              <Trash2 size={12} />
            </IconButton>
          )}
        </div>
        <div className="text-[10.5px] text-ink-3">
          {r.author} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>
      <Confirm open={confirm} onClose={() => setConfirm(false)} title="Supprimer cette référence ?" message={r.name} onConfirm={() => deleteEvidence(r.id!)} />
    </div>
  )
}

function HistoryTab({ s, canEdit }: { s: SectionRow; canEdit: boolean }) {
  const versions = useLiveQuery(() => bdb.versions.where('key').equals(s.key).reverse().sortBy('savedAt'), [s.key], [])
  const [sel, setSel] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<number | null>(null)
  const toast = useToast()
  const v = versions.find((x) => x.id === sel)
  const diff = v ? diffLines(v.body, s.body) : []
  if (versions.length === 0) return <div className="text-[12.5px] text-ink-3">Aucune modification : la section est dans sa version initiale (playbook 1.0).</div>
  return (
    <div className="space-y-4">
      <div className="divide-y divide-line rounded-lg border border-line bg-surface">
        {versions.map((x, i) => (
          <div key={x.id} className={clsx('flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[12.5px]', sel === x.id && 'bg-surface-2')}>
            <span className="font-medium">{i === 0 ? 'Version actuelle' : x.label}</span>
            <span className="text-ink-3">
              {new Date(x.savedAt).toLocaleString('fr-FR')} · {x.author}
            </span>
            <div className="ml-auto flex gap-1">
              {i > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setSel(sel === x.id ? null : x.id!)}>
                  {sel === x.id ? 'Masquer' : 'Comparer'}
                </Button>
              )}
              {i > 0 && canEdit && (
                <Button size="sm" variant="ghost" icon={<RotateCcw size={12} />} onClick={() => setConfirm(x.id!)}>
                  Restaurer
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {v && (
        <div>
          <div className="mb-2 text-[12px] text-ink-3">
            Différences entre la version du {new Date(v.savedAt).toLocaleString('fr-FR')} (rouge) et la version actuelle (vert)
          </div>
          <pre className="max-h-[50vh] overflow-auto rounded-lg border border-line bg-surface p-3 text-[12px] leading-[1.6] scroll-thin">
            {diff.map((d, i) => (
              <div
                key={i}
                className={clsx('whitespace-pre-wrap px-1', d.type === 'add' && 'bg-[color-mix(in_srgb,var(--v-ok)_14%,transparent)]', d.type === 'del' && 'bg-[color-mix(in_srgb,var(--v-expert)_12%,transparent)] line-through opacity-80')}
              >
                {d.type === 'add' ? '+ ' : d.type === 'del' ? '− ' : '  '}
                {d.text || ' '}
              </div>
            ))}
          </pre>
        </div>
      )}
      <Confirm
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title="Restaurer cette version ?"
        message="Le contenu actuel est conservé dans l’historique. La restauration crée une nouvelle version."
        confirmLabel="Restaurer"
        onConfirm={async () => {
          if (confirm === null) return
          await restoreVersion(s.key, confirm)
          toast('Version restaurée')
          setSel(null)
        }}
      />
    </div>
  )
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-xl border border-line bg-surface p-4', className)}>{children}</div>
}
