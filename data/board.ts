import type { BoardData } from "./types";

/**
 * Source de vérité du board. Aucun montant, aucun État recommandé.
 * Positions dans le canvas (origine en haut à gauche), aucune rotation.
 */
export const RED = "#D94A3D";
export const GREEN = "#3CA55C";
export const BLUE = "#2F6FE4";

export const board: BoardData = {
  title: "Comment fonctionne une LLC",
  size: { w: 1600, h: 2250 },
  showAnnotations: false,
  ui: {
    fit: "Tout voir",
    reset: "Réinitialiser",
    exportPng: "Export PNG",
    exporting: "Export en cours",
    hint: "Molette : zoom · glisser le fond : déplacer · glisser un élément : le bouger",
    photoCredit: "Photo",
    chatStatus: "en ligne",
    memePlaceholder: "Mème (public/board/memes)",
  },
  columns: [
    { id: "left", title: "LLC montée à l'arrache", color: RED, x: 330 },
    { id: "right", title: "LLC bien structurée", color: GREEN, x: 1130 },
  ],
  sections: [],
  elements: [
    // Gauche (rouge)
    { id: "l1-metric", type: "metric", column: "left", x: 270, y: 130, w: 290, z: 2, value: "Au hasard", label: "État choisi au hasard", trend: "down", tone: "bad", tick: true },
    {
      id: "l2-chat",
      type: "chat",
      column: "left",
      x: 110,
      y: 400,
      w: 340,
      contact: "Conseiller",
      messages: [
        { from: "me", text: "J'ai pris la LLC la moins chère.", time: "22:14" },
        { from: "me", text: "C'est quoi un registered agent ?", time: "22:16" },
        { from: "me", text: "J'ai payé mes courses avec le compte de la LLC.", time: "22:19" },
        { from: "me", text: "Le 5472 c'est quoi ?", time: "22:23" },
      ],
      tick: true,
    },
    { id: "l4-chip", type: "chip", column: "left", x: 300, y: 1230, w: 390, z: 2, text: "Courrier du registered agent : non lu", icons: ["mail", "bell", "alert"] },
    { id: "l5-metric", type: "metric", column: "left", x: 260, y: 1560, w: 320, z: 2, value: "0 impôt ?", label: "Croyait que LLC = zéro impôt", trend: "down", tone: "bad", tick: true },
    // Droite (verte)
    {
      id: "r7-flow",
      type: "flow",
      column: "right",
      x: 980,
      y: 90,
      w: 400,
      title: "Création d'une LLC",
      tag: "Trigger",
      nodes: [
        { label: "Choix de l'État", sub: "selon la situation", color: "#3CA55C" },
        { label: "Articles of Organization", sub: "l'acte de naissance", color: "#2F6FE4" },
        { label: "EIN", sub: "numéro fiscal fédéral", color: "#7C8CF8" },
        { label: "Operating Agreement", sub: "les règles internes", color: "#2BB39A" },
      ],
      tick: true,
    },
    {
      id: "r8-table",
      type: "table",
      column: "right",
      x: 1010,
      y: 500,
      w: 430,
      z: 2,
      title: "Qui fait quoi",
      rows: [
        { label: "Membre", text: "Propriétaire, perçoit les distributions." },
        { label: "Manager", text: "Gère au quotidien." },
        { label: "Registered Agent", text: "Adresse dans l'État, reçoit les courriers. Obligatoire." },
        { label: "Organizer", text: "Dépose les Articles." },
        { label: "Secretary of State", text: "Enregistre la LLC." },
        { label: "IRS", text: "Délivre l'EIN." },
      ],
      tick: true,
    },
    { id: "r9-doc", type: "doc", column: "right", x: 990, y: 920, w: 330, z: 1, header: "Document interne", title: "Operating Agreement", lines: ["Les règles internes : parts, décisions, distributions.", "Signé par tous les membres."], stamp: "Signé", tick: true },
    {
      id: "r10-flow",
      type: "flow",
      column: "right",
      x: 970,
      y: 1190,
      w: 400,
      title: "Trajet de l'argent",
      tag: "Auto-send",
      nodes: [
        { label: "Client paie", sub: "facture au nom de la LLC", color: "#2F6FE4" },
        { label: "Compte bancaire US", sub: "au nom de la LLC", color: "#0F1535" },
        { label: "Distribution", sub: "vers le compte perso", color: "#2BB39A" },
        { label: "Membre", sub: "déclare dans son pays de résidence", color: "#3CA55C" },
      ],
      tick: true,
    },
    {
      id: "r11-chart",
      type: "chart",
      column: "right",
      x: 1000,
      y: 1540,
      w: 380,
      z: 2,
      title: "Transparente par défaut",
      bars: [1, 0.86, 0.72, 0.58, 0.45],
      word: "TRANSPARENTE",
      legend: "La LLC ne paie pas l'impôt elle-même, le membre est imposé dans son pays de résidence.",
      tick: true,
    },
    {
      id: "r12-flow",
      type: "flow",
      column: "right",
      x: 970,
      y: 1870,
      w: 420,
      title: "Chaque année",
      tag: "Auto-send",
      nodes: [
        { label: "Annual report ou taxe de l'État", sub: "selon l'État", color: "#3CA55C" },
        { label: "Form 5472 + 1120 pro forma", sub: "LLC à membre unique étranger", color: "#2F6FE4" },
        { label: "Registered agent renouvelé", sub: "adresse dans l'État à jour", color: "#0F1535" },
      ],
      tick: true,
    },
  ],
  arrows: [
    { from: "l2-chat", to: "r8-table" },
    { from: "l5-metric", to: "r11-chart" },
    { from: "l4-chip", to: "r12-flow" },
  ],
};
