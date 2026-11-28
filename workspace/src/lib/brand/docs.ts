import alignMd from '../../../brand/FYNOVATES_TIZIANA_BRAND_ALIGNMENT.md?raw'
import fnMd from '../../../brand/FYNOVATES_CORPORATE_BRAND_PLAYBOOK.md?raw'
import tzMd from '../../../brand/TIZIANA_PERSONAL_BRAND_PLAYBOOK.md?raw'
import assetsMd from '../../../brand/BRAND_ASSETS_GUIDELINES.md?raw'

export type DocId = 'fn' | 'tz' | 'align' | 'assets'
export type ContentStatus = 'CONFIRMÉ' | 'RECOMMANDATION' | 'HYPOTHÈSE' | 'À VALIDER'

export interface DocMeta {
  id: DocId
  title: string
  short: string
  file: string
  color: string
  audience: string
  source: string
}

export const DOCS: Record<DocId, DocMeta> = {
  fn: {
    id: 'fn',
    title: 'FYNOVATES — Corporate Brand Playbook',
    short: 'Fynovates — marque corporate',
    file: 'FYNOVATES_CORPORATE_BRAND_PLAYBOOK.md',
    color: 'var(--c-fn)',
    audience: 'L’entreprise : services, méthode, crédibilité institutionnelle, identité collective.',
    source: fnMd,
  },
  tz: {
    id: 'tz',
    title: 'TIZIANA — Personal Brand Playbook',
    short: 'Tiziana — marque personnelle',
    file: 'TIZIANA_PERSONAL_BRAND_PLAYBOOK.md',
    color: 'var(--c-tz)',
    audience: 'La dirigeante : présence, voix personnelle, regard individuel, identité exécutive.',
    source: tzMd,
  },
  align: {
    id: 'align',
    title: 'FYNOVATES × TIZIANA — Brand Alignment',
    short: 'Alignement des marques',
    file: 'FYNOVATES_TIZIANA_BRAND_ALIGNMENT.md',
    color: 'var(--ink-2)',
    audience: 'La relation entre les deux marques : ce qui est partagé, exclusif, attribué.',
    source: alignMd,
  },
  assets: {
    id: 'assets',
    title: 'Brand Assets Guidelines',
    short: 'Guidelines des assets',
    file: 'BRAND_ASSETS_GUIDELINES.md',
    color: 'var(--ink-3)',
    audience: 'Inventaire et règles d’usage des ressources visuelles.',
    source: assetsMd,
  },
}
export const WORKSPACES: DocId[] = ['fn', 'tz', 'align']

export interface ParsedSection {
  sid: string // e.g. "1.2"
  title: string
  status: ContentStatus
  body: string
  chapter: string
  order: number
}
export interface ParsedChapter {
  id: string
  title: string
}
export interface ParsedDoc {
  title: string
  intro: string
  chapters: ParsedChapter[]
  sections: ParsedSection[]
}

const STATUS_RE = /^Statut\s*:\s*(CONFIRMÉ|RECOMMANDATION|HYPOTHÈSE|À VALIDER)\s*$/i

export function parseDoc(md: string): ParsedDoc {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  let title = ''
  const intro: string[] = []
  const chapters: ParsedChapter[] = []
  const sections: ParsedSection[] = []
  let chap: ParsedChapter | null = null
  let cur: ParsedSection | null = null
  let buf: string[] = []
  const flush = () => {
    if (cur) {
      let body = buf.join('\n').trim()
      const first = body.split('\n')[0] ?? ''
      const m = first.match(STATUS_RE)
      if (m) {
        cur.status = m[1].toUpperCase() as ContentStatus
        body = body.split('\n').slice(1).join('\n').trim()
      }
      cur.body = body
      sections.push(cur)
    }
    buf = []
  }
  for (const line of lines) {
    if (line.startsWith('# ') && !title) {
      title = line.slice(2).trim()
      continue
    }
    if (line.startsWith('## ')) {
      flush()
      cur = null
      const t = line.slice(3).trim()
      chap = { id: (t.match(/^(\d+)/)?.[1] ?? String(chapters.length)), title: t }
      chapters.push(chap)
      continue
    }
    if (line.startsWith('### ')) {
      flush()
      const t = line.slice(4).trim()
      const num = t.match(/^(\d+(?:\.\d+)*)\s+/)
      cur = {
        sid: num ? num[1] : `${chap?.id ?? 'x'}.${sections.length + 1}`,
        title: num ? t.slice(num[0].length).trim() : t,
        status: 'RECOMMANDATION',
        body: '',
        chapter: chap?.id ?? '0',
        order: sections.length,
      }
      continue
    }
    if (cur) buf.push(line)
    else if (!chap) intro.push(line)
  }
  flush()
  // de-duplicate section ids
  const seen = new Map<string, number>()
  for (const s of sections) {
    const n = seen.get(s.sid) ?? 0
    seen.set(s.sid, n + 1)
    if (n) s.sid = `${s.sid}-${n + 1}`
  }
  return { title, intro: intro.join('\n').trim(), chapters, sections }
}

export const parsedDocs: Record<DocId, ParsedDoc> = {
  fn: parseDoc(fnMd),
  tz: parseDoc(tzMd),
  align: parseDoc(alignMd),
  assets: parseDoc(assetsMd),
}
