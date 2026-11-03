/**
 * Source de vérité du board « C’est quoi une LLC ».
 * Tout le texte, les positions et les images viennent d’ici : zéro texte en dur dans les composants.
 * Aucun montant, aucun État recommandé, aucun conseil fiscal au-delà de ce texte.
 */

export type Side = 'left' | 'right';

export interface BoardImage {
  id: string;
  /** Requête envoyée à Pexels par `scripts/fetch-images.ts`. */
  imageQuery: string;
  /** Texte alternatif, et nom affiché sur le rectangle de repli. */
  alt: string;
  /** Détouré en local par `scripts/cutout.ts` (objet sur fond uni). */
  cutout?: boolean;
}

/** Détouré posé par-dessus un élément (coordonnées relatives à l’élément, en px). */
export interface Overlay {
  image: string;
  x: number;
  y: number;
  width: number;
  rotate?: number;
}

interface Base {
  id: string;
  side: Side;
  /** Position absolue sur le canvas (coin haut gauche). */
  x: number;
  y: number;
  width: number;
  /** Petit trait reliant l’élément à sa ligne verticale. */
  tick?: boolean;
  overlays?: Overlay[];
  /** Ordre d’empilement quand des éléments se chevauchent. */
  z?: number;
}

export interface MetricElement extends Base {
  type: 'metric';
  label: string;
  value: string;
  tone: 'red' | 'green';
}

export interface ChatElement extends Base {
  type: 'chat';
  title: string;
  messages: string[];
}

export interface PhotoElement extends Base {
  type: 'photo';
  image: string;
  /** Rapport largeur / hauteur du cadre. */
  ratio: number;
}

export interface TableElement extends Base {
  type: 'table';
  title?: string;
  /** Une ligne = une ou deux cellules. */
  rows: string[][];
}

export interface BankElement extends Base {
  type: 'bank';
  title: string;
  accountLabel: string;
  /** Libellés des opérations (montants masqués). */
  lines: { label: string; kind: 'in' | 'out' }[];
  /** Petite courbe de tendance du solde, sans valeur. */
  trend?: 'up' | 'flat';
  /** Dernière ligne mise en avant (ex. « Impôts : ? »). */
  footer?: { label: string; value: string };
}

export interface ChartElement extends Base {
  type: 'chart';
  title?: string;
  /** Deux séries de barres, hauteurs relatives entre 0 et 1 (aucune valeur affichée). */
  series: { label: string; values: number[]; tone: 'red' | 'green' }[];
  /** Mot écrit le long de la flèche bleue courbe. */
  arrowWord?: string;
}

export interface MemeElement extends Base {
  type: 'meme';
  /** Fichier dans public/board/memes/, s’il existe. Sinon, emplacement vide. */
  src?: string;
  placeholder: string;
}

export interface PostitElement extends Base {
  type: 'postit';
  text: string;
  size: 'md' | 'lg';
  tint: 'yellow' | 'orange' | 'green';
}

export interface DocElement extends Base {
  type: 'doc';
  letterhead: string;
  title: string;
  lines: string[];
  stamp: string;
}

export interface FlowElement extends Base {
  type: 'flow';
  title: string;
  steps: string[];
}

export type BoardElement =
  | MetricElement
  | ChatElement
  | PhotoElement
  | TableElement
  | BankElement
  | MemeElement
  | PostitElement
  | DocElement
  | FlowElement
  | ChartElement;

export interface BoardArrow {
  id: string;
  from: string;
  to: string;
}

export interface BoardLine {
  x: number;
  color: string;
  /** Petite étiquette en haut de la ligne. */
  label: string;
  top: number;
  bottom: number;
}

export interface Board {
  /** Identifiant de route et nom du fichier d’export. */
  slug: string;
  title: string;
  background: { paper: string; grid: string; gridGap: number };
  arrowColor: string;
  lines: Record<Side, BoardLine>;
  images: BoardImage[];
  elements: BoardElement[];
  arrows: BoardArrow[];
}

export const board: Board = {
  slug: 'board-llc',
  title: 'C’est quoi une LLC',
  background: { paper: '#FBFBF8', grid: '#E3E6EC', gridGap: 28 },
  arrowColor: '#2563EB',
  lines: {
    left: { x: 0, color: '#E5484D', label: 'En nom propre, sans structure', top: -120, bottom: 2080 },
    right: { x: 1180, color: '#30A46C', label: 'Avec une LLC', top: -120, bottom: 2080 },
  },
  images: [
    { id: 'freelance-stress', imageQuery: 'stressed freelancer laptop papers desk messy', alt: 'Freelance stressé, papiers partout' },
    { id: 'entrepreneur-cafe', imageQuery: 'entrepreneur relaxed laptop bright cafe', alt: 'Entrepreneur serein dans un café' },
    { id: 'skyline-us', imageQuery: 'new york skyline daylight', alt: 'Skyline US' },
    { id: 'passport', imageQuery: 'passport isolated on white background', alt: 'Passeport', cutout: true },
    { id: 'bank-card', imageQuery: 'credit card isolated on white background', alt: 'Carte bancaire', cutout: true },
    { id: 'envelope', imageQuery: 'official envelope isolated on white background', alt: 'Enveloppe officielle', cutout: true },
    { id: 'globe', imageQuery: 'globe earth isolated on white background', alt: 'Globe terrestre', cutout: true },
    { id: 'shield', imageQuery: 'metal shield isolated on white background', alt: 'Bouclier', cutout: true },
    { id: 'laptop', imageQuery: 'laptop isolated on white background', alt: 'Laptop', cutout: true },
  ],
  elements: [
    /* ── Gauche (rouge) : en nom propre ─────────────────────────────── */
    {
      id: 'metric-exposed',
      type: 'metric',
      side: 'left',
      x: -330,
      y: 40,
      width: 290,
      tick: true,
      tone: 'red',
      label: 'Patrimoine perso exposé',
      value: 'oui',
    },
    {
      id: 'chat-freelance',
      type: 'chat',
      side: 'left',
      x: 36,
      y: 150,
      width: 310,
      tick: true,
      z: 2,
      title: 'Discussion',
      messages: [
        'je facture des clients US et Europe en mon nom',
        'mon prestataire de paiement m’a refusé',
        'mes clients me demandent une vraie société',
        'si un client m’attaque c’est mes biens perso',
      ],
    },
    {
      id: 'photo-stress',
      type: 'photo',
      side: 'left',
      x: -350,
      y: 600,
      width: 330,
      tick: true,
      image: 'freelance-stress',
      ratio: 4 / 3,
    },
    {
      id: 'table-pain',
      type: 'table',
      side: 'left',
      x: 24,
      y: 880,
      width: 330,
      tick: true,
      z: 2,
      rows: [
        ['Facturer à l’international', 'compliqué'],
        ['Compte en dollars', 'refusé'],
        ['Perso et pro', 'mélangés'],
        ['Image', 'amateur'],
      ],
    },
    {
      id: 'bank-mixed',
      type: 'bank',
      side: 'left',
      x: -320,
      y: 1150,
      width: 330,
      tick: true,
      title: 'Compte courant',
      accountLabel: 'Un seul compte, tout mélangé',
      lines: [
        { label: 'Loyer', kind: 'out' },
        { label: 'Paiement client', kind: 'in' },
        { label: 'Courses', kind: 'out' },
        { label: 'Abonnement logiciel', kind: 'out' },
        { label: 'Paiement client', kind: 'in' },
        { label: 'Restaurant', kind: 'out' },
      ],
    },
    {
      id: 'meme-slot',
      type: 'meme',
      side: 'left',
      x: 30,
      y: 1560,
      width: 300,
      placeholder: 'Mème',
    },

    /* ── Droite (vert) : avec une LLC ───────────────────────────────── */
    {
      id: 'postit-llc',
      type: 'postit',
      side: 'right',
      x: 1215,
      y: 20,
      width: 330,
      tick: true,
      size: 'lg',
      tint: 'yellow',
      text: 'LLC = Limited Liability Company. Une société créée dans un État américain, séparée de toi.',
    },
    {
      id: 'table-uses',
      type: 'table',
      side: 'right',
      x: 1240,
      y: 200,
      width: 320,
      tick: true,
      title: 'À quoi ça sert',
      rows: [
        ['Facturer partout dans le monde'],
        ['Encaisser en dollars'],
        ['Compte bancaire US + outils de paiement'],
        ['Séparer le pro du perso'],
        ['Image pro'],
      ],
    },
    {
      id: 'doc-advantages',
      type: 'doc',
      side: 'right',
      x: 880,
      y: 430,
      width: 350,
      tick: true,
      z: 2,
      letterhead: 'LLC',
      title: 'Avantages',
      lines: [
        'Responsabilité limitée, ton patrimoine perso est protégé',
        'Simple à créer et à gérer',
        'Pas besoin de vivre aux US',
        'Transparente : pas d’impôt au niveau de la LLC par défaut, tu es imposé selon ta résidence fiscale',
        '1 ou plusieurs membres, flexible',
      ],
      stamp: 'Validé',
      overlays: [{ image: 'shield', x: 250, y: -40, width: 150, rotate: 8 }],
    },
    {
      id: 'flow-how',
      type: 'flow',
      side: 'right',
      x: 1215,
      y: 790,
      width: 440,
      tick: true,
      title: 'Comment',
      steps: [
        'Choix de l’État',
        'Articles of Organization',
        'Registered Agent',
        'EIN (IRS)',
        'Operating Agreement',
        'Compte bancaire + paiements',
      ],
      overlays: [{ image: 'passport', x: 450, y: 110, width: 170, rotate: -6 }],
    },
    {
      id: 'table-yearly',
      type: 'table',
      side: 'right',
      x: 870,
      y: 1150,
      width: 310,
      tick: true,
      title: 'Chaque année',
      rows: [
        ['Annual report ou taxe de l’État'],
        ['Form 5472 + 1120 pro forma si membre unique étranger'],
        ['Registered Agent renouvelé'],
      ],
    },
    {
      id: 'metric-who',
      type: 'metric',
      side: 'right',
      x: 1235,
      y: 1140,
      width: 330,
      tick: true,
      tone: 'green',
      label: 'Pour qui',
      value: 'freelance, e-commerce, coach, créateur qui facture à l’international',
    },
    {
      id: 'postit-warning',
      type: 'postit',
      side: 'right',
      x: 890,
      y: 1430,
      width: 300,
      tick: true,
      z: 2,
      size: 'md',
      tint: 'orange',
      text: 'Attention : la LLC ne supprime pas l’impôt, tout dépend de ta résidence fiscale',
    },
    {
      id: 'photo-cafe',
      type: 'photo',
      side: 'right',
      x: 1225,
      y: 1420,
      width: 340,
      tick: true,
      image: 'entrepreneur-cafe',
      ratio: 4 / 3,
      overlays: [
        { image: 'bank-card', x: -70, y: 190, width: 170, rotate: -12 },
        { image: 'globe', x: 250, y: -50, width: 130, rotate: 6 },
      ],
    },
    {
      id: 'photo-skyline',
      type: 'photo',
      side: 'right',
      x: 1000,
      y: 1720,
      width: 360,
      image: 'skyline-us',
      ratio: 16 / 9,
    },
  ],
  arrows: [
    { id: 'arrow-chat-uses', from: 'chat-freelance', to: 'table-uses' },
    { id: 'arrow-exposed-advantages', from: 'metric-exposed', to: 'doc-advantages' },
    { id: 'arrow-pain-how', from: 'table-pain', to: 'flow-how' },
  ],
};
