import type { Content, PlatformId, Validation } from '../types'

export type CtaId = 'video' | 'rdv' | 'message' | 'bio' | 'interaction' | 'soft'

export interface Cta {
  id: CtaId
  name: string
  journey: 'J-DECOUVERTE' | 'J-INTENTION' | 'J-BRANDING' | null
  wordings: string[]
  how: string
  where: string[]
  avoid: string
  validation: Validation
  source: string
}

export const ctas: Cta[] = [
  {
    id: 'video',
    name: 'Commente → vidéo YouTube',
    journey: 'J-DECOUVERTE',
    wordings: ['Commente et on t’envoie la vidéo YouTube complète'],
    how: 'La personne commente. Simon lui transmet la vidéo YouTube qui correspond à la problématique du contenu.',
    where: ['Reels et TikTok Fynovates', 'Stories pédagogiques Instagram Fynovates', 'Reels Tiziana extraits d’un décryptage YouTube', 'Shorts tirés d’un long format'],
    avoid: 'Uniquement quand une vidéo YouTube complète existe sur le sujet.',
    validation: 'VALIDÉ',
    source: 'Brief stratégique',
  },
  {
    id: 'rdv',
    name: 'Prendre rendez-vous',
    journey: 'J-INTENTION',
    wordings: ['Prendre rendez-vous', 'FYNOVATES.COM', 'Réponse sous 48 heures ouvrées'],
    how: 'Dernier écran d’une Story de conversion : bouton « Prendre rendez-vous » + sticker lien vers le site.',
    where: ['Dernier écran des séquences Stories de conversion Instagram Fynovates', 'Lien en bio Instagram / TikTok Fynovates'],
    avoid: 'Jamais sur les contenus purement pédagogiques ni sur les comptes de Tiziana.',
    validation: 'RÉFÉRENCE VISUELLE',
    source: 'Maquettes Stories IMG-014, IMG-017',
  },
  {
    id: 'message',
    name: 'Écris-nous ta situation',
    journey: 'J-INTENTION',
    wordings: [
      'Envoie-nous en message le pays de ta société, le type de clients et ce que tu vends.',
      'Un projet d’achat ? Présente-nous ta situation en message.',
      'Tu veux faire analyser ta structure ? Écris-nous.',
    ],
    how: 'La personne décrit sa situation en message privé : c’est le point d’entrée de la qualification.',
    where: ['Fin des séquences Stories « cas client », « coulisses », « fiscalité »', 'Stories « Tes questions »'],
    avoid: 'Ne pas promettre de réponse personnalisée en public : on répond en privé.',
    validation: 'RÉFÉRENCE VISUELLE',
    source: 'Maquettes Stories IMG-015, IMG-016, IMG-018',
  },
  {
    id: 'bio',
    name: 'Lien en bio',
    journey: 'J-INTENTION',
    wordings: ['Lien en bio : site ou prise de rendez-vous'],
    how: 'Le lien en bio oriente vers le site ou la prise de rendez-vous. Sur YouTube, l’équivalent est le lien en description.',
    where: ['Long formats YouTube (fin de vidéo + description)', 'Bio Instagram et TikTok Fynovates'],
    avoid: 'Rester discret : une mention en fin de contenu, pas un appel répété.',
    validation: 'VALIDÉ',
    source: 'Brief stratégique',
  },
  {
    id: 'interaction',
    name: 'Interaction avec Tiziana',
    journey: 'J-BRANDING',
    wordings: ['Sondage', 'Boîte à questions', 'Réponse en message à Tiziana'],
    how: 'Stories interactives : sondage, question, réaction. La relation se crée avec la dirigeante, sans demande commerciale.',
    where: ['Stories Instagram Tiziana', 'Commentaires LinkedIn Tiziana'],
    avoid: 'Aucun CTA commercial sur les comptes de Tiziana : la bio renvoie vers @fynovates.',
    validation: 'VALIDÉ',
    source: 'Brief stratégique',
  },
  {
    id: 'soft',
    name: 'Sans CTA commercial',
    journey: null,
    wordings: ['Découvrir les autres analyses de Fynovates →', 'Réponses publiées cette semaine', 'La réponse dans la story suivante →'],
    how: 'Le contenu apporte de la valeur et renvoie au mieux vers d’autres contenus. Pas de demande de contact.',
    where: ['Infographies et carrousels LinkedIn Fynovates', 'Publications pédagogiques', 'Posts LinkedIn Tiziana'],
    avoid: '—',
    validation: 'VALIDÉ',
    source: 'Brief stratégique · maquette carrousel IMG-001',
  },
]

export const ctaById = Object.fromEntries(ctas.map((c) => [c.id, c])) as Record<CtaId, Cta>

/** Ce qu'on arrête — règles du brief. */
export const ctaStop = [
  'Les assets gratuits (guides, checklists en téléchargement) utilisés comme aimants à prospects',
  'Les calculateurs et simulateurs en accès libre',
  'Un CTA commercial sur chaque contenu',
]

/** Stratégie CTA par plateforme : quel CTA, pour quel type de contenu. */
export const ctaByPlatform: Record<PlatformId, { content: string; cta: CtaId; note?: string }[]> = {
  'yt-fn': [
    { content: 'Long format (décryptage, motion, expert)', cta: 'bio', note: 'Mention en fin de vidéo + lien en description' },
    { content: 'Short tiré du long format', cta: 'video' },
  ],
  'ig-fn': [
    { content: 'Reel / motion design pédagogique', cta: 'video' },
    { content: 'Story pédagogique', cta: 'soft', note: '« La réponse dans la story suivante → »' },
    { content: 'Séquence Stories de conversion', cta: 'rdv' },
    { content: 'Séquence cas client / coulisses / fiscalité', cta: 'message' },
    { content: 'Publication / carrousel', cta: 'soft' },
    { content: 'Bio', cta: 'bio' },
  ],
  'tt-fn': [
    { content: 'Motion design, débunkage, erreurs fréquentes', cta: 'video' },
    { content: 'Bio', cta: 'bio' },
  ],
  'li-fn': [
    { content: 'Infographie, carrousel PDF, tableau comparatif', cta: 'soft', note: '« Découvrir les autres analyses de Fynovates »' },
    { content: 'Étude de cas', cta: 'message', note: 'Proposition : à valider' },
  ],
  'ig-tz': [
    { content: 'Stories', cta: 'interaction' },
    { content: 'Reel extrait d’un décryptage YouTube', cta: 'video' },
    { content: 'Feed photo', cta: 'soft', note: 'Aucun CTA : photographie uniquement' },
  ],
  'li-tz': [{ content: 'Post à la première personne', cta: 'soft', note: 'Conversation en commentaires, pas de demande commerciale' }],
}

/** CTA d'un contenu, déduit de son texte de CTA. */
export function ctaOf(c: Pick<Content, 'cta' | 'brands' | 'platforms' | 'format'>): CtaId {
  const t = c.cta
  if (/comment/i.test(t)) return 'video'
  if (/rendez-vous|fynovates\.com/i.test(t) && !/lien en bio/i.test(t)) return 'rdv'
  if (/message|écris/i.test(t)) return 'message'
  if (/lien en bio/i.test(t)) return 'bio'
  if (c.brands.length === 1 && c.brands[0] === 'TZ' && (c.format === 'story' || c.platforms.includes('ig-tz'))) return 'interaction'
  return 'soft'
}
