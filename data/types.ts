/**
 * Modèle de données du tableau 16:9 « Comment fonctionne une LLC ».
 * Tout le contenu affiché vient de data/board.ts.
 */
export type GroupId = "acteurs" | "documents" | "argent" | "fiscalite" | "annee" | "pieges";

export type NoteTone = "indigo" | "sky" | "slate" | "mint";

export type IconName =
  | "users"
  | "user-cog"
  | "map-pin"
  | "file-signature"
  | "landmark"
  | "building"
  | "globe"
  | "scroll"
  | "receipt"
  | "calendar"
  | "wallet"
  | "laptop"
  | "credit-card"
  | "mail"
  | "user"
  | "image"
  | "file-text";

export interface Group {
  id: GroupId;
  title: string;
  /** Couleur des liens du groupe. */
  color: string;
  /** Position de l'intitulé du groupe sur le cadre (optionnel). */
  labelAt?: { x: number; y: number; rotate?: number };
}

interface Base {
  id: string;
  group: GroupId;
  /** Position et largeur dans le cadre 1920x1080 (un léger jitter déterministe s'ajoute). */
  x: number;
  y: number;
  w: number;
  /** Rotation imposée en degrés, sinon tirée entre -3 et 3. */
  rotate?: number;
}

export interface CutoutElement extends Base {
  type: "cutout";
  /** Requête Pexels : objet sur fond uni pour un détourage propre. */
  imageQuery: string;
  alt: string;
  /** Ratio largeur / hauteur du bloc de repli (sans image). */
  aspect?: number;
  icon: IconName;
}

export interface PhotoElement extends Base {
  type: "photo";
  imageQuery: string;
  caption: string;
  aspect?: number;
  icon?: IconName;
}

export interface RoleElement extends Base {
  type: "role";
  icon: IconName;
  name: string;
  line: string;
}

export interface DocElement extends Base {
  type: "doc";
  title: string;
  subtitle: string;
  stamp?: string;
  /** Nombre de lignes grises simulant le texte. */
  lines?: number;
}

export type SchemaSpec =
  | {
      kind: "org";
      members: string;
      llc: string;
      manager: string;
      agent: string;
      sos: string;
      irs: string;
    }
  | { kind: "money"; steps: string[]; arrows: string[] }
  | { kind: "transparency"; llc: string; llcLine: string; member: string; memberLine: string; through: string };

export interface SchemaElement extends Base {
  type: "mini-schema";
  title: string;
  schema: SchemaSpec;
}

export interface NoteElement extends Base {
  type: "note";
  tone: NoteTone;
  title: string;
  line?: string;
  /** Petites puces (titres seuls), pour regrouper plusieurs points courts. */
  chips?: string[];
}

export type BoardElement = CutoutElement | PhotoElement | RoleElement | DocElement | SchemaElement | NoteElement;

export interface Link {
  /** Identifiant d'élément, ou "llc" pour le nœud central. */
  from: string;
  to: string;
  label?: string;
  group: GroupId;
  /** Courbure du lien, de -1 à 1 (0 : presque droit). */
  bend?: number;
}

export interface BoardData {
  title: string;
  brand: string;
  center: { x: number; y: number; size: number; label: string; sub: string };
  groups: Group[];
  elements: BoardElement[];
  links: Link[];
  ui: {
    exportPng: string;
    exportPdf: string;
    exporting: string;
    fullscreen: string;
    hide: string;
    hint: string;
    photoCredit: string;
  };
}

export interface BoardAssets {
  /** Photos et sources de cutouts téléchargées (public/board/raw) : id -> crédit. */
  raw: Record<string, { photographer: string; url: string }>;
  /** Cutouts détourés (public/board/cutouts) : id -> dimensions du PNG. */
  cutouts: Record<string, { width: number; height: number }>;
}
