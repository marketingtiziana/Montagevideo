// Palette & constantes de design — froid/premium (interdits: pas d'or, chaud, orange)
export const THEME = {
  accent: "#3BE8FF", // cyan électrique (remplace le jaune de l'ancien pipeline)
  accentDeep: "#0EA5C6",
  white: "#FFFFFF",
  ink: "#05070A", // contour / ombre
  danger: "#FF3B5C", // rouge froid pour l'alerte "fausse expat"
  stroke: "#000000",
} as const;

export const CAPTION = {
  fontFamily: "Inter",
  weight: 900,
  sizePx: 92,
  tracking: -0.02, // em
  strokePx: 8,
  maxWords: 3,
  // Zone sûre : bas du bloc jamais sous y=1640, jamais dans les 280px du bas.
  blockCenterY: 1300,
  safeBottomY: 1640,
} as const;

// Mots-clés toujours en accent (secours si edit.json ne les a pas marqués)
export const cubicExpoOut = "cubic-bezier(0.16, 1, 0.3, 1)";
