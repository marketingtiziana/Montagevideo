import type { PlatformId, Validation } from '../types'

export interface Rhythm {
  id: string
  platform: PlatformId
  label: string
  frequency: string
  perWeek: [number, number] // min, max
  note?: string
  /** Exemple de répartition (0 = lundi … 6 = dimanche). null = jour non défini. */
  days: number[] | null
  validation: Validation
}

export const rhythms: Rhythm[] = [
  {
    id: 'yt-long',
    platform: 'yt-fn',
    label: 'Vidéo YouTube long format',
    frequency: '1 par semaine',
    perWeek: [1, 1],
    note: 'Validation du sujet et du support le mardi, tournage dans la semaine, montage du long format et des shorts. Objectif futur : 2 à 3 par semaine.',
    days: null,
    validation: 'VALIDÉ',
  },
  {
    id: 'ig-fn-shorts',
    platform: 'ig-fn',
    label: 'Shorts / Reels Instagram Fynovates',
    frequency: '1 par jour',
    perWeek: [7, 7],
    note: 'Phase de test de la stratégie au démarrage.',
    days: [0, 1, 2, 3, 4, 5, 6],
    validation: 'VALIDÉ',
  },
  {
    id: 'tt-fn-shorts',
    platform: 'tt-fn',
    label: 'Shorts TikTok Fynovates',
    frequency: '1 par jour',
    perWeek: [7, 7],
    note: 'Phase de test de la stratégie au démarrage.',
    days: [0, 1, 2, 3, 4, 5, 6],
    validation: 'VALIDÉ',
  },
  {
    id: 'ig-fn-posts',
    platform: 'ig-fn',
    label: 'Publications Instagram Fynovates',
    frequency: '3 par semaine',
    perWeek: [3, 3],
    days: [0, 2, 4],
    validation: 'VALIDÉ',
  },
  {
    id: 'ig-fn-stories',
    platform: 'ig-fn',
    label: 'Séquences Stories Instagram Fynovates',
    frequency: '3 à 4 par semaine',
    perWeek: [3, 4],
    days: [1, 3, 5, 6],
    validation: 'VALIDÉ',
  },
  {
    id: 'li-fn',
    platform: 'li-fn',
    label: 'Posts LinkedIn Fynovates',
    frequency: '3 par semaine',
    perWeek: [3, 3],
    days: [1, 2, 3],
    validation: 'VALIDÉ',
  },
  {
    id: 'li-tz',
    platform: 'li-tz',
    label: 'Posts LinkedIn Tiziana',
    frequency: '1 par jour',
    perWeek: [7, 7],
    days: [0, 1, 2, 3, 4, 5, 6],
    validation: 'VALIDÉ',
  },
  {
    id: 'ig-tz-stories',
    platform: 'ig-tz',
    label: 'Story ou séquence de Stories Tiziana',
    frequency: '1 par jour',
    perWeek: [7, 7],
    days: [0, 1, 2, 3, 4, 5, 6],
    validation: 'VALIDÉ',
  },
  {
    id: 'ig-tz-feed',
    platform: 'ig-tz',
    label: 'Feed photo et Reels Instagram Tiziana',
    frequency: 'À RENSEIGNER',
    perWeek: [0, 0],
    days: null,
    validation: 'IDÉE À VALIDER',
  },
]

export const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
