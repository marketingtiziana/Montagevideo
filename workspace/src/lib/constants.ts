import type {
  BrandId,
  Format,
  ImageType,
  Objective,
  PillarId,
  PlatformId,
  Stage,
  TechValidation,
  Validation,
} from './types'

export const BRANDS: Record<BrandId, { label: string; short: string; color: string }> = {
  FN: { label: 'Fynovates', short: 'FN', color: 'var(--c-fn)' },
  TZ: { label: 'Tiziana / Madame Caci', short: 'TZ', color: 'var(--c-tz)' },
}

export const PLATFORMS: Record<
  PlatformId,
  { label: string; network: string; brand: BrandId; color: string; short: string }
> = {
  'yt-fn': { label: 'YouTube Fynovates', network: 'YouTube', brand: 'FN', color: 'var(--c-yt)', short: 'YT' },
  'ig-fn': { label: 'Instagram Fynovates', network: 'Instagram', brand: 'FN', color: 'var(--c-ig)', short: 'IG' },
  'tt-fn': { label: 'TikTok Fynovates', network: 'TikTok', brand: 'FN', color: 'var(--c-tt)', short: 'TT' },
  'li-fn': { label: 'LinkedIn Fynovates', network: 'LinkedIn', brand: 'FN', color: 'var(--c-li)', short: 'LI' },
  'ig-tz': { label: 'Instagram Tiziana', network: 'Instagram', brand: 'TZ', color: 'var(--c-ig)', short: 'IG' },
  'li-tz': { label: 'LinkedIn Tiziana', network: 'LinkedIn', brand: 'TZ', color: 'var(--c-li)', short: 'LI' },
}
export const PLATFORM_IDS = Object.keys(PLATFORMS) as PlatformId[]

export const PILLARS: Record<PillarId, { label: string; short: string; color: string }> = {
  A: { label: 'TVA, fiscalité internationale et vente en ligne', short: 'TVA & fiscalité', color: 'var(--c-pa)' },
  B: { label: 'Banque, encaissements et capacité d’emprunt', short: 'Banque', color: 'var(--c-pb)' },
  C: { label: 'Patrimoine, immobilier et argent personnel', short: 'Patrimoine', color: 'var(--c-pc)' },
  D: { label: 'Résidence fiscale, expatriation et conformité', short: 'Résidence', color: 'var(--c-pd)' },
  E: { label: 'Coulisses et méthodologie Fynovates', short: 'Méthode', color: 'var(--c-pe)' },
  F: { label: 'Écosystème et prescripteurs', short: 'Écosystème', color: 'var(--c-pf)' },
}
export const PILLAR_IDS = Object.keys(PILLARS) as PillarId[]

export const STAGES: { id: Stage; label: string }[] = [
  { id: 'idee', label: 'Idée' },
  { id: 'a-rediger', label: 'À rédiger' },
  { id: 'a-valider', label: 'À valider techniquement' },
  { id: 'a-creer', label: 'À créer graphiquement' },
  { id: 'a-tourner', label: 'À tourner' },
  { id: 'en-montage', label: 'En montage' },
  { id: 'pret', label: 'Prêt à publier' },
  { id: 'publie', label: 'Publié' },
]
export const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label])) as Record<Stage, string>

export const VALIDATIONS: Validation[] = [
  'VALIDÉ',
  'STRATÉGIE PROPOSÉE',
  'IDÉE À VALIDER',
  'VALIDATION EXPERT REQUISE',
  'RÉFÉRENCE VISUELLE',
  'PHOTO RÉELLE TIZIANA',
]
export const VALIDATION_TONE: Record<Validation, string> = {
  'VALIDÉ': 'ok',
  'STRATÉGIE PROPOSÉE': 'proposal',
  'IDÉE À VALIDER': 'idea',
  'VALIDATION EXPERT REQUISE': 'expert',
  'RÉFÉRENCE VISUELLE': 'ref',
  'PHOTO RÉELLE TIZIANA': 'photo',
}

export const FORMATS: Record<Format, string> = {
  'expert-face-camera-motion': 'Expert face caméra + motion design',
  'motion-design': 'Motion design + voix off',
  'face-camera': 'Face caméra',
  'decryptage-youtube': 'Décryptage YouTube (15–20 min)',
  'long-format': 'Long format YouTube',
  short: 'Short',
  reel: 'Reel',
  story: 'Séquence Story',
  infographie: 'Infographie',
  carrousel: 'Carrousel',
  'carrousel-pdf': 'Carrousel PDF',
  'carrousel-photo': 'Carrousel photographique',
  photo: 'Photographie',
  'post-texte': 'Post à la première personne',
  'tableau-comparatif': 'Tableau comparatif',
  'etude-de-cas': 'Étude de cas',
  video: 'Vidéo',
  'document-pdf': 'Document PDF',
}
export const FORMAT_IDS = Object.keys(FORMATS) as Format[]

/** Which creative model applies to a format. */
export function modelFor(f: Format): 'infographic' | 'carousel' | 'storyboard' | 'story' | null {
  if (f === 'infographie' || f === 'tableau-comparatif') return 'infographic'
  if (f === 'carrousel' || f === 'carrousel-pdf' || f === 'carrousel-photo' || f === 'document-pdf') return 'carousel'
  if (f === 'story') return 'story'
  if (
    f === 'reel' ||
    f === 'short' ||
    f === 'motion-design' ||
    f === 'expert-face-camera-motion' ||
    f === 'face-camera' ||
    f === 'video' ||
    f === 'long-format' ||
    f === 'decryptage-youtube'
  )
    return 'storyboard'
  return null
}

export const OBJECTIVES: Record<Objective, string> = {
  notoriete: 'Notoriété',
  pedagogie: 'Pédagogie',
  confiance: 'Confiance & preuve',
  conversion: 'Intention commerciale',
  'personal-branding': 'Personal branding',
  prescription: 'Prescription / écosystème',
}

export const TECH: Record<TechValidation, string> = {
  'non-requise': 'Non requise',
  requise: 'Requise',
  'en-cours': 'En cours',
  validee: 'Validée',
}

export const IMAGE_TYPES: Record<ImageType, string> = {
  'photo-tiziana': 'Photo réelle Tiziana',
  'ref-feed': 'Référence Feed',
  'ref-story': 'Référence Story',
  'ref-reel': 'Référence Reel',
  'ref-infographie': 'Référence Infographie',
  'ref-carrousel': 'Référence Carrousel',
  'ref-motion': 'Référence Motion Design',
  'ref-corporate': 'Référence Corporate',
  'ref-lifestyle': 'Référence Lifestyle',
  'ref-couverture': 'Référence Couverture vidéo',
  'a-classer': 'Visuels à classer',
}

export const TBD = 'À RENSEIGNER'

export const EMPTY_CREATIVE = {
  reference: '',
  composition: '',
  hierarchy: '',
  typography: '',
  photoStyle: '',
  structure: '',
  overlayText: '',
  mobile: '',
  output: '',
}

export const CREATIVE_FIELDS: { key: keyof typeof EMPTY_CREATIVE; label: string }[] = [
  { key: 'reference', label: 'Référence visuelle' },
  { key: 'composition', label: 'Proposition de composition' },
  { key: 'hierarchy', label: 'Hiérarchie visuelle' },
  { key: 'typography', label: 'Typographie envisagée' },
  { key: 'photoStyle', label: 'Style photographique' },
  { key: 'structure', label: 'Structure du visuel' },
  { key: 'overlayText', label: 'Texte éventuel à intégrer' },
  { key: 'mobile', label: 'Déclinaison mobile' },
  { key: 'output', label: 'Format de sortie' },
]
