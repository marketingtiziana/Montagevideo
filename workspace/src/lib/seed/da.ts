import type { CSSProperties } from 'react'
import type { BrandId } from '../types'

export interface Swatch {
  name: string
  hex: string
  usage: string
  source: string
}
export interface TypeRole {
  role: string
  font: string
  detail: string
  sample: string
  style: CSSProperties
}
export interface Charter {
  brand: BrandId
  intro: string
  palette: Swatch[]
  paletteNote: string
  typography: TypeRole[]
  typographyNote: string
  codes: string[]
  photo: string[]
  dos: string[]
  donts: string[]
  examples: string[] // image ids
}

export const charters: Record<BrandId, Charter> = {
  FN: {
    brand: 'FN',
    intro:
      'Corporate, minimaliste, institutionnelle, premium, sophistiquée et structurée. Un cabinet qui explique : beaucoup d’air, une hiérarchie typographique nette, le bleu nuit comme signature.',
    palette: [
      { name: 'Bleu nuit', hex: '#0D092E', usage: 'Couleur signature : fonds de couverture, aplats de synthèse, Stories de conversion.', source: 'IMG-008, IMG-010' },
      { name: 'Blanc', hex: '#FFFFFF', usage: 'Texte sur bleu nuit, fonds d’infographies et de carrousels.', source: 'IMG-001' },
      { name: 'Gris clair', hex: '#F1F1F3', usage: 'Fond alterné des Stories pédagogiques, encadrés secondaires.', source: 'IMG-012' },
      { name: 'Beige', hex: '#E7E4DD', usage: 'Fond de la variante B des couvertures (alternance avec le bleu nuit).', source: 'IMG-009' },
      { name: 'Lavande', hex: '#A49CFF', usage: 'Accent ponctuel : un seul mot-clé par titre (ex. « vraiment »).', source: 'IMG-008' },
    ],
    paletteNote: 'Valeurs relevées sur les maquettes fournies. À remplacer par les codes officiels de la charte s’ils existent.',
    typography: [
      {
        role: 'Logo',
        font: 'Wordmark FYNOVATES',
        detail: 'Capitales géométriques très espacées, sans symbole. Toujours utiliser le fichier logo, ne pas le recomposer.',
        sample: 'F Y N O V A T E S',
        style: { letterSpacing: '0.45em', fontWeight: 500, fontSize: 22 },
      },
      {
        role: 'Titres',
        font: 'Sans-sérif grotesque, gras',
        detail: '2 à 4 lignes, interlignage serré, ferré à gauche.',
        sample: 'Holding : quand devient-elle vraiment rentable ?',
        style: { fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', lineHeight: 1.1 },
      },
      {
        role: 'Surtitre / rubrique',
        font: 'Capitales espacées, petit corps',
        detail: 'Situe le sujet : FISCALITÉ · TVA, BANQUE, CAS CLIENT, COULISSES…',
        sample: 'FISCALITÉ · TVA',
        style: { fontSize: 11, letterSpacing: '0.22em', fontWeight: 600 },
      },
      {
        role: 'Texte courant',
        font: 'Sans-sérif grotesque, regular',
        detail: 'Phrases courtes, pédagogiques. Pied de page discret : fynovates.com / mentions.',
        sample: 'Une société créée hors de France ne fait pas disparaître la TVA.',
        style: { fontSize: 15, lineHeight: 1.5 },
      },
    ],
    typographyNote: 'Le nom exact de la police n’apparaît pas dans les ressources : sans-sérif grotesque proche d’Inter / Helvetica Now — À CONFIRMER.',
    codes: [
      'En-tête : wordmark à gauche, rubrique en capitales à droite, filet fin dessous',
      'Titre fort, puis un seul niveau de texte courant',
      'Encadré de synthèse en aplat bleu nuit en bas des infographies',
      'Mot-clé du titre surligné ou passé en lavande — un seul par visuel',
      'Couvertures numérotées « N° 01 », alternance bleu nuit / beige',
      'Pied de page : fynovates.com + mention « information générale, à valider par un expert »',
    ],
    photo: [
      'Photographies désaturées, teintées bleu nuit',
      'Sujets : architecture, façades institutionnelles, mains, documents, bureaux, rendez-vous',
      'Experts : portraits noir et blanc, cadrage poitrine',
    ],
    dos: ['Corporate et structuré', 'Beaucoup d’espace blanc', 'Une idée par visuel', 'Chiffres et règles validés par un expert'],
    donts: [
      'Aucun monogramme F',
      'Aucune icône F',
      'Aucun symbole inventé',
      'Aucun globe lumineux',
      'Aucune carte du monde décorative',
      'Aucun circuit électronique',
      'Aucun graphique boursier générique',
      'Aucune esthétique startup technologique',
    ],
    examples: ['IMG-010', 'IMG-008', 'IMG-009', 'IMG-004', 'IMG-005', 'IMG-006', 'IMG-001', 'IMG-014', 'IMG-017', 'IMG-019', 'IMG-003', 'IMG-007'],
  },
  TZ: {
    brand: 'TZ',
    intro:
      'Modern Executive. Une dirigeante, pas une marque graphique : la DA de Tiziana passe par la photographie et la prise de parole, jamais par des montages graphiques.',
    palette: [
      { name: 'Ivoire', hex: '#F8F0E4', usage: 'Tonalité des tenues claires et des fonds lumineux.', source: 'IMG-002' },
      { name: 'Denim', hex: '#333F5A', usage: 'Tonalité dominante des portraits (veste denim).', source: 'IMG-002' },
      { name: 'Cognac', hex: '#8C4B2B', usage: 'Matières chaudes des environnements (cuir, bois).', source: 'IMG-002' },
      { name: 'Noir', hex: '#141414', usage: 'Fonds sombres des portraits studio.', source: 'IMG-002' },
      { name: 'Blanc cassé', hex: '#FAF7F2', usage: 'Fond des présentations internes (planche).', source: 'IMG-002' },
    ],
    paletteNote: 'Tonalités relevées sur les photographies de la planche, à titre indicatif : ce ne sont pas des couleurs à appliquer en graphisme.',
    typography: [
      {
        role: 'Feed',
        font: 'Aucune',
        detail: 'Photographies uniquement : aucun texte incrusté, aucune citation sur fond graphique.',
        sample: '—',
        style: { fontSize: 22, color: 'var(--ink-3)' },
      },
      {
        role: 'Stories — bandeau',
        font: 'Typographie native Instagram, sérif',
        detail: 'Texte sérif noir sur bandeaux blancs, posé sur une photographie.',
        sample: 'Avant de choisir une structure, il faut comprendre la situation.',
        style: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 17, background: '#fff', color: '#111', padding: '2px 8px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', lineHeight: 1.7 },
      },
      {
        role: 'Stories — sur photo',
        font: 'Typographie native Instagram, sans-sérif',
        detail: 'Texte sans-sérif noir ou blanc directement sur la photographie.',
        sample: 'Je préfère comprendre le problème avant de chercher la solution.',
        style: { display: 'inline-block', fontSize: 16, fontWeight: 500, color: '#fff', background: '#333F5A', padding: '10px 12px', lineHeight: 1.4 },
      },
      {
        role: 'Reels',
        font: 'Sous-titres natifs',
        detail: 'Sous-titres blancs centrés, face caméra.',
        sample: 'Une société étrangère n’est pas une solution universelle.',
        style: { display: 'inline-block', fontSize: 15, fontWeight: 600, color: '#fff', background: '#141414', padding: '8px 12px', textAlign: 'center', lineHeight: 1.4 },
      },
    ],
    typographyNote: 'Instagram uniquement avec ses typographies natives. Aucune police de marque à créer pour Tiziana.',
    codes: [
      'Bio : « Fondatrice & directrice de @fynovates »',
      'Stories à la une : uniquement À PROPOS DE MOI et MON CABINET',
      'Carrousels exclusivement photographiques',
      'Aucun logo Fynovates dans le feed',
    ],
    photo: [
      'Portraits',
      'Photos professionnelles',
      'Déplacements',
      'Architecture',
      'Environnements de travail',
      'Lifestyle professionnel',
      'Événements',
      'Ambiances',
    ],
    dos: ['Photographies réelles de Tiziana', 'Lumière naturelle, matières chaudes', 'Face caméra, conversations, reportages', 'Ton direct, analytique, affirmé'],
    donts: ['Texte incrusté dans le feed', 'Montage graphique', 'Logo Fynovates', 'Infographies', 'Citations sur fond graphique', 'Visuels générés présentés comme des photos de Tiziana'],
    examples: ['IMG-002', 'IMG-021', 'IMG-022', 'IMG-023', 'IMG-024', 'IMG-028'],
  },
}
