/**
 * Modèle de données du canvas Excalidraw « Comment fonctionne une LLC ».
 * Tout le contenu vient de data/board.ts ; la scène est générée par scripts/build-scene.ts.
 */
export type GroupId = "acteurs" | "documents" | "argent" | "fiscalite" | "annee" | "pieges";

export interface Group {
  id: GroupId;
  title: string;
  /** Couleur des flèches du groupe. */
  color: string;
  /** Fond très clair des blocs du groupe. */
  fill: string;
  /** Direction du groupe autour du nœud central (degrés, 0 = droite, 90 = bas). */
  angle: number;
  /** Distance du centre du groupe au nœud central. */
  radius: number;
  /** Taille de la zone d'éparpillement du groupe. */
  zone: { w: number; h: number };
}

export interface ImageSpec {
  id: string;
  /** Requête Pexels. Les cutouts demandent un objet sur fond uni. */
  imageQuery: string;
  cutout: boolean;
  /** Nom affiché sur le rectangle de repli sans image. */
  label: string;
  /** Largeur dans la scène. */
  width: number;
  /** Ratio largeur / hauteur du repli (remplacé par celui de l'image réelle). */
  aspect: number;
}

interface Base {
  id: string;
  group: GroupId;
}

export interface BlockElement extends Base {
  type: "block";
  title: string;
  line?: string;
  /** Image (cutout ou photo) posée à côté du bloc. */
  image?: string;
}

export interface NoteElement extends Base {
  type: "note";
  title: string;
  line?: string;
}

export interface ImageElement extends Base {
  type: "image";
  image: string;
}

export type SchemaSpec =
  | { kind: "org"; members: string; llc: string; manager: string; agent: string; sos: string; irs: string; edges: { owns: string; manages: string; registers: string; ein: string; agent: string } }
  | { kind: "money"; steps: string[]; arrows: string[] }
  | { kind: "transparency"; llc: string; llcLine: string; member: string; memberLine: string; through: string }
  | { kind: "timeline"; steps: string[] }
  | { kind: "calendar"; items: { when: string; label: string }[] };

export interface SchemaElement extends Base {
  type: "schema";
  title: string;
  schema: SchemaSpec;
}

export type BoardElement = BlockElement | NoteElement | ImageElement | SchemaElement;

export interface Link {
  /** Identifiant d'élément, ou "llc" pour le nœud central. */
  from: string;
  to: string;
  label?: string;
  group: GroupId;
}

export interface BoardData {
  title: string;
  center: { label: string; sub: string; size: number };
  groups: Group[];
  images: ImageSpec[];
  elements: BoardElement[];
  links: Link[];
  ui: {
    recenter: string;
    zoomGroup: string;
    export: string;
    exportScene: string;
    exportPng: string;
    exportSvg: string;
    hint: string;
    loading: string;
  };
}

/** Images réellement disponibles (écrit par scripts/build-scene.ts dans public/board/assets.json). */
export interface SceneAssets {
  images: Record<string, { file: string; width: number; height: number; mimeType: string }>;
}
