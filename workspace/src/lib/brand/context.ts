import type { Content } from '../types'
import { DOCS, type DocId } from './docs'
import type { SectionRow } from './store'

/* ------------------------------------------------------------------
   Brand intelligence: chooses the brand context(s) for a production
   and compiles them into a Markdown context pack that can be given to
   any AI writing/design tool. Rules from the Brand Alignment document.
   ------------------------------------------------------------------ */

export type ContextId = 'corporate' | 'personal'

export interface ContentType {
  id: string
  label: string
  group: 'FYNOVATES' | 'Tiziana' | 'Double'
  contexts: ContextId[]
}

export const CONTENT_TYPES: ContentType[] = [
  { id: 'fn-post', label: 'Publication FYNOVATES (LinkedIn, Instagram)', group: 'FYNOVATES', contexts: ['corporate'] },
  { id: 'fn-script', label: 'Script FYNOVATES (motion, expert, short)', group: 'FYNOVATES', contexts: ['corporate'] },
  { id: 'fn-deck', label: 'Présentation commerciale', group: 'FYNOVATES', contexts: ['corporate'] },
  { id: 'fn-doc', label: 'Document corporate', group: 'FYNOVATES', contexts: ['corporate'] },
  { id: 'fn-commercial', label: 'Communication commerciale', group: 'FYNOVATES', contexts: ['corporate'] },
  { id: 'fn-visual', label: 'Visuel de l’entreprise', group: 'FYNOVATES', contexts: ['corporate'] },
  { id: 'tz-post', label: 'Post personnel de Tiziana', group: 'Tiziana', contexts: ['personal'] },
  { id: 'tz-video', label: 'Vidéo personnelle de Tiziana', group: 'Tiziana', contexts: ['personal'] },
  { id: 'tz-speech', label: 'Discours / prise de parole', group: 'Tiziana', contexts: ['personal'] },
  { id: 'tz-interview', label: 'Interview', group: 'Tiziana', contexts: ['personal'] },
  { id: 'tz-leadership', label: 'Contenu de leadership', group: 'Tiziana', contexts: ['personal'] },
  { id: 'tz-photo', label: 'Photographie et direction visuelle personnelles', group: 'Tiziana', contexts: ['personal'] },
  { id: 'db-joint', label: 'Annonce conjointe / déclinaison double', group: 'Double', contexts: ['corporate', 'personal'] },
  { id: 'db-yt-tz', label: 'Décryptage de Tiziana sur la chaîne FYNOVATES', group: 'Double', contexts: ['personal', 'corporate'] },
]

export const CONTEXT_DOC: Record<ContextId, DocId> = { corporate: 'fn', personal: 'tz' }
export const CONTEXT_LABEL: Record<ContextId, string> = { corporate: 'Contexte CORPORATE — FYNOVATES', personal: 'Contexte PERSONNEL — Tiziana' }

/** Chapters included in the "essential" pack (the full pack includes everything). */
const ESSENTIAL: Record<DocId, string[]> = {
  fn: ['0', '1', '2', '7', '8', '9'],
  tz: ['0', '1', '2', '6', '7'],
  align: ['0', '1', '2', '3', '5'],
  assets: ['1'],
}

/** Content type for an existing idea of the guide. */
export function contentTypeFor(c: Pick<Content, 'brands' | 'platforms' | 'format'>): string {
  if (c.brands.length > 1) return 'db-joint'
  if (c.brands[0] === 'TZ') {
    if (c.platforms.includes('yt-fn')) return 'db-yt-tz'
    if (c.format === 'post-texte') return 'tz-post'
    if (c.format === 'photo' || c.format === 'carrousel-photo') return 'tz-photo'
    return 'tz-video'
  }
  if (['infographie', 'carrousel', 'carrousel-pdf', 'tableau-comparatif', 'photo', 'story', 'post-texte'].includes(c.format)) return 'fn-post'
  return 'fn-script'
}

const GUARDRAILS = `## Règles d’attribution (toujours appliquées)
- Une opinion de Tiziana n’est jamais, par défaut, la position officielle de FYNOVATES.
- Une déclaration de FYNOVATES n’est jamais attribuée personnellement à Tiziana sans son accord.
- Toute information fiscale, réglementaire ou bancaire est formulée de façon générale et doit être validée par un expert du cabinet avant publication.
- Aucun client identifiable. Aucun chiffre, diplôme, certification, pays d’implantation, résultat ou témoignage inventé.
- FYNOVATES parle en « nous » ; Tiziana parle en « je ».
- Les éléments marqués « À VALIDER » ou « HYPOTHÈSE » ne doivent pas être présentés comme des faits.`

export function compileContext(type: ContentType, sections: SectionRow[], full: boolean) {
  const docs: DocId[] = [...type.contexts.map((c) => CONTEXT_DOC[c]), 'align']
  const out: string[] = [
    `# Contexte de marque — ${type.label}`,
    '',
    `Contextes appliqués : ${type.contexts.map((c) => CONTEXT_LABEL[c]).join(' + ')} + ALIGNEMENT.`,
    type.contexts.length > 1
      ? 'Contenu à deux voix : appliquer chaque contexte à sa partie et attribuer explicitement chaque prise de parole.'
      : type.contexts[0] === 'corporate'
        ? 'Voix : FYNOVATES (« nous »). Ne pas attribuer ce contenu personnellement à Tiziana.'
        : 'Voix : Tiziana (« je »). Ce contenu exprime son point de vue personnel, pas la position officielle de FYNOVATES.',
    '',
    GUARDRAILS,
    '',
  ]
  for (const d of docs) {
    const list = sections
      .filter((s) => s.doc === d && (full || ESSENTIAL[d].includes(s.chapter)))
      .sort((a, b) => a.order - b.order)
    out.push(`---`, '', `# ${DOCS[d].title}`, '')
    for (const s of list) {
      const flag = s.approval === 'approved' ? 'APPROUVÉ' : s.status
      out.push(`## ${s.sid} ${s.title} [${flag}]`, '', s.body, '')
    }
  }
  return out.join('\n')
}
