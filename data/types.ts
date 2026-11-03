/**
 * Modèle de données du board « LLC » à deux colonnes (rouge : montée à l'arrache,
 * verte : bien structurée). Tout le contenu vient de data/board.ts.
 */
export type Column = "left" | "right";

export type IconName = "mail" | "bell" | "alert" | "file" | "wallet" | "calendar" | "user" | "building" | "check" | "x" | "landmark" | "receipt" | "laptop" | "credit-card" | "image" | "sparkles";

export interface ColumnSpec {
  id: Column;
  title: string;
  color: string;
  /** Abscisse de la ligne verticale. */
  x: number;
}

export interface SectionLabel {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface Base {
  id: string;
  column: Column;
  x: number;
  y: number;
  w: number;
  /** Ordre d'empilement en cas de chevauchement. */
  z?: number;
  /** Petit trait horizontal entre la ligne et l'élément. */
  tick?: boolean;
}

export interface MetricElement extends Base {
  type: "metric";
  value: string;
  label: string;
  trend: "up" | "down" | "flat";
  tone: "good" | "bad";
}

export interface FlowElement extends Base {
  type: "flow";
  title: string;
  tag: string;
  nodes: { label: string; sub?: string; color: string }[];
}

export interface ChatElement extends Base {
  type: "chat";
  contact: string;
  messages: { from: "me" | "them"; text: string; time: string }[];
}

export interface ChipElement extends Base {
  type: "chip";
  text: string;
  stat?: string;
  icons: IconName[];
}

export interface ChartElement extends Base {
  type: "chart";
  title: string;
  /** Hauteurs relatives, de 0 à 1, sans valeurs affichées. */
  bars: number[];
  word: string;
  legend?: string;
}

export interface TableElement extends Base {
  type: "table";
  title?: string;
  rows: { label: string; text: string }[];
}

export interface DocElement extends Base {
  type: "doc";
  header: string;
  title: string;
  lines: string[];
  stamp?: string;
}

export interface PhotoElement extends Base {
  type: "photo";
  imageQuery: string;
  caption?: string;
  aspect: number;
}

export interface CutoutElement extends Base {
  type: "cutout";
  imageQuery: string;
  cutout: true;
  alt: string;
  aspect: number;
}

export interface MemeElement extends Base {
  type: "meme";
  caption?: string;
}

export interface ScribbleElement extends Base {
  type: "scribble";
  kind: "circle" | "arrow" | "squiggle";
  color: string;
  h: number;
}

export type BoardElement =
  | TableElement
  | MetricElement
  | FlowElement
  | ChatElement
  | ChipElement
  | ChartElement
  | DocElement
  | PhotoElement
  | CutoutElement
  | MemeElement
  | ScribbleElement;

export interface Arrow {
  from: string;
  to: string;
  label?: string;
}

export interface BoardData {
  title: string;
  size: { w: number; h: number };
  columns: ColumnSpec[];
  sections: SectionLabel[];
  elements: BoardElement[];
  arrows: Arrow[];
  showAnnotations: boolean;
  ui: {
    fit: string;
    reset: string;
    exportPng: string;
    exporting: string;
    hint: string;
    photoCredit: string;
    chatStatus: string;
    memePlaceholder: string;
  };
}

export interface BoardAssets {
  raw: Record<string, { photographer: string; url: string }>;
  cutouts: Record<string, { width: number; height: number }>;
  memes: string[];
}
