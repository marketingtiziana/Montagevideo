import type { BoardData } from "./types";

/**
 * Source de vérité du board « Accompagné dans la durée ».
 * Aucun délai chiffré ni promesse chiffrée à droite, aucun conseil de structure écrit.
 */
const RED = "#D94A3D";
const GREEN = "#3CA55C";

export const board: BoardData = {
  title: "Accompagné dans la durée",
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
    { id: "left", title: "Aujourd'hui : seul après la signature", color: RED, x: 330 },
    { id: "right", title: "Accompagné dans la durée", color: GREEN, x: 1130 },
  ],
  sections: [],
  elements: [
    // Gauche (rouge), aujourd'hui
    { id: "l1-metric", type: "metric", column: "left", x: 260, y: 120, w: 310, z: 2, value: "Jusqu'à la signature", label: "Accompagnement", trend: "down", tone: "bad", tick: true },
    {
      id: "l2-chat",
      type: "chat",
      column: "left",
      x: 110,
      y: 400,
      w: 340,
      contact: "Cabinet",
      messages: [
        { from: "me", text: "J'ai monté ma structure parce qu'un pote expat m'a dit que c'était le mieux.", time: "lun. 09:12" },
        { from: "me", text: "Je sais même pas si c'était le bon choix.", time: "lun. 09:13" },
        { from: "me", text: "Depuis la signature, plus personne.", time: "mar. 18:40" },
        { from: "me", text: "J'ai une question simple et j'attends depuis mardi.", time: "ven. 11:05" },
      ],
      tick: true,
    },
    {
      id: "l4-postit",
      type: "postit",
      column: "left",
      x: 250,
      y: 1250,
      w: 330,
      z: 3,
      color: "#FFF1A8",
      size: 21,
      text: "« Quand j'ai une question sur ma boîte, je veux pas attendre deux jours une réponse d'un avocat injoignable. »",
    },
    // Droite (verte), accompagné
    {
      id: "r10-flow",
      type: "flow",
      column: "right",
      x: 980,
      y: 380,
      w: 400,
      title: "Une question, un suivi",
      tag: "Auto-send",
      nodes: [
        { label: "Question posée", sub: "par message ou par mail", color: "#2F6FE4" },
        { label: "Réponse de l'équipe", sub: "quelqu'un répond", color: "#3CA55C" },
        { label: "Suivi noté dans le dossier", sub: "rien ne se perd", color: "#0F1535" },
        { label: "Prochain point planifié", sub: "la suite est calée", color: "#2BB39A" },
      ],
      tick: true,
    },
  ],
  arrows: [],
};
