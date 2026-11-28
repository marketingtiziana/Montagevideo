import Dexie, { type EntityTable } from 'dexie'
import { DOCS, parsedDocs, type ContentStatus, type DocId } from './docs'

/* ------------------------------------------------------------------
   Brand Strategy persistence (IndexedDB via Dexie).
   The Markdown files in /brand are the initial version; every edit,
   note, evidence file, approval and version is saved locally and
   survives reloads. Export rebuilds the Markdown from this state.
   ------------------------------------------------------------------ */

export type Approval = 'draft' | 'review' | 'approved'

export interface SectionRow {
  key: string // `${doc}:${sid}`
  doc: DocId
  sid: string
  chapter: string
  order: number
  title: string
  body: string
  status: ContentStatus
  approval: Approval
  approvedBy: string
  approvedAt: number | null
  edited: boolean
  updatedAt: number
  updatedBy: string
}
export interface VersionRow {
  id?: number
  key: string
  doc: DocId
  title: string
  body: string
  status: ContentStatus
  savedAt: number
  author: string
  label: string
}
export interface NoteRow {
  id?: number
  key: string // section key or `${doc}:*`
  doc: DocId
  text: string
  author: string
  createdAt: number
}
export interface EvidenceRow {
  id?: number
  key: string // section key or `${doc}:*`
  doc: DocId
  kind: 'file' | 'image' | 'link'
  name: string
  mime: string
  blob?: Blob
  imageId?: string
  url?: string
  description: string
  approved: boolean
  createdAt: number
  author: string
}
export interface FieldRow {
  key: string // `${sectionKey}#${index}`
  doc: DocId
  answer: string
  resolved: boolean
  updatedAt: number
  author: string
}
export interface ChapterRow {
  key: string // `${doc}:${chapterId}`
  doc: DocId
  id: string
  title: string
}

class BrandDB extends Dexie {
  sections!: EntityTable<SectionRow, 'key'>
  versions!: EntityTable<VersionRow, 'id'>
  notes!: EntityTable<NoteRow, 'id'>
  evidence!: EntityTable<EvidenceRow, 'id'>
  fields!: EntityTable<FieldRow, 'key'>
  chapters!: EntityTable<ChapterRow, 'key'>
  constructor() {
    super('fynovates-brand-strategy')
    this.version(1).stores({
      sections: 'key, doc, [doc+order], approval',
      versions: '++id, key, doc, savedAt',
      notes: '++id, key, doc, createdAt',
      evidence: '++id, key, doc, approved',
      fields: 'key, doc',
      chapters: 'key, doc',
    })
  }
}
export const bdb = new BrandDB()

/* ---------------- identity (local, not an authentication system) ---------------- */

export type Role = 'lecteur' | 'editeur' | 'valideur'
const ls = {
  get(k: string, d: string) {
    try {
      return localStorage.getItem(k) ?? d
    } catch {
      return d
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* storage unavailable */
    }
  },
}
export const identity = {
  role: () => ls.get('brandRole', 'editeur') as Role,
  name: () => ls.get('brandUser', ''),
  setRole: (r: Role) => ls.set('brandRole', r),
  setName: (n: string) => ls.set('brandUser', n),
}
const who = () => identity.name() || 'Utilisateur local'

/* ---------------- seeding / sync with the Markdown sources ---------------- */

export async function syncDocs() {
  await bdb.transaction('rw', bdb.sections, bdb.chapters, async () => {
    for (const doc of Object.keys(DOCS) as DocId[]) {
      const parsed = parsedDocs[doc]
      const existing = await bdb.sections.where('doc').equals(doc).toArray()
      const byKey = new Map(existing.map((s) => [s.key, s]))
      const keys = new Set<string>()
      for (const s of parsed.sections) {
        const key = `${doc}:${s.sid}`
        keys.add(key)
        const row = byKey.get(key)
        if (!row) {
          await bdb.sections.add({
            key,
            doc,
            sid: s.sid,
            chapter: s.chapter,
            order: s.order,
            title: s.title,
            body: s.body,
            status: s.status,
            approval: 'draft',
            approvedBy: '',
            approvedAt: null,
            edited: false,
            updatedAt: Date.now(),
            updatedBy: 'Playbook 1.0',
          })
        } else if (!row.edited && (row.body !== s.body || row.title !== s.title || row.status !== s.status || row.order !== s.order)) {
          await bdb.sections.update(key, { body: s.body, title: s.title, status: s.status, order: s.order, chapter: s.chapter })
        } else if (row.order !== s.order || row.chapter !== s.chapter) {
          await bdb.sections.update(key, { order: s.order, chapter: s.chapter })
        }
      }
      for (const row of existing) if (!keys.has(row.key) && !row.edited) await bdb.sections.delete(row.key)
      await bdb.chapters.where('doc').equals(doc).delete()
      await bdb.chapters.bulkAdd(parsed.chapters.map((c) => ({ key: `${doc}:${c.id}`, doc, id: c.id, title: c.title })))
    }
  })
}

/* ---------------- edits & versions ---------------- */

const COALESCE_MS = 2 * 60 * 1000

export async function saveSection(
  key: string,
  patch: Partial<Pick<SectionRow, 'body' | 'title' | 'status'>>,
  opts: { label?: string } = {},
) {
  await bdb.transaction('rw', bdb.sections, bdb.versions, async () => {
    const cur = await bdb.sections.get(key)
    if (!cur) throw new Error('Section introuvable')
    const next = { ...cur, ...patch }
    if (next.body === cur.body && next.title === cur.title && next.status === cur.status) return
    const versions = await bdb.versions.where('key').equals(key).sortBy('savedAt')
    if (versions.length === 0)
      await bdb.versions.add({ key, doc: cur.doc, title: cur.title, body: cur.body, status: cur.status, savedAt: cur.updatedAt, author: cur.updatedBy, label: 'Version initiale' })
    const last = versions[versions.length - 1]
    const now = Date.now()
    if (!opts.label && last && last.label === 'Modification' && last.author === who() && now - last.savedAt < COALESCE_MS) {
      await bdb.versions.update(last.id!, { title: next.title, body: next.body, status: next.status, savedAt: now })
    } else {
      await bdb.versions.add({ key, doc: cur.doc, title: next.title, body: next.body, status: next.status, savedAt: now, author: who(), label: opts.label ?? 'Modification' })
    }
    await bdb.sections.update(key, {
      ...patch,
      edited: true,
      updatedAt: now,
      updatedBy: who(),
      ...(cur.approval === 'approved' ? { approval: 'review' as Approval, approvedBy: '', approvedAt: null } : {}),
    })
  })
}

export async function restoreVersion(key: string, versionId: number) {
  const v = await bdb.versions.get(versionId)
  if (!v) throw new Error('Version introuvable')
  await saveSection(key, { body: v.body, title: v.title, status: v.status }, { label: `Restauration de la version du ${new Date(v.savedAt).toLocaleString('fr-FR')}` })
}

export async function setApproval(key: string, approval: Approval) {
  if (approval === 'approved' && identity.role() !== 'valideur') throw new Error('Seul un valideur peut approuver une section.')
  await bdb.sections.update(key, {
    approval,
    approvedBy: approval === 'approved' ? who() : '',
    approvedAt: approval === 'approved' ? Date.now() : null,
  })
}

/* ---------------- notes, evidence, validation fields ---------------- */

export async function addNote(doc: DocId, key: string, text: string) {
  if (!text.trim()) return
  await bdb.notes.add({ doc, key, text: text.trim(), author: who(), createdAt: Date.now() })
}
export const deleteNote = (id: number) => bdb.notes.delete(id)

export const MAX_EVIDENCE = 20 * 1024 * 1024
export async function addEvidenceFiles(doc: DocId, key: string, files: File[]) {
  const rejected: string[] = []
  for (const f of files) {
    if (f.size > MAX_EVIDENCE) {
      rejected.push(`${f.name} : fichier trop lourd (> 20 Mo)`)
      continue
    }
    await bdb.evidence.add({ doc, key, kind: 'file', name: f.name, mime: f.type || 'application/octet-stream', blob: f, description: '', approved: false, createdAt: Date.now(), author: who() })
  }
  return rejected
}
export async function addEvidenceImage(doc: DocId, key: string, imageId: string, description: string) {
  await bdb.evidence.add({ doc, key, kind: 'image', name: imageId, mime: 'image/jpeg', imageId, description, approved: false, createdAt: Date.now(), author: who() })
}
export async function addEvidenceLink(doc: DocId, key: string, url: string, description: string) {
  if (!/^https?:\/\//i.test(url)) throw new Error('Le lien doit commencer par http:// ou https://')
  await bdb.evidence.add({ doc, key, kind: 'link', name: url, mime: 'text/uri-list', url, description, approved: false, createdAt: Date.now(), author: who() })
}
export const updateEvidence = (id: number, patch: Partial<EvidenceRow>) => bdb.evidence.update(id, patch)
export const deleteEvidence = (id: number) => bdb.evidence.delete(id)

export async function setField(doc: DocId, key: string, patch: Partial<Pick<FieldRow, 'answer' | 'resolved'>>) {
  const cur = await bdb.fields.get(key)
  await bdb.fields.put({ key, doc, answer: cur?.answer ?? '', resolved: cur?.resolved ?? false, ...patch, updatedAt: Date.now(), author: who() })
}

/* ---------------- export ---------------- */

const APPROVAL_LABEL: Record<Approval, string> = { draft: 'Brouillon', review: 'En revue', approved: 'Approuvé' }
export const approvalLabel = (a: Approval) => APPROVAL_LABEL[a]

export async function exportMarkdown(doc: DocId, opts: { notes?: boolean } = {}) {
  const meta = DOCS[doc]
  const parsed = parsedDocs[doc]
  const sections = await bdb.sections.where('doc').equals(doc).sortBy('order')
  const chapters = parsed.chapters
  const notes = opts.notes ? await bdb.notes.where('doc').equals(doc).toArray() : []
  const fields = await bdb.fields.where('doc').equals(doc).toArray()
  const fieldMap = new Map(fields.map((f) => [f.key, f]))
  const out: string[] = [`# ${parsed.title || meta.title}`, '', parsed.intro, '', `_Export du ${new Date().toLocaleString('fr-FR')}_`, '']
  for (const ch of chapters) {
    out.push(`## ${ch.title}`, '')
    for (const s of sections.filter((x) => x.chapter === ch.id)) {
      out.push(`### ${s.sid} ${s.title}`, `Statut : ${s.status}`, '')
      out.push(`_Approbation : ${APPROVAL_LABEL[s.approval]}${s.approvedBy ? ` — ${s.approvedBy}, ${new Date(s.approvedAt!).toLocaleDateString('fr-FR')}` : ''}_`, '')
      let idx = 0
      const body = s.body.replace(/^> À VALIDER\s*:(.*)$/gm, (line) => {
        const f = fieldMap.get(`${s.key}#${idx++}`)
        if (!f || (!f.answer && !f.resolved)) return line
        return `${line}\n>\n> **Réponse${f.resolved ? ' (résolu)' : ''} :** ${f.answer || '—'}`
      })
      out.push(body, '')
      const sn = notes.filter((n) => n.key === s.key)
      if (sn.length) {
        out.push('**Notes**', '')
        for (const n of sn) out.push(`- ${n.text} — _${n.author}, ${new Date(n.createdAt).toLocaleDateString('fr-FR')}_`)
        out.push('')
      }
    }
  }
  return out.join('\n')
}

export async function exportRegister() {
  const sections = await bdb.sections.toArray()
  const out = ['# Brand Approval Register', '', `_Export du ${new Date().toLocaleString('fr-FR')}_`, '']
  for (const doc of Object.keys(DOCS) as DocId[]) {
    const list = sections.filter((s) => s.doc === doc).sort((a, b) => a.order - b.order)
    const approved = list.filter((s) => s.approval === 'approved').length
    out.push(`## ${DOCS[doc].title}`, '', `${approved} / ${list.length} sections approuvées`, '', '| Section | Statut | Approbation | Valideur | Date |', '|---|---|---|---|---|')
    for (const s of list)
      out.push(`| ${s.sid} ${s.title.replace(/\|/g, '/')} | ${s.status} | ${APPROVAL_LABEL[s.approval]} | ${s.approvedBy || '—'} | ${s.approvedAt ? new Date(s.approvedAt).toLocaleDateString('fr-FR') : '—'} |`)
    out.push('')
  }
  return out.join('\n')
}

export function download(name: string, text: string, type = 'text/markdown') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
