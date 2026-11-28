import type { StrategyItem, StrategySection, Validation } from '../types'

let n = 0
export const uid = (p = 'x') => `${p}-${(++n).toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const item = (text: string, validation: Validation = 'VALIDÉ'): StrategyItem => ({
  id: uid('it'),
  text,
  validation,
})

export const section = (
  title: string,
  texts: (string | [string, Validation])[],
  kind: StrategySection['kind'] = 'list',
  defaultValidation: Validation = 'VALIDÉ',
): StrategySection => ({
  id: uid('sec'),
  title,
  kind,
  items: texts.map((t) => (Array.isArray(t) ? item(t[0], t[1]) : item(t, defaultValidation))),
})

export const SRC = {
  brief: 'Brief stratégique (master prompt)',
  plancheFN: 'Planche LinkedIn Fynovates — IMG-001',
  plancheTZ: 'Planche Instagram Tiziana — IMG-002',
  storiesFN: 'Maquettes Stories Fynovates — IMG-012 à IMG-019',
  igFN: 'Maquettes Instagram Fynovates — IMG-003 à IMG-006',
  ttFN: 'Maquettes TikTok Fynovates — IMG-007 à IMG-009',
  audit: 'Audit douleurs — 5 appels clients (anonymisé)',
  claude: 'Proposition de structuration (Claude)',
}
