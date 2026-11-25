import { EMPTY_CREATIVE } from './constants'
import { db } from './db'
import { seedAll } from './seed'
import type { Content, ImageAsset, MatrixRow, Problem } from './types'

/* ---------------- IDs ---------------- */

function nextId(existing: string[], prefix: string, pad = 3) {
  const max = existing
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0)
  return `${prefix}${String(max + 1).padStart(pad, '0')}`
}

export const newKey = () => Math.random().toString(36).slice(2, 10)

/* ---------------- Contents ---------------- */

export type ContentKind = 'FN' | 'TZ' | 'DB'

export async function createContent(kind: ContentKind, patch: Partial<Content> = {}): Promise<string> {
  const keys = (await db.contents.toCollection().primaryKeys()) as string[]
  const id = nextId(keys, `${kind}-`)
  const now = Date.now()
  const content: Content = {
    id,
    brands: kind === 'FN' ? ['FN'] : kind === 'TZ' ? ['TZ'] : ['FN', 'TZ'],
    subject: 'Nouveau contenu',
    hook: '',
    problemIds: [],
    pillar: null,
    platforms: [],
    format: 'reel',
    objective: null,
    angle: '',
    outline: '',
    script: '',
    cta: '',
    status: 'idee',
    validation: 'IDÉE À VALIDER',
    techValidation: 'non-requise',
    owner: '',
    publishDate: '',
    imageIds: [],
    relatedIds: [],
    notes: '',
    source: 'Création manuelle',
    creative: { ...EMPTY_CREATIVE },
    creativeIsProposal: true,
    createdAt: now,
    updatedAt: now,
    ...patch,
  }
  await db.contents.add(content)
  if (content.relatedIds.length) await syncRelated(id, [], content.relatedIds)
  return id
}

async function syncRelated(id: string, before: string[], after: string[]) {
  const added = after.filter((x) => !before.includes(x))
  const removed = before.filter((x) => !after.includes(x))
  for (const other of added) {
    const o = await db.contents.get(other)
    if (o && !o.relatedIds.includes(id)) await db.contents.update(other, { relatedIds: [...o.relatedIds, id] })
  }
  for (const other of removed) {
    const o = await db.contents.get(other)
    if (o) await db.contents.update(other, { relatedIds: o.relatedIds.filter((r) => r !== id) })
  }
}

export async function updateContent(id: string, patch: Partial<Content>) {
  await db.transaction('rw', db.contents, async () => {
    const cur = await db.contents.get(id)
    if (!cur) throw new Error(`Contenu ${id} introuvable`)
    if (patch.relatedIds) {
      patch.relatedIds = [...new Set(patch.relatedIds.filter((r) => r !== id))]
      await syncRelated(id, cur.relatedIds, patch.relatedIds)
    }
    await db.contents.update(id, { ...patch, updatedAt: Date.now() })
  })
}

export async function duplicateContent(id: string): Promise<string> {
  const cur = await db.contents.get(id)
  if (!cur) throw new Error(`Contenu ${id} introuvable`)
  const kind = id.slice(0, 2) as ContentKind
  const { id: _omit, ...rest } = cur
  void _omit
  return createContent(kind, {
    ...structuredClone(rest),
    subject: `${cur.subject} (copie)`,
    status: 'idee',
    relatedIds: [],
    source: `Copie de ${id}`,
  })
}

export async function deleteContent(id: string) {
  await db.transaction('rw', db.contents, db.matrix, async () => {
    const cur = await db.contents.get(id)
    if (!cur) return
    await syncRelated(id, cur.relatedIds, [])
    const rows = await db.matrix.toArray()
    for (const r of rows) {
      let changed = false
      const cells = { ...r.cells }
      for (const k of Object.keys(cells) as (keyof MatrixRow['cells'])[]) {
        if (cells[k]?.contentId === id) {
          cells[k] = { ...cells[k]!, contentId: null }
          changed = true
        }
      }
      if (changed) await db.matrix.update(r.id, { cells })
    }
    await db.contents.delete(id)
  })
}

/* ---------------- Problems ---------------- */

export async function createProblem(pillar: Problem['pillar'], patch: Partial<Problem> = {}) {
  const keys = (await db.problems.toCollection().primaryKeys()) as string[]
  const id = nextId(keys, `PB-${pillar}`, 2)
  await db.problems.add({
    id,
    pillar,
    title: 'Nouvelle problématique',
    situation: '',
    pedagogicalAngle: '',
    commercialAngle: '',
    brands: ['FN'],
    platforms: [],
    formats: [],
    imageIds: [],
    validation: 'IDÉE À VALIDER',
    source: 'Création manuelle',
    notes: '',
    updatedAt: Date.now(),
    ...patch,
  })
  return id
}

export async function updateProblem(id: string, patch: Partial<Problem>) {
  await db.problems.update(id, { ...patch, updatedAt: Date.now() })
}

export async function deleteProblem(id: string) {
  await db.transaction('rw', db.problems, db.contents, db.matrix, async () => {
    await db.contents
      .where('problemIds')
      .equals(id)
      .modify((c) => {
        c.problemIds = c.problemIds.filter((p) => p !== id)
      })
    await db.matrix.toCollection().modify((r) => {
      r.problemIds = r.problemIds.filter((p) => p !== id)
    })
    await db.problems.delete(id)
  })
}

/* ---------------- Images ---------------- */

function readDims(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024

export async function importImages(files: File[]): Promise<{ added: string[]; rejected: string[] }> {
  const added: string[] = []
  const rejected: string[] = []
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      rejected.push(`${file.name} : format non pris en charge`)
      continue
    }
    if (file.size > MAX_IMAGE_BYTES) {
      rejected.push(`${file.name} : fichier trop lourd (> 25 Mo)`)
      continue
    }
    const keys = (await db.images.toCollection().primaryKeys()) as string[]
    const id = nextId(keys, 'IMG-')
    const { width, height } = await readDims(file)
    await db.transaction('rw', db.images, db.files, async () => {
      await db.files.put({ id, blob: file })
      await db.images.add({
        id,
        src: '',
        hasBlob: true,
        originalName: file.name,
        description: '',
        brand: null,
        platform: null,
        type: 'a-classer',
        tags: [],
        validation: 'RÉFÉRENCE VISUELLE',
        warnings: [],
        width,
        height,
        createdAt: Date.now(),
      })
    })
    added.push(id)
  }
  return { added, rejected }
}

export async function updateImage(id: string, patch: Partial<ImageAsset>) {
  await db.images.update(id, patch)
}

export async function deleteImage(id: string) {
  await db.transaction('rw', [db.images, db.files, db.contents, db.problems], async () => {
    await db.contents.toCollection().modify((c) => {
      c.imageIds = c.imageIds.filter((i) => i !== id)
      if (c.infographic?.imageId === id) c.infographic.imageId = null
      c.slides?.forEach((s) => s.imageId === id && (s.imageId = null))
      c.scenes?.forEach((s) => s.imageId === id && (s.imageId = null))
      c.screens?.forEach((s) => s.imageId === id && (s.imageId = null))
    })
    await db.problems.toCollection().modify((p) => {
      p.imageIds = p.imageIds.filter((i) => i !== id)
    })
    await db.files.delete(id)
    await db.images.delete(id)
  })
}

export async function setImageLink(imageId: string, contentId: string, linked: boolean) {
  const c = await db.contents.get(contentId)
  if (!c) return
  const has = c.imageIds.includes(imageId)
  if (linked && !has) await updateContent(contentId, { imageIds: [...c.imageIds, imageId] })
  if (!linked && has) await updateContent(contentId, { imageIds: c.imageIds.filter((i) => i !== imageId) })
}

/* ---------------- Matrix ---------------- */

export async function updateMatrixRow(id: string, patch: Partial<MatrixRow>) {
  await db.matrix.update(id, patch)
}

export async function createMatrixRow(topic: string) {
  const count = await db.matrix.count()
  const id = `M-${newKey()}`
  await db.matrix.add({
    id,
    topic,
    problemIds: [],
    cells: {},
    validation: 'IDÉE À VALIDER',
    source: 'Création manuelle',
    order: count,
  })
  return id
}

export async function deleteMatrixRow(id: string) {
  await db.matrix.delete(id)
}

/* ---------------- Backup ---------------- */

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

export async function exportWorkspace(): Promise<Blob> {
  const out: Record<string, unknown> = { app: 'fynovates-workspace', exportedAt: new Date().toISOString() }
  for (const t of db.tables) {
    if (t.name === 'files') {
      const files = await db.files.toArray()
      out.files = await Promise.all(files.map(async (f) => ({ id: f.id, data: await blobToDataUrl(f.blob) })))
    } else out[t.name] = await t.toArray()
  }
  return new Blob([JSON.stringify(out)], { type: 'application/json' })
}

export async function importWorkspace(file: File) {
  const data = JSON.parse(await file.text())
  if (data.app !== 'fynovates-workspace') throw new Error('Fichier de sauvegarde non reconnu.')
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) {
      await t.clear()
      if (t.name === 'files') {
        for (const f of (data.files ?? []) as { id: string; data: string }[]) {
          const blob = await (await fetch(f.data)).blob()
          await db.files.put({ id: f.id, blob })
        }
      } else if (Array.isArray(data[t.name])) await t.bulkAdd(data[t.name])
    }
  })
}

export async function resetWorkspace() {
  await seedAll()
}
