import type { BoardData } from "./types";

/**
 * Source de vérité du board. Aucun montant, aucun nom d'État recommandé.
 * Positions dans le canvas (origine en haut à gauche), aucune rotation.
 */
export const RED = "#D94A3D";
export const GREEN = "#3CA55C";
export const BLUE = "#2F6FE4";

export const board: BoardData = {
  title: "Comment fonctionne une LLC",
  size: { w: 1600, h: 5400 },
  showAnnotations: false,
  ui: {
    fit: "Tout voir",
    reset: "Réinitialiser",
    exportPng: "Export PNG",
    exporting: "Export en cours",
    hint: "Molette : zoom · glisser le fond : déplacer · glisser un élément : le bouger",
    photoCredit: "Photo",
    chatStatus: "en ligne",
  },
  columns: [
    { id: "left", title: "LLC montée à l'arrache", color: RED, x: 330 },
    { id: "right", title: "LLC bien structurée", color: GREEN, x: 1130 },
  ],
  sections: [
    { id: "s1", text: "1 · Création", x: 660, y: 90 },
  ],
  elements: [
    // 1. Création
    {
      id: "c1-chat",
      type: "chat",
      column: "left",
      x: 110,
      y: 130,
      w: 340,
      contact: "Conseiller",
      messages: [
        { from: "me", text: "J'ai pris la LLC la moins chère, sans savoir dans quel État.", time: "22:14" },
        { from: "them", text: "L'État choisi change les frais, l'annual report et la confidentialité. Tu sais lequel c'est ?", time: "22:20" },
        { from: "me", text: "Aucune idée, c'était sur une pub.", time: "22:21" },
        { from: "them", text: "On regarde ça ensemble avant d'aller plus loin.", time: "22:25" },
      ],
      tick: true,
    },
    { id: "c1-metric-left", type: "metric", column: "left", x: 300, y: 600, w: 290, z: 2, value: "Au hasard", label: "État de création choisi", trend: "down", tone: "bad", tick: true },
    {
      id: "c1-flow",
      type: "flow",
      column: "right",
      x: 960,
      y: 130,
      w: 430,
      title: "Création d'une LLC",
      tag: "Trigger",
      nodes: [
        { label: "Choix de l'État", sub: "selon la situation", color: "#3CA55C" },
        { label: "Articles of Organization", sub: "l'acte de naissance", color: "#2F6FE4" },
        { label: "EIN", sub: "numéro fiscal fédéral", color: "#7C8CF8" },
        { label: "Operating Agreement", sub: "les règles internes", color: "#2BB39A" },
        { label: "Banque", sub: "compte au nom de la LLC", color: "#0F1535" },
      ],
      tick: true,
    },
    { id: "c1-metric-right", type: "metric", column: "right", x: 1180, y: 640, w: 300, z: 2, value: "3", label: "Rôles clairs : Membre / Manager / Registered Agent", trend: "up", tone: "good", tick: true },
    { id: "c1-photo-desk", type: "photo", column: "right", x: 1400, y: 20, w: 190, imageQuery: "clean minimal desk laptop plant", caption: "Bureau propre", aspect: 1.3 },
  ],
  arrows: [],
};
