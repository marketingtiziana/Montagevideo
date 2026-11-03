import type { BoardData } from "./types";

/**
 * Source de vérité du board « La boîte ne bouge pas, toi oui ».
 * Aucun montant, aucun taux, aucune condition fiscale écrite. Seuls « Dubaï » (bulle de la cible)
 * et « Royaume-Uni » (flux) sont nommés.
 */
const RED = "#D94A3D";
const GREEN = "#3CA55C";

export const board: BoardData = {
  title: "La boîte ne bouge pas, toi oui",
  size: { w: 1600, h: 2950 },
  showAnnotations: false,
  tools: true,
  ui: {
    fit: "Tout voir",
    reset: "Réinitialiser",
    exportPng: "Export PNG",
    exporting: "Export en cours",
    hint: "H : masquer l'interface",
    photoCredit: "Photo",
    chatStatus: "en ligne",
    memePlaceholder: "Mème",
    hide: "Masquer l'interface",
  },
  columns: [
    { id: "left", title: "Tout empilé dans un seul pays", color: RED, x: 330 },
    { id: "right", title: "Dissocié", color: GREEN, x: 1130 },
  ],
  sections: [],
  elements: [
    // Gauche (rouge), tout au même endroit
    { id: "l1-metric", type: "metric", column: "left", x: 260, y: 120, w: 310, z: 2, value: "1", label: "Pays de résidence possibles", trend: "down", tone: "bad", tick: true },
    {
      id: "l3-map",
      type: "worldmap",
      column: "left",
      x: 120,
      y: 880,
      w: 430,
      z: 1,
      pins: [{ lat: 25.2, lon: 55.3, color: RED, stack: ["boîte", "résidence", "banque", "famille"] }],
      legend: "Tout au même endroit.",
      tick: true,
    },
    // Droite (verte), dissocié
    {
      id: "r9-postit",
      type: "postit",
      column: "right",
      x: 990,
      y: 110,
      w: 340,
      z: 2,
      color: "#DDF5E3",
      size: 21,
      text: "« Donc en gros je peux vivre où je veux et la boîte reste imposée au même endroit ? C'est hyper souple en fait. »",
    },
    {
      id: "r11-map",
      type: "worldmap",
      column: "right",
      x: 990,
      y: 860,
      w: 440,
      z: 1,
      pins: [
        { lat: 51.5, lon: -0.1, color: "#1d1d1f", label: "la boîte" },
        { lat: 19.4, lon: -99.1, color: GREEN, label: "toi" },
        { lat: -34.6, lon: -58.4, color: GREEN, label: "toi" },
        { lat: 38.7, lon: -9.1, color: GREEN, label: "toi" },
        { lat: -33.9, lon: 18.4, color: GREEN, label: "toi" },
        { lat: 41.7, lon: 44.8, color: GREEN, label: "toi" },
        { lat: 13.7, lon: 100.5, color: GREEN, label: "toi" },
        { lat: -8.4, lon: 115.2, color: GREEN, label: "toi" },
      ],
      legend: "La boîte reste au même endroit, toi tu choisis.",
      tick: true,
    },
  ],
  arrows: [{ from: "l3-map", to: "r11-map" }],
};
