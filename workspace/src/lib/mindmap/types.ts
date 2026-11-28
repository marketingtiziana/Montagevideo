export type ClaimStatus = 'RESEARCH REQUIRED' | 'PENDING VALIDATION' | 'VALIDATED'
export const CLAIM_STATUSES: ClaimStatus[] = ['RESEARCH REQUIRED', 'PENDING VALIDATION', 'VALIDATED']
export const CLAIM_LABEL: Record<ClaimStatus, string> = {
  'RESEARCH REQUIRED': 'Recherche requise',
  'PENDING VALIDATION': 'En attente de validation',
  VALIDATED: 'Validé',
}

export interface Claim {
  id: string
  text: string
  jurisdiction: string
  date: string
  source: string
  reference: string
  url: string
  status: ClaimStatus
}

export interface MNode {
  id: string
  title: string
  detail: string
}

export interface BranchNotes {
  mainIdea: string
  points: string[]
  explanation: string
  example: string
  nuance: string
  misconceptions: string[]
  questions: string[]
  transition: string
  conclusion: string
}

export interface Branch {
  id: string
  num: string
  title: string
  phrase: string
  nodes: MNode[]
  notes: BranchNotes
  /** Private presenter notes: shown only in presenter mode, never exported. */
  privateNotes: string
  claimIds: string[]
}

export interface MindMap {
  id: string
  slug: string
  number: string
  title: string
  subtitle: string
  objective: string
  disclaimer: string
  linkedLongForms: string[]
  version: number
  updatedAt: string
  branches: Branch[]
  claims: Claim[]
}

export const emptyNotes = (): BranchNotes => ({
  mainIdea: '',
  points: [],
  explanation: '',
  example: '',
  nuance: '',
  misconceptions: [],
  questions: [],
  transition: '',
  conclusion: '',
})

/** Renumber branches 01..n after add / delete / reorder. */
export function renumber(m: MindMap): MindMap {
  return { ...m, branches: m.branches.map((b, i) => ({ ...b, num: String(i + 1).padStart(2, '0') })) }
}

/** Strip everything that must never leave the presenter view. */
export function publicCopy(m: MindMap): MindMap {
  return { ...m, branches: m.branches.map((b) => ({ ...b, privateNotes: '' })) }
}
