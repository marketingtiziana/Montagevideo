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
    { id: "s2", text: "2 · Les acteurs", x: 650, y: 860 },
    { id: "s3", text: "3 · Les documents", x: 640, y: 1760 },
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
    { id: "c1-cutout-passeport", type: "cutout", column: "right", x: 1360, y: 430, w: 190, z: 3, imageQuery: "passport isolated on white background", cutout: true, alt: "Passeport", aspect: 1.3 },
    // 2. Les acteurs
    { id: "c2-doc-membre", type: "doc", column: "right", x: 980, y: 900, w: 300, z: 1, header: "Rôle", title: "Membre", lines: ["Propriétaire, seul ou à plusieurs.", "Perçoit les distributions."], tick: true },
    { id: "c2-doc-manager", type: "doc", column: "right", x: 1080, y: 1020, w: 300, z: 2, header: "Rôle", title: "Manager", lines: ["Gère au quotidien.", "Membre ou personne désignée."] },
    { id: "c2-doc-agent", type: "doc", column: "right", x: 1000, y: 1140, w: 320, z: 3, header: "Rôle · obligatoire", title: "Registered Agent", lines: ["Adresse physique dans l'État.", "Reçoit les courriers officiels."], stamp: "Obligatoire" },
    { id: "c2-doc-organizer", type: "doc", column: "right", x: 1110, y: 1260, w: 300, z: 4, header: "Rôle", title: "Organizer", lines: ["Dépose les Articles of Organization."] },
    { id: "c2-doc-sos", type: "doc", column: "right", x: 1020, y: 1380, w: 320, z: 5, header: "Administration", title: "Secretary of State", lines: ["Enregistre la LLC.", "Reçoit l'annual report."] },
    { id: "c2-doc-irs", type: "doc", column: "right", x: 1130, y: 1500, w: 300, z: 6, header: "Administration", title: "IRS", lines: ["Délivre l'EIN, le numéro fiscal fédéral."], stamp: "EIN" },
    { id: "c2-photo-courrier", type: "photo", column: "left", x: 130, y: 900, w: 330, imageQuery: "pile of unopened mail envelopes", caption: "Pile de courrier non ouvert", aspect: 1.4, tick: true },
    { id: "c2-chip", type: "chip", column: "left", x: 290, y: 1170, w: 390, z: 2, text: "Courrier du registered agent : non lu", icons: ["mail", "bell", "alert"] },
    { id: "c2-cutout-enveloppe", type: "cutout", column: "left", x: 470, y: 1250, w: 210, z: 3, imageQuery: "official envelope letter isolated on white background", cutout: true, alt: "Enveloppe officielle", aspect: 1.5 },
    // 3. Les documents
    { id: "c3-doc-articles", type: "doc", column: "right", x: 990, y: 1800, w: 330, z: 1, header: "Secretary of State", title: "Articles of Organization", lines: ["L'acte de naissance de la LLC.", "Déposés par l'Organizer."], stamp: "Enregistré", tick: true },
    { id: "c3-doc-oa", type: "doc", column: "right", x: 1150, y: 1980, w: 310, z: 2, header: "Document interne", title: "Operating Agreement", lines: ["Les règles internes : parts, décisions, distributions."], stamp: "Signé" },
    { id: "c3-doc-ein", type: "doc", column: "right", x: 1010, y: 2170, w: 320, z: 3, header: "Internal Revenue Service", title: "Lettre EIN", lines: ["Le numéro fiscal fédéral de la LLC."], stamp: "EIN" },
    { id: "c3-cutout-tampon", type: "cutout", column: "right", x: 1360, y: 2200, w: 170, z: 4, imageQuery: "rubber stamp isolated on white background", cutout: true, alt: "Tampon", aspect: 1.2 },
    { id: "c3-photo-signe", type: "photo", column: "right", x: 1390, y: 1740, w: 200, imageQuery: "signed contract document pen desk", caption: "Document signé", aspect: 1.3 },
    {
      id: "c3-chat",
      type: "chat",
      column: "left",
      x: 120,
      y: 1810,
      w: 340,
      contact: "Conseiller",
      messages: [
        { from: "me", text: "C'est quoi un Operating Agreement ? La banque me le demande.", time: "10:02" },
        { from: "them", text: "Le règlement intérieur de ta LLC : qui détient quoi, qui décide, comment l'argent est distribué.", time: "10:05" },
        { from: "me", text: "Je n'en ai jamais signé.", time: "10:05" },
        { from: "them", text: "Même seul, il en faut un. On le rédige cette semaine.", time: "10:08" },
      ],
      tick: true,
    },
  ],
  arrows: [{ from: "c3-chat", to: "c3-doc-oa" }],
};
