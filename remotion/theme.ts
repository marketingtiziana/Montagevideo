/**
 * theme.ts — SOURCE UNIQUE DE VÉRITÉ pour les deux univers graphiques.
 *
 * Contrainte de neutralité ABSOLUE : toute la palette est achromatique
 * (R === G === B). Un lint (src/qa/neutralityLint.ts) échoue si un composant
 * d'insert introduit une couleur où R, G, B diffèrent. Aucune couleur. Aucune.
 */

export const editorial = {
  paper: {
    bg: '#EBEBEB', // strictement neutre, R=G=B
    ink: '#111111',
    texture: 'canvas-weave', // trame tissée croisée
    textureOpacity: 0.1, // opacité 0.10 sur papier clair
  },
  dark: {
    bg: '#111111',
    paperCard: '#FFFFFF',
    texture: 'canvas-weave',
    textureOpacity: 0.14, // opacité 0.14 sur le noir
  },
  type: {
    body: 'EB Garamond', // sous-titres et corps d'insert
    display: 'Playfair Display', // mot vedette, en Bold Italic
  },
  // AUCUNE couleur. Aucune. Toute la palette est achromatique.
} as const;

/** Géométrie des templates d'insert (relevés au pixel sur la référence). */
export const inserts = {
  editorialType: {
    // Empilement typo à 3 niveaux, calé à gauche, tiers supérieur.
    marginLeft: 200,
    line1: { font: 'EB Garamond', weight: 400, style: 'normal', size: 58 },
    line2: { font: 'Playfair Display', weight: 700, style: 'italic', size: 145 }, // mot vedette
    line3: { font: 'EB Garamond', weight: 400, style: 'italic', size: 62 },
    revealFramesPerChar: 2,
  },
  notebookList: {
    // Carte blanche 900x1080 centrée, coin bas droit corné.
    card: { width: 900, height: 1080 },
    lineGap: 42, // lignes horizontales gris clair
    text: { font: 'EB Garamond', weight: 700, style: 'italic', size: 46 },
    unfoldFrames: 22, // dépliage diagonal depuis le coin haut gauche
    lineIntervalFrames: 20, // remplissage ligne par ligne
  },
  collageSubject: {
    // 1–2 photos découpées, beaucoup de vide.
    enterFrames: 18, // fondu 0→1 + échelle 0.85→1.0, easing sortant
    enterScaleFrom: 0.85,
  },
  collageScene: {
    subjectDelayFrames: 6, // fond en place, sujet en fondu échelle décalé
    enterFrames: 18,
  },
  objectReveal: {
    // Identique à CollageSubject.
    enterFrames: 18,
    enterScaleFrom: 0.85,
  },
} as const;

/** Traitement imposé à toute photo découpée entrant dans un insert (§11.3). */
export const cutoutTreatment = {
  desaturate: 1.0, // désaturation totale
  blackLift: 0.25, // noirs remontés à ~25 % de luminance
  whiteCeil: 0.9, // blancs descendus à ~90 %
  halftoneDotPx: 1.5, // trame de demi-teinte
  blurPx: 0.3, // très léger flou anti-numérique
} as const;

/** Trame tissée signature (§11.2). */
export const weave = {
  stepPx: 3, // pas de 3 px
  strokePx: 0.5, // trait 0.5 px
  angleDeg: 45, // hachures croisées à 45°
} as const;
