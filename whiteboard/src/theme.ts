/**
 * Charte graphique du reel "whiteboard".
 * Un seul accent couleur autorise : le surligneur jaune.
 */
export const THEME = {
  paper: '#FAFAF7',
  ink: '#1A1A1A',
  inkSoft: '#3A3A3A',
  highlight: '#FFE066',
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Zones de securite Instagram : rien au dessus ni en dessous. */
export const SAFE = {
  top: 220,
  bottom: 250,
} as const;

/** Epaisseurs de trait (px) */
export const STROKE = {
  thin: 4,
  normal: 5,
  bold: 6,
} as const;

export const FONT_FAMILY = 'Caveat';
