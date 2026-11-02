import type { BoardData } from "./types";

/**
 * Source de vérité du canvas. Aucun chiffre ni montant réel.
 * Texte court : un titre et une ligne au plus par élément.
 */
export const NAVY = "#0F1535";
export const INDIGO = "#4F6BFF";

export const board: BoardData = {
  title: "Comment fonctionne une LLC",
  center: { label: "LLC", sub: "Limited Liability Company", size: 300 },
  ui: {
    recenter: "Recentrer",
    zoomGroup: "Groupe",
    export: "Exporter",
    exportScene: "Fichier .excalidraw",
    exportPng: "PNG 2x",
    exportSvg: "SVG",
    hint: "H : masquer la barre",
    loading: "Chargement du tableau",
  },
  groups: [
    { id: "acteurs", title: "Les acteurs", color: "#3FA9F5", fill: "#E6F3FD", angle: 180, radius: 2000, zone: { w: 2000, h: 1700 } },
    { id: "documents", title: "Les documents", color: "#64748B", fill: "#E8EDF5", angle: 272, radius: 1500, zone: { w: 1500, h: 900 } },
    { id: "argent", title: "L'argent", color: "#2BB39A", fill: "#DFF5EE", angle: 10, radius: 1900, zone: { w: 1500, h: 1300 } },
    { id: "fiscalite", title: "La fiscalité", color: "#7C8CF8", fill: "#E8ECFF", angle: 62, radius: 1900, zone: { w: 1200, h: 1000 } },
    { id: "annee", title: "Chaque année", color: "#1E3A8A", fill: "#E2E8F0", angle: 108, radius: 1700, zone: { w: 1300, h: 1000 } },
    { id: "pieges", title: "Les pièges", color: "#4F6BFF", fill: "#E8ECFF", angle: 140, radius: 1500, zone: { w: 900, h: 700 } },
  ],
  images: [
    { id: "personne", imageQuery: "person standing front view holding phone isolated on white background", cutout: true, label: "Personne (membre)", width: 300, aspect: 0.7 },
    { id: "telephone", imageQuery: "smartphone isolated on white background", cutout: true, label: "Téléphone", width: 180, aspect: 0.55 },
    { id: "laptop", imageQuery: "open laptop isolated on white background", cutout: true, label: "Laptop ouvert", width: 360, aspect: 1.4 },
    { id: "passeport", imageQuery: "passport isolated on white background", cutout: true, label: "Passeport", width: 240, aspect: 1.3 },
    { id: "documents-pile", imageQuery: "stack of paper documents isolated on white background", cutout: true, label: "Pile de documents", width: 300, aspect: 1.2 },
    { id: "enveloppe", imageQuery: "official envelope letter isolated on white background", cutout: true, label: "Enveloppe officielle", width: 280, aspect: 1.5 },
    { id: "carte", imageQuery: "credit card isolated on white background", cutout: true, label: "Carte bancaire", width: 280, aspect: 1.6 },
    { id: "batiment", imageQuery: "government building with columns isolated on white background", cutout: true, label: "Bâtiment à colonnes", width: 380, aspect: 1.5 },
    { id: "calendrier", imageQuery: "desk calendar isolated on white background", cutout: true, label: "Calendrier", width: 280, aspect: 1.1 },
    { id: "tampon", imageQuery: "rubber stamp isolated on white background", cutout: true, label: "Tampon encreur", width: 220, aspect: 1.2 },
    { id: "stylo", imageQuery: "fountain pen isolated on white background", cutout: true, label: "Stylo", width: 220, aspect: 2.2 },
    { id: "boite-lettres", imageQuery: "mailbox isolated on white background", cutout: true, label: "Boîte aux lettres", width: 240, aspect: 0.9 },
    { id: "skyline", imageQuery: "new york skyline blue dusk", cutout: false, label: "Skyline US", width: 420, aspect: 1.5 },
    { id: "capitole", imageQuery: "state capitol building dome", cutout: false, label: "Capitole d'État", width: 400, aspect: 1.4 },
    { id: "bureau", imageQuery: "entrepreneur desk laptop minimal office", cutout: false, label: "Bureau d'entrepreneur", width: 400, aspect: 1.5 },
    { id: "guichet", imageQuery: "administrative office counter desk", cutout: false, label: "Guichet administratif", width: 380, aspect: 1.5 },
    { id: "coworking", imageQuery: "coworking space people laptops", cutout: false, label: "Coworking", width: 400, aspect: 1.5 },
    { id: "banque-ecran", imageQuery: "online banking app screen laptop", cutout: false, label: "Banque en ligne", width: 400, aspect: 1.5 },
    { id: "drapeau", imageQuery: "american flag waving blue sky", cutout: false, label: "Drapeau US", width: 360, aspect: 1.5 },
  ],
  elements: [
    // Groupe 1 : les acteurs
    { type: "block", id: "membre", group: "acteurs", title: "Membre", line: "Propriétaire, seul ou à plusieurs. Perçoit les distributions.", image: "personne" },
    { type: "block", id: "manager", group: "acteurs", title: "Manager", line: "Dirige au quotidien.", image: "bureau" },
    { type: "block", id: "agent", group: "acteurs", title: "Registered Agent", line: "Adresse dans l'État, reçoit le courrier officiel. Obligatoire.", image: "boite-lettres" },
    { type: "block", id: "organizer", group: "acteurs", title: "Organizer", line: "Dépose les Articles of Organization.", image: "stylo" },
    { type: "block", id: "sos", group: "acteurs", title: "Secretary of State", line: "Enregistre la LLC, reçoit l'annual report.", image: "batiment" },
    { type: "block", id: "irs", group: "acteurs", title: "IRS", line: "Délivre l'EIN.", image: "guichet" },
    { type: "image", id: "img-passeport", group: "acteurs", image: "passeport" },
  ],
  links: [
    { from: "membre", to: "llc", label: "possède", group: "acteurs" },
    { from: "manager", to: "llc", label: "dirige", group: "acteurs" },
    { from: "agent", to: "llc", label: "reçoit le courrier", group: "acteurs" },
    { from: "organizer", to: "llc", label: "crée", group: "acteurs" },
    { from: "sos", to: "llc", label: "enregistre", group: "acteurs" },
    { from: "irs", to: "llc", label: "délivre l'EIN", group: "acteurs" },
    { from: "img-passeport", to: "membre", group: "acteurs" },
  ],
};
