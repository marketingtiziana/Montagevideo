/* ============================================================
   DATA MODEL — Fynovates Marketing & Creative Intelligence
   Single source of truth. Relations are stored once:
   - Content.problemIds   → Problem   (inverse computed)
   - Content.imageIds     → Image     (inverse computed)
   - Content.relatedIds   → Content   (symmetric, kept in sync)
   - Problem.imageIds     → Image
   - MatrixRow.cells[p].contentId → Content
   ============================================================ */

export type BrandId = 'FN' | 'TZ'

export type PlatformId = 'yt-fn' | 'ig-fn' | 'tt-fn' | 'li-fn' | 'ig-tz' | 'li-tz'

export type PillarId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

/** Strategic fidelity status — never present a proposal as validated. */
export type Validation =
  | 'VALIDÉ'
  | 'STRATÉGIE PROPOSÉE'
  | 'IDÉE À VALIDER'
  | 'VALIDATION EXPERT REQUISE'
  | 'RÉFÉRENCE VISUELLE'
  | 'PHOTO RÉELLE TIZIANA'

export type Stage =
  | 'idee'
  | 'a-rediger'
  | 'a-valider'
  | 'a-creer'
  | 'a-tourner'
  | 'en-montage'
  | 'pret'
  | 'publie'

export type Format =
  | 'expert-face-camera-motion'
  | 'motion-design'
  | 'face-camera'
  | 'decryptage-youtube'
  | 'long-format'
  | 'short'
  | 'reel'
  | 'story'
  | 'infographie'
  | 'carrousel'
  | 'carrousel-pdf'
  | 'carrousel-photo'
  | 'photo'
  | 'post-texte'
  | 'tableau-comparatif'
  | 'etude-de-cas'
  | 'video'
  | 'document-pdf'

export type Objective =
  | 'notoriete'
  | 'pedagogie'
  | 'confiance'
  | 'conversion'
  | 'personal-branding'
  | 'prescription'

export type TechValidation = 'non-requise' | 'requise' | 'en-cours' | 'validee'

export type ImageType =
  | 'photo-tiziana'
  | 'ref-feed'
  | 'ref-story'
  | 'ref-reel'
  | 'ref-infographie'
  | 'ref-carrousel'
  | 'ref-motion'
  | 'ref-corporate'
  | 'ref-lifestyle'
  | 'ref-couverture'
  | 'a-classer'

/* ---------- Creative models ---------- */

export interface CreativeDirection {
  reference: string
  composition: string
  hierarchy: string
  typography: string
  photoStyle: string
  structure: string
  overlayText: string
  mobile: string
  output: string
}

export interface InfoBlock {
  id: string
  title: string
  body: string
  level: 1 | 2 | 3
}
export interface InfographicModel {
  title: string
  blocks: InfoBlock[]
  dataHierarchy: string
  composition: string
  imageId: string | null
}

export interface Slide {
  id: string
  title: string
  message: string
  body: string
  role: string // fonction narrative
  composition: string
  imageId: string | null
}

export interface Scene {
  id: string
  duration: string
  image: string
  dialogue: string
  camera: string
  voiceover: string
  transition: string
  goal: string
  imageId: string | null
}

export interface StoryScreen {
  id: string
  visual: string
  text: string
  typography: string
  textPosition: string
  interaction: string
  cta: string
  imageId: string | null
}

/* ---------- Core entities ---------- */

export interface Content {
  id: string // FN-001 · TZ-001 · DB-001
  brands: BrandId[]
  subject: string
  hook: string
  problemIds: string[]
  pillar: PillarId | null
  platforms: PlatformId[]
  format: Format
  objective: Objective | null
  angle: string
  outline: string
  script: string
  cta: string
  status: Stage
  validation: Validation
  techValidation: TechValidation
  owner: string
  publishDate: string
  imageIds: string[]
  relatedIds: string[]
  notes: string
  source: string
  creative: CreativeDirection
  creativeIsProposal: boolean
  infographic?: InfographicModel
  slides?: Slide[]
  scenes?: Scene[]
  screens?: StoryScreen[]
  createdAt: number
  updatedAt: number
}

export interface Problem {
  id: string // PB-A01
  pillar: PillarId
  title: string
  situation: string
  pedagogicalAngle: string
  commercialAngle: string
  brands: BrandId[]
  platforms: PlatformId[]
  formats: Format[]
  imageIds: string[]
  validation: Validation
  source: string
  notes: string
  updatedAt: number
}

export interface ImageAsset {
  id: string // IMG-001
  src: string // public path, or '' when stored as blob
  hasBlob: boolean
  originalName: string
  description: string
  brand: BrandId | null
  platform: PlatformId | null
  type: ImageType
  tags: string[]
  validation: Validation
  warnings: string[]
  width: number
  height: number
  createdAt: number
}

export interface StoredFile {
  id: string // same as image id
  blob: Blob
}

export interface Pillar {
  id: PillarId
  title: string
  summary: string
}

export interface StrategyItem {
  id: string
  text: string
  validation: Validation
}

export interface StrategySection {
  id: string
  title: string
  kind: 'list' | 'rules' | 'pillars'
  items: StrategyItem[]
}

export interface Channel {
  id: PlatformId
  brand: BrandId
  network: 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn'
  name: string
  role: string
  sections: StrategySection[]
}

export interface Brand {
  id: BrandId
  name: string
  descriptor: string
  positioning: string
  sections: StrategySection[]
}

export interface JourneyStep {
  id: string
  label: string
  detail: string
  platform: PlatformId | null
  x: number
  y: number
}
export interface Journey {
  id: string
  name: string
  summary: string
  steps: JourneyStep[]
  edges: { id: string; from: string; to: string; label?: string }[]
  validation: Validation
}

export interface MatrixCell {
  angle: string
  format: string
  contentId: string | null
}
export interface MatrixRow {
  id: string
  topic: string
  problemIds: string[]
  cells: Partial<Record<PlatformId, MatrixCell>>
  validation: Validation
  source: string
  order: number
}

export interface Rule {
  id: string
  scope: string
  text: string
  validation: Validation
}

export interface LayoutPos {
  id: string // node id
  x: number
  y: number
}

export interface Meta {
  key: string
  value: unknown
}
