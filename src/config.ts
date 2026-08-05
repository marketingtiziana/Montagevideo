/**
 * config.ts — Source unique de vérité pour toutes les valeurs numériques
 * relevées "au pixel et à la frame" sur la vidéo de référence.
 *
 * Règle transversale du projet : LA RETENUE. En cas d'hésitation entre un
 * effet et son absence, on choisit l'absence. Ces constantes ne s'improvisent
 * pas — elles s'appliquent. Toute modification doit correspondre à une mesure
 * refaite sur la référence.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

/** Répertoires de travail (voir .gitignore : work/ et out/ ne sont pas versionnés). */
export const DIRS = {
  root: ROOT,
  work: path.join(ROOT, 'work'),
  out: path.join(ROOT, 'out'),
  cache: path.join(ROOT, 'work', '.cache'),
  raw: path.join(ROOT, 'raw'),
  assets: path.join(ROOT, 'assets'),
  cutouts: path.join(ROOT, 'assets', 'cutouts'),
} as const;

/** Format de sortie : reel vertical. */
export const OUTPUT = {
  width: 1080,
  height: 1920,
  fps: 30, // CFR imposé dès l'étape 1
} as const;

/** Étape 1 — Normalisation. */
export const NORMALIZE = {
  fps: 30,
  vsync: 'cfr' as const,
  audio: { sampleRate: 48000, bitDepth: 24, channels: 1 },
} as const;

/** Étape 2 — Transcription. */
export const TRANSCRIBE = {
  model: 'large-v3',
  lang: 'fr',
  alignment: 'forced' as const,
} as const;

/** Étape 3 — Nettoyage de la parole. */
export const CLEAN = {
  /** Critère de réussite : aucun silence > 250 ms sous -38 dB dans le rendu final. */
  maxSilenceMs: 250,
  maxSilenceFloorDb: -38,
  /** Détection acoustique. */
  silencedetect: { noiseDb: -34, minDurationS: 0.28 },
  rmsWindowMs: 20,
  /** Seuil adaptatif : bruit de fond médian + 8 dB. */
  adaptiveMarginDb: 8,
  /** Fusion des intervalles espacés de moins de ce seuil. */
  mergeGapMs: 120,
  /** Liste lexicale française des fillers isolés. */
  fillers: [
    'euh', 'euhh', 'heu', 'hum', 'hmm', 'bah', 'ben', 'bon bah',
    'du coup', 'en fait', 'voilà', 'tu vois', 'genre', 'je veux dire', 'comment dire',
  ],
  /** Valeurs de `reason` autorisées dans la sortie éditoriale de Claude. */
  reasons: [
    'filler', 'faux_depart', 'repetition', 'bafouillage',
    'phrase_abandonnee', 'silence_mort', 'bruit_parasite', 'hors_sujet',
  ] as const,
  /** Priorité de fusion (du plus fort au plus faible). */
  mergePriority: ['keep_overrides', 'claude', 'lexical', 'acoustic'] as const,
} as const;

/** Étape 4 — EDL. */
export const EDL = {
  /** Respiration conservée autour des blocs. */
  breathBeforeMs: 130,
  breathAfterMs: 180,
  /** Coupe minimale : en dessous on ne coupe pas. */
  minCutMs: 90,
  /** Silence maximal toléré ; au-delà ramené à target plutôt que supprimé. */
  maxSilenceMs: 250,
  maxSilenceTargetMs: 220,
  /** Zero-crossing : fenêtre de recherche autour du point audio. */
  zeroCrossWindowMs: 8,
  /** Crossfade audio obligatoire sur chaque jointure (anti-clic). */
  crossfadeMs: 18,
  /** Densité maximale de coupes. */
  maxCutsPerWindow: 3,
  maxCutsWindowS: 2,
} as const;

/** Étape 6 — Mastering audio. Cibles relevées sur la référence. */
export const AUDIO = {
  targetLUFS: -14.0,
  lufsTolerance: 0.5,
  lraMin: 3.0,
  lraMax: 4.0,
  truePeakDb: -1.0,
  chain: {
    highpassHz: 75,
    afftdn: { nr: 12, nf: -32, tn: 1 },
    deEsser: { lowHz: 5500, highHz: 9000, reductionDbMax: 4 },
    compressor: { threshold: -20, ratio: 3.5, attack: 8, release: 180, makeup: 2 },
    limiter: { limit: 0.89 },
    loudnorm: { I: -14, LRA: 4, TP: -1 },
  },
  /** Room tone : 500 ms de fond de salle réinjectés en boucle. */
  roomTone: { sampleMs: 500, levelDbFS: -58 },
} as const;

/** Étape 7 — Sous-titres. Géométrie mesurée sur 1080x1920. */
export const CAPTIONS = {
  fontFamily: 'EB Garamond', // ou Cormorant Garamond
  fontSize: 63,
  lineHeight: 75,
  textAlign: 'center' as const,
  /** Ancrage PAR LE BAS : ligne de base de la dernière ligne, en px depuis le bas. */
  baselineFromBottom: 627,
  textTransform: 'none' as const,
  letterSpacing: 0,
  weights: { line1: 400, line2: 700 },
  /** Passage à la ligne 2. */
  wrapAtWords: 4,
  wrapAtChars: 20,
  /** Effacement / redémarrage du bloc. */
  clearAtLine2Words: 4,
  clearAfterIdleMs: 400,
  /** Couleur adaptative pilotée par le type de plan (pas de détection de luminance). */
  colorOnDark: '#FFFFFF',
  shadowOnDark: '0 2px 10px rgba(0,0,0,0.45)',
  colorOnPaper: '#111111',
  shadowOnPaper: 'none',
  /** Animation : fondu d'opacité de 2 frames max, sans scale ni bounce. */
  fadeFrames: 2,
} as const;

/** Étape 8 — Plans et rythme. */
export const SHOTS = {
  /** Recadrages fixes du facecam (aucune dérive à l'intérieur d'un plan). */
  scales: { wide: 1.0, medium: 1.12, close: 1.26 },
  /** Densité de coupe. */
  cutIntervalMinS: 3,
  cutIntervalMaxS: 5,
  maxHoldS: 6,
  /** Répartition plein écran graphique (part de la durée totale). */
  graphicShareMin: 0.35,
  graphicShareMax: 0.4,
  /** Cadence des inserts. */
  insertIntervalMinS: 8,
  insertIntervalMaxS: 10,
  insertDurationMinS: 2,
  insertDurationMaxS: 11,
} as const;

/** Étape 12 — Étalonnage du facecam. */
export const GRADE = {
  saturation: 0.75,
  blackFloorPct: 12, // rien ne descend sous 12 % de luminance
  highlightCeilPct: 92,
  medianLumaTarget: 77, // sur 255
  redGainPct: 3,
  blueGainPct: -2,
} as const;

/** Étape 13 — QA bloquant. Bornes de validation. */
export const QA = {
  lufs: { min: -14.5, max: -13.5 },
  lra: { min: 2.5, max: 4.5 },
  truePeakMaxDb: -1.0,
  maxSilenceMs: 250,
  maxSilenceFloorDb: -38,
  minCutGapMs: 90,
  captionMaxLines: 2,
  captionMaxWordsPerLine: 4,
  captionBaselineFromBottom: 627,
  graphicShare: { min: 0.3, max: 0.45 },
  maxAvDriftFrames: 1,
  contactSheet: { tiles: 12 },
} as const;

/** Fichiers intermédiaires. */
export const FILES = {
  sourceWav: path.join(DIRS.work, 'source.wav'),
  normalizedMp4: path.join(DIRS.work, 'normalized.mp4'),
  transcript: path.join(DIRS.work, 'transcript.json'),
  editorial: path.join(DIRS.work, 'editorial.json'),
  edl: path.join(DIRS.work, 'edl.json'),
  cutMp4: path.join(DIRS.work, 'cut.mp4'),
  cutWav: path.join(DIRS.work, 'cut.wav'),
  audioMaster: path.join(DIRS.work, 'audio_master.wav'),
  audioReport: path.join(DIRS.work, 'audio_report.json'),
  captions: path.join(DIRS.work, 'captions.json'),
  shots: path.join(DIRS.work, 'shots.json'),
  gradedMp4: path.join(DIRS.work, 'facecam_graded.mp4'),
  finalMp4: path.join(DIRS.out, 'reel.mp4'),
  qaReport: path.join(DIRS.out, 'qa_report.json'),
  contactSheet: path.join(DIRS.out, 'contact_sheet.jpg'),
} as const;
